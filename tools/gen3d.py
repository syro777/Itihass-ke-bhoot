"""Generate 3D-animated clips for an episode: a first-frame image (Nano Banana) per scene,
then an image-to-video clip (Gemini Omni Flash, 9:16) per scene.

Usage:
  python3 tools/gen3d.py episodes/<id>/shots.json [--only hook,dna] [--images-only]
shots.json: {"style": "...", "shots": {"<scene id>": {"image": "...", "motion": "..."}}}
Clip duration = ceil(scene duration) from src/data/<id>.timeline.json (3..10 s).
Outputs: public/<id>/img/<scene>.png and public/<id>/clips/<scene>.mp4 (existing files are kept).
Needs GEMINI_API_KEY. Video costs roughly $0.07–0.10 per generated second.
"""
import argparse
import json
import math
import os
import sys

from google import genai
from google.genai import types

SKILL = "/root/.claude/skills/synced/ee31c95d-558e-4d37-8127-b3805aae3d3e_8309e5ce-6a93-4e5f-8fda-3bb8b1378ea0/gemini-omni-flash-api/scripts/video"
IMAGE_MODEL = "gemini-3.1-flash-image"


def make_image(client, prompt, out):
    resp = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=[prompt],
        config=types.GenerateContentConfig(response_modalities=["IMAGE"], image_config=types.ImageConfig(aspect_ratio="9:16")),
    )
    for part in resp.candidates[0].content.parts:
        if part.inline_data and part.inline_data.data:
            with open(out, "wb") as f:
                f.write(part.inline_data.data)
            return out
    raise RuntimeError(f"no image returned for {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shots")
    ap.add_argument("--only", default="")
    ap.add_argument("--images-only", action="store_true")
    a = ap.parse_args()

    cfg = json.load(open(a.shots, encoding="utf-8"))
    ep = os.path.basename(os.path.dirname(os.path.abspath(a.shots)))
    root = os.path.join(os.path.dirname(__file__), "..")
    tl = json.load(open(os.path.join(root, "src", "data", f"{ep}.timeline.json"), encoding="utf-8"))
    durs = {s["id"]: s["duration"] for s in tl["scenes"]}
    img_dir = os.path.join(root, "public", ep, "img")
    clip_dir = os.path.join(root, "public", ep, "clips")
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(clip_dir, exist_ok=True)
    only = [x for x in a.only.split(",") if x]

    client = genai.Client()
    sys.path.insert(0, SKILL)
    from generate_video import generate_video  # noqa: E402

    total_sec = 0
    for sid, shot in cfg["shots"].items():
        if only and sid not in only:
            continue
        img = os.path.join(img_dir, f"{sid}.png")
        if not os.path.exists(img):
            make_image(client, f"{cfg['style']} {shot['image']}", img)
            print(f"[image] {sid} -> {img}")
        if a.images_only:
            continue
        clip = os.path.join(clip_dir, f"{sid}.mp4")
        if os.path.exists(clip):
            continue
        dur = max(3, min(10, math.ceil(durs[sid])))
        prompt = (f"<FIRST_FRAME> Single continuous shot, no scene cuts. {shot['motion']} "
                  f"Keep the stylized 3D animated film look of the first frame. No dialogue, no on-screen text, no music.")
        generate_video(prompt, os.environ["GEMINI_API_KEY"], aspect_ratio="9:16", duration=dur, image_path=img, output_path=clip)
        total_sec += dur
        print(f"[clip] {sid} {dur}s -> {clip}")
    if total_sec:
        print(f"generated {total_sec}s of video ≈ ${total_sec * 0.07:.2f}–${total_sec * 0.10:.2f}")


if __name__ == "__main__":
    main()
