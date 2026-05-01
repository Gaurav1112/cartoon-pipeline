#!/usr/bin/env python3
"""
Generate AI character frames using Stable Diffusion (Animagine XL 3.1).
Runs on Apple Silicon (MPS) or CUDA GPU.

Usage:
  cd /Users/racit/ComfyUI && source venv/bin/activate
  python /Users/racit/PersonalProject/cartoon-pipeline/scripts/generate-characters.py

Output: public/characters/{character}/{pose}_{expression}.png
"""

import os
import sys
import torch
from pathlib import Path
from diffusers import StableDiffusionXLPipeline

# Setup
PROJECT_DIR = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_DIR / "public" / "characters"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Device
if torch.backends.mps.is_available():
    DEVICE = "mps"
    DTYPE = torch.float16
elif torch.cuda.is_available():
    DEVICE = "cuda"
    DTYPE = torch.float16
else:
    DEVICE = "cpu"
    DTYPE = torch.float32

print(f"Using device: {DEVICE}")

# Model path
MODEL_PATH = Path.home() / "ComfyUI" / "models" / "checkpoints" / "animagine-xl-3.1.safetensors"
if not MODEL_PATH.exists():
    # Try HuggingFace hub
    MODEL_ID = "cagliostrolab/animagine-xl-3.1"
    print(f"Loading model from HuggingFace: {MODEL_ID}")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        MODEL_ID, torch_dtype=DTYPE, variant="fp16"
    )
else:
    print(f"Loading model from: {MODEL_PATH}")
    pipe = StableDiffusionXLPipeline.from_single_file(
        str(MODEL_PATH), torch_dtype=DTYPE
    )

pipe = pipe.to(DEVICE)
if DEVICE == "mps":
    pipe.enable_attention_slicing()  # Save memory on Apple Silicon

# Style prefix for ALL generations
STYLE = (
    "indian cartoon character, chhota bheem style, anime-lite, "
    "cel-shaded, thick black outlines, vibrant warm colors, "
    "white background, full body shot, children's animation style, "
    "big expressive eyes, south asian features, professional quality, "
    "single character, centered, clean"
)

NEGATIVE = (
    "realistic, photorealistic, 3d render, blurry, low quality, "
    "deformed, extra limbs, bad anatomy, watermark, signature, "
    "multiple characters, text, western features, gradient background, "
    "nsfw, scary, dark, horror"
)

# Character definitions
CHARACTERS = {
    "arjun": {
        "desc": "young indian boy age 10, spiky brown hair, burnt amber orange tunic, golden scarf, tilak on forehead, confident brave expression, warm brown skin",
        "seed": 100042,
    },
    "meera": {
        "desc": "young indian girl age 10, long black braid with white flower, blue salwar kameez, bindi, carrying blue book, intelligent curious expression, brown skin, nose stud",
        "seed": 200042,
    },
    "bablu": {
        "desc": "chubby round indian boy age 9, messy brown hair, sage green kurta, brown belt, food crumbs near mouth, goofy cheerful expression, round belly, brown skin",
        "seed": 300042,
    },
    "guruji": {
        "desc": "elderly indian man age 70, bald with white topknot, long white flowing beard, cream dhoti shawl, wooden walking staff, rudraksha bead necklace, calm wise gentle expression",
        "seed": 400042,
    },
    "kaaliya": {
        "desc": "indian boy villain age 12, slicked back dark purple hair, dark purple high collar outfit, scar on left cheek, menacing smirk, rings on fingers, sharp features",
        "seed": 500042,
    },
    "amma": {
        "desc": "indian mother age 35, hair in bun with jasmine flowers, dusty rose pink sari with peach border, sindoor, bindi, gold bangles, warm gentle maternal smile, brown skin",
        "seed": 600042,
    },
    "raja": {
        "desc": "indian king age 45, ornate golden crown with red jewel, burgundy royal robes with cape, scepter, jeweled necklace, commanding regal expression, brown skin",
        "seed": 700042,
    },
    "moti": {
        "desc": "cute cartoon puppy dog, round brown body with tan belly, big floppy ears, collar with bell, wagging tail, loyal happy expression, adorable puppy proportions",
        "seed": 800042,
    },
}

# Reduced pose+expression matrix (only meaningful combinations)
POSE_EXPRESSIONS = {
    "idle_stand": ["neutral", "happy", "sad", "angry", "surprised", "thinking", "determined"],
    "talk_gesture": ["neutral", "happy", "angry", "determined"],
    "point": ["angry", "determined", "surprised"],
    "surprised": ["surprised", "scared"],
    "sad": ["sad"],
    "laugh": ["happy"],
    "think": ["thinking"],
    "wave": ["happy"],
    "celebrate": ["happy"],
}

POSE_PROMPTS = {
    "idle_stand": "standing upright, arms relaxed at sides, facing forward",
    "talk_gesture": "one hand raised gesturing while talking, slight lean forward",
    "point": "arm extended pointing to the right, determined stance",
    "surprised": "hands up near face, leaning back, shocked pose",
    "sad": "slumped shoulders, looking down, dejected pose",
    "laugh": "head tilted back laughing, hands on belly, joyful",
    "think": "hand on chin, looking up thoughtfully, contemplative",
    "wave": "one hand raised waving hello, friendly stance",
    "celebrate": "both arms raised up in victory V shape, jumping",
}

EXPRESSION_PROMPTS = {
    "neutral": "calm neutral expression",
    "happy": "big warm smile, squinted happy eyes",
    "sad": "downturned mouth, teary eyes, sad frown",
    "angry": "furrowed brows, gritted teeth, fierce angry look",
    "scared": "wide terrified eyes, open mouth, trembling",
    "surprised": "wide open eyes, open mouth O shape, raised eyebrows",
    "thinking": "one eyebrow raised, slight frown, pondering look",
    "determined": "firm jaw, focused narrowed eyes, brave resolute look",
}


def generate_character_frames():
    total = sum(len(exps) for exps in POSE_EXPRESSIONS.values()) * len(CHARACTERS)
    done = 0

    for char_id, char_info in CHARACTERS.items():
        char_dir = OUTPUT_DIR / char_id
        char_dir.mkdir(exist_ok=True)

        for pose, expressions in POSE_EXPRESSIONS.items():
            for expr in expressions:
                filename = f"{pose}_{expr}.png"
                filepath = char_dir / filename

                if filepath.exists():
                    done += 1
                    print(f"  [{done}/{total}] SKIP {char_id}/{filename} (exists)")
                    continue

                prompt = f"{STYLE}, {char_info['desc']}, {POSE_PROMPTS[pose]}, {EXPRESSION_PROMPTS[expr]}"
                seed = char_info["seed"] + hash(f"{pose}_{expr}") % 10000

                generator = torch.Generator(device=DEVICE).manual_seed(seed)

                try:
                    image = pipe(
                        prompt=prompt,
                        negative_prompt=NEGATIVE,
                        width=768,
                        height=1024,
                        num_inference_steps=25,
                        guidance_scale=7.0,
                        generator=generator,
                    ).images[0]

                    image.save(filepath)
                    done += 1
                    print(f"  [{done}/{total}] ✓ {char_id}/{filename}")
                except Exception as e:
                    done += 1
                    print(f"  [{done}/{total}] ✗ {char_id}/{filename}: {e}")

    print(f"\nDone! {done} frames in {OUTPUT_DIR}")


if __name__ == "__main__":
    generate_character_frames()
