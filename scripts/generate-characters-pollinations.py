#!/usr/bin/env python3
"""
Generate AI character frames via Pollinations.ai (FLUX model, free, no auth).
Drop-in replacement for scripts/generate-characters.py — no GPU/torch needed.
Stdlib only (urllib, hashlib, concurrent.futures, subprocess).

Usage:
    python3 scripts/generate-characters-pollinations.py            # all chars
    python3 scripts/generate-characters-pollinations.py --char moti
    python3 scripts/generate-characters-pollinations.py --jobs 8   # more parallelism

Output: public/characters/{character}/{pose}_{expression}.png  (with alpha if magick available)

Resumable: skips files that already exist non-empty.
Deterministic: per-character seed locked, per-(pose,expr) seed offset is sha1 of name.
"""
from __future__ import annotations
import argparse
import concurrent.futures as cf
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
OUTDIR = PROJECT / "public" / "characters"
OUTDIR.mkdir(parents=True, exist_ok=True)

STYLE_HUMAN = (
    "indian cartoon character, chhota bheem style anime-lite, cel-shaded, "
    "thick black outlines, vibrant warm colors, pure flat white background, "
    "full body shot front-facing, big expressive eyes, south asian features, "
    "single character only centered, professional childrens animation, no shadow"
)
STYLE_ANIMAL = (
    "Disney 2D animation style, cute anthropomorphic cartoon animal, "
    "cel-shaded, thick black outlines, vibrant friendly colors, pure flat white background, "
    "full body shot front-facing, big expressive eyes, "
    "single character only centered, professional childrens animation, no shadow"
)
NEGATIVE = (
    "realistic, photorealistic, 3d render, blurry, deformed, extra limbs, "
    "text, watermark, multiple characters, gradient, dark, scary, human child near pet"
)

CHARACTERS = {
    "arjun":   {"desc": "young indian boy age 10, spiky brown hair, burnt amber orange tunic, golden scarf, tilak on forehead, brave",                                "seed": 100042, "kind": "human"},
    "meera":   {"desc": "young indian girl age 10, long black braid with white flower, blue salwar kameez, bindi, intelligent",                                       "seed": 200042, "kind": "human"},
    "bablu":   {"desc": "chubby round indian boy age 9, messy brown hair, sage green kurta, brown belt, goofy cheerful",                                              "seed": 300042, "kind": "human"},
    "guruji":  {"desc": "elderly indian sage age 70, bald with white topknot, long white beard, cream dhoti shawl, wooden staff, wise",                               "seed": 400042, "kind": "human"},
    "kaaliya": {"desc": "indian boy villain age 12, slicked back dark purple hair, dark purple high collar outfit, scar on cheek, menacing",                          "seed": 500042, "kind": "human"},
    "amma":    {"desc": "indian mother age 35, hair in bun with jasmine, dusty rose pink sari with peach border, sindoor bindi, gold bangles, warm",                  "seed": 600042, "kind": "human"},
    "raja":    {"desc": "indian king age 45, ornate golden crown with red jewel, burgundy royal robes, scepter, regal commanding",                                    "seed": 700042, "kind": "human"},
    "moti":    {"desc": "small brown puppy dog with tan belly fur, big floppy droopy ears, red collar with golden bell, fluffy curly tail, four paws",               "seed": 800042, "kind": "animal"},
}

POSE_EXPRESSIONS = {
    "idle_stand":   ["neutral", "happy", "sad", "angry", "surprised", "thinking", "determined"],
    "talk_gesture": ["neutral", "happy", "angry", "determined"],
    "point":        ["angry", "determined", "surprised"],
    "surprised":    ["surprised", "scared"],
    "sad":          ["sad"],
    "laugh":        ["happy"],
    "think":        ["thinking"],
    "wave":         ["happy"],
    "celebrate":    ["happy"],
}

POSE_PROMPTS = {
    "idle_stand":   "standing upright, arms relaxed at sides, facing forward",
    "talk_gesture": "one hand raised gesturing while talking, slight lean forward",
    "point":        "arm extended pointing forward, determined stance",
    "surprised":    "hands up near face, leaning back, shocked pose",
    "sad":          "slumped shoulders, looking down, dejected pose",
    "laugh":        "head tilted back laughing, hands on belly, joyful",
    "think":        "hand on chin, looking up thoughtfully, contemplative",
    "wave":         "one hand raised waving hello, friendly stance",
    "celebrate":    "both arms raised up in victory shape, jumping",
}
EXPRESSION_PROMPTS = {
    "neutral":    "calm neutral expression",
    "happy":      "big warm smile, squinted happy eyes",
    "sad":        "downturned mouth, teary eyes, sad frown",
    "angry":      "furrowed brows, gritted teeth, fierce angry look",
    "scared":     "wide terrified eyes, open mouth, trembling",
    "surprised":  "wide open eyes, open mouth O shape, raised eyebrows",
    "thinking":   "one eyebrow raised, slight frown, pondering look",
    "determined": "firm jaw, focused narrowed eyes, brave resolute look",
}

HAS_MAGICK = shutil.which("magick") is not None


def stable_offset(s: str) -> int:
    return int(hashlib.sha1(s.encode()).hexdigest()[:6], 16) % 10000


def gen_one(char: str, pose: str, expr: str, retries: int = 5, delay: float = 2.0) -> tuple[str, str]:
    out = OUTDIR / char / f"{pose}_{expr}.png"
    if out.exists() and out.stat().st_size > 1024:
        return ("skip", f"{char}/{pose}_{expr}")

    out.parent.mkdir(parents=True, exist_ok=True)
    info = CHARACTERS[char]
    style = STYLE_ANIMAL if info.get("kind") == "animal" else STYLE_HUMAN
    prompt = f"{style}, {info['desc']}, {POSE_PROMPTS[pose]}, {EXPRESSION_PROMPTS[expr]}"
    seed = info["seed"] + stable_offset(f"{pose}_{expr}")
    qs = urllib.parse.urlencode({
        "width": 768,
        "height": 1024,
        "seed": seed,
        "model": "flux",
        "nologo": "true",
        "negative": NEGATIVE,
    })
    enc = urllib.parse.quote(prompt, safe="")
    url = f"https://image.pollinations.ai/prompt/{enc}?{qs}"

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tmp.close()
    try:
        for attempt in range(1, retries + 1):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "cartoon-pipeline/1.0"})
                with urllib.request.urlopen(req, timeout=180) as r:
                    data = r.read()
                if len(data) < 1024:
                    raise RuntimeError(f"tiny response {len(data)}B")
                with open(tmp.name, "wb") as f:
                    f.write(data)
                break
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < retries:
                    time.sleep(min(60, delay * (2 ** attempt)))
                    continue
                if attempt == retries:
                    return ("fail", f"{char}/{pose}_{expr}: {e}")
                time.sleep(2 ** attempt)
            except Exception as e:
                if attempt == retries:
                    return ("fail", f"{char}/{pose}_{expr}: {e}")
                time.sleep(2 ** attempt)
        else:
            return ("fail", f"{char}/{pose}_{expr}: all retries exhausted")

        if HAS_MAGICK:
            r = subprocess.run(
                ["magick", tmp.name, "-fuzz", "8%", "-transparent", "white",
                 "-trim", "+repage", str(out)],
                capture_output=True,
            )
            if r.returncode != 0 or not out.exists():
                shutil.move(tmp.name, out)
                return ("ok-noalpha", f"{char}/{pose}_{expr}")
            return ("ok", f"{char}/{pose}_{expr}")
        else:
            shutil.move(tmp.name, out)
            return ("ok-noalpha", f"{char}/{pose}_{expr}")
    finally:
        try:
            os.unlink(tmp.name)
        except FileNotFoundError:
            pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--char", help="generate only this character")
    ap.add_argument("--jobs", type=int, default=2)
    args = ap.parse_args()

    jobs = []
    for char in CHARACTERS:
        if args.char and char != args.char:
            continue
        for pose, exprs in POSE_EXPRESSIONS.items():
            for expr in exprs:
                jobs.append((char, pose, expr))

    print(f"Generating {len(jobs)} frames | jobs={args.jobs} | magick={HAS_MAGICK}")
    counts = {"ok": 0, "ok-noalpha": 0, "skip": 0, "fail": 0}
    with cf.ThreadPoolExecutor(max_workers=args.jobs) as ex:
        futures = [ex.submit(gen_one, *j) for j in jobs]
        for i, fut in enumerate(cf.as_completed(futures), 1):
            status, msg = fut.result()
            counts[status] = counts.get(status, 0) + 1
            print(f"[{i:>3}/{len(jobs)}] {status:>10}  {msg}")

    print(f"\nDone: {counts}")
    if counts.get("fail", 0):
        sys.exit(1)


if __name__ == "__main__":
    main()
