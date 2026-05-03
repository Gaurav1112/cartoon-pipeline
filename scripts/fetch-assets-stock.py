#!/usr/bin/env python3
"""
Fetch stock assets from Pixabay + Pexels for the cartoon pipeline.
Both services are free for commercial use, no attribution required.

Reads API keys from env: PIXABAY_KEY, PEXELS_KEY.
Never commit keys.

Usage:
    source ~/.zshrc.cartoon-keys
    python3 scripts/fetch-assets-stock.py

Output:
    public/backgrounds/<name>.jpg|png   (1920x1080-ish landscape plates)
    public/characters/<id>/<id>.png     (single canonical pose; transparent if vector)

Resumable: skips files that already exist non-empty.
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
BG_DIR = PROJECT / "public" / "backgrounds"
CH_DIR = PROJECT / "public" / "characters"
BG_DIR.mkdir(parents=True, exist_ok=True)
CH_DIR.mkdir(parents=True, exist_ok=True)

PIX = os.environ.get("PIXABAY_KEY")
PEX = os.environ.get("PEXELS_KEY")
if not PIX:
    print("ERROR: set PIXABAY_KEY in env", file=sys.stderr); sys.exit(1)

HAS_MAGICK = shutil.which("magick") is not None


def http_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def download(url: str, out: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "cartoon-pipeline/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        if len(data) < 4096:
            return False
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "wb") as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"  ! download failed: {e}", file=sys.stderr)
        return False


def pixabay_search(query: str, image_type: str = "illustration", orientation: str = "horizontal",
                   per_page: int = 5, min_width: int = 1280) -> list[dict]:
    params = {
        "key": PIX, "q": query, "image_type": image_type,
        "orientation": orientation, "per_page": per_page,
        "min_width": min_width, "safesearch": "true",
    }
    url = "https://pixabay.com/api/?" + urllib.parse.urlencode(params)
    try:
        return http_json(url).get("hits", [])
    except Exception as e:
        print(f"  pixabay error: {e}"); return []


def pexels_search(query: str, per_page: int = 5, orientation: str = "landscape") -> list[dict]:
    if not PEX: return []
    params = {"query": query, "per_page": per_page, "orientation": orientation}
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(params)
    try:
        return http_json(url, {"Authorization": PEX}).get("photos", [])
    except Exception as e:
        print(f"  pexels error: {e}"); return []


# ---------------- Asset wishlist ----------------

# Backgrounds: each entry = (output filename, search queries to try in order)
BACKGROUNDS = [
    ("forest_day.jpg",     ["cartoon indian jungle illustration", "cartoon tropical forest landscape", "fantasy forest illustration daylight"]),
    ("forest_sunset.jpg",  ["sunset forest illustration", "cartoon forest evening orange", "warm tropical jungle sunset illustration"]),
    ("forest_night.jpg",   ["night forest illustration moon", "cartoon jungle night blue", "moonlit forest illustration"]),
    ("well_scene.jpg",     ["village well illustration", "old stone well cartoon", "indian village well illustration"]),
    ("village_path.jpg",   ["indian village illustration cartoon", "rural india illustration", "village huts cartoon illustration"]),
    ("mountains_far.jpg",  ["cartoon mountains background distant", "fantasy mountains illustration", "himalayas cartoon illustration"]),
    ("sky_clouds.jpg",     ["cartoon sky clouds blue daytime", "anime sky background", "fluffy clouds illustration sky"]),
]

# Characters: each entry = (id, search queries). One canonical full-body image per character.
# Procedural animation engine adds mouth/body movement on top.
CHARACTERS = [
    ("moti",    ["cartoon rabbit standing transparent", "cute brown rabbit cartoon vector", "cartoon hare full body"]),
    ("kaaliya", ["cartoon lion full body transparent", "cute cartoon lion vector standing", "cartoon lion mascot"]),
    ("arjun",   ["indian boy cartoon clipart", "cartoon south asian boy character", "boy cartoon vector orange shirt"]),
    ("bablu",   ["chubby boy cartoon clipart", "cartoon kid character green shirt", "cute boy cartoon vector"]),
    ("guruji",  ["wise old man cartoon clipart white beard", "indian sage cartoon vector", "old wizard cartoon"]),
    ("amma",    ["indian mother cartoon sari clipart", "indian woman cartoon vector", "cartoon mom character"]),
]


def pick_best(hits: list[dict], source: str) -> dict | None:
    # Prefer larger images, more downloads, vector type when available.
    if not hits: return None
    if source == "pixabay":
        return sorted(hits, key=lambda h: (h.get("type") == "vector/svg", h.get("imageWidth", 0), h.get("downloads", 0)), reverse=True)[0]
    return sorted(hits, key=lambda h: h.get("width", 0), reverse=True)[0]


def fetch_background(name: str, queries: list[str]) -> bool:
    out = BG_DIR / name
    if out.exists() and out.stat().st_size > 50_000:
        print(f"SKIP bg/{name}"); return True
    for q in queries:
        hits = pixabay_search(q, image_type="illustration", orientation="horizontal", per_page=5, min_width=1920)
        best = pick_best(hits, "pixabay")
        if best:
            url = best.get("largeImageURL") or best.get("webformatURL")
            print(f"BG {name} <- pixabay '{q}' (id {best.get('id')}, {best.get('imageWidth')}x{best.get('imageHeight')})")
            if download(url, out): return True
        time.sleep(0.5)
    # Pexels fallback
    for q in queries:
        hits = pexels_search(q, per_page=5)
        best = pick_best(hits, "pexels")
        if best:
            url = best.get("src", {}).get("large2x") or best.get("src", {}).get("original")
            print(f"BG {name} <- pexels '{q}' (id {best.get('id')})")
            if download(url, out): return True
        time.sleep(0.5)
    print(f"FAIL bg/{name}"); return False


def fetch_character(cid: str, queries: list[str]) -> bool:
    out_dir = CH_DIR / cid
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{cid}.png"
    if out.exists() and out.stat().st_size > 30_000:
        print(f"SKIP char/{cid}"); return True
    for q in queries:
        # Prefer vectors (transparent BG, scalable)
        hits = pixabay_search(q, image_type="vector", orientation="vertical", per_page=8, min_width=600)
        if not hits:
            hits = pixabay_search(q, image_type="illustration", orientation="vertical", per_page=8, min_width=600)
        best = pick_best(hits, "pixabay")
        if best:
            url = best.get("largeImageURL") or best.get("webformatURL")
            print(f"CH {cid} <- '{q}' (id {best.get('id')}, type {best.get('type')})")
            tmp = out.with_suffix(".tmp")
            if download(url, tmp):
                # Strip white BG to alpha
                if HAS_MAGICK:
                    r = subprocess.run(
                        ["magick", str(tmp), "-fuzz", "8%", "-transparent", "white",
                         "-trim", "+repage", str(out)],
                        capture_output=True,
                    )
                    tmp.unlink(missing_ok=True)
                    if r.returncode == 0 and out.exists() and out.stat().st_size > 30_000:
                        return True
                else:
                    shutil.move(tmp, out); return True
        time.sleep(0.5)
    print(f"FAIL char/{cid}"); return False


def main():
    print(f"Pixabay key: {PIX[:10]}…  Pexels key: {('set' if PEX else 'unset')}  magick={HAS_MAGICK}\n")
    print("=== Backgrounds ===")
    bg_ok = sum(fetch_background(n, q) for n, q in BACKGROUNDS)
    print(f"\n=== Characters ===")
    ch_ok = sum(fetch_character(c, q) for c, q in CHARACTERS)
    print(f"\nDone. backgrounds {bg_ok}/{len(BACKGROUNDS)}  characters {ch_ok}/{len(CHARACTERS)}")


if __name__ == "__main__":
    main()
