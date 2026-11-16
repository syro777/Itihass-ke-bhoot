"""Render the same lines in several male voices with the channel's tight-pause settings, for comparison.

Usage: python3 tools/voice_samples.py episodes/<id>/script.json [scene ids...]
Writes out/voice_samples/*.mp3
"""
import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))
import make_voice as mv  # noqa: E402
import numpy as np  # noqa: E402

VOICES = [
    ("1_Madhur_NEW_fast_tight", "hi-IN-MadhurNeural", "-2Hz"),
    ("2_Madhur_NEW_deep_voice", "hi-IN-MadhurNeural", "-8Hz"),
]


def render(text, en, voice, rate, pitch, gaps, tmp, tight=True):
    words = asyncio.run(mv.tts_scene(text, voice, rate, pitch, tmp))
    audio = mv.decode(tmp)
    if tight and words:
        audio, words = mv.tighten(audio, words, en if len(en) == len(words) else [], gaps)
        audio = audio[: int((words[-1]["end"] + mv.TAIL) * mv.SR)]
    return audio


def main(script_path, scene_ids):
    script = json.load(open(script_path, encoding="utf-8"))
    scenes = [s for s in script["scenes"] if not scene_ids or s["id"] in scene_ids]
    out_dir = os.path.join(os.path.dirname(__file__), "..", "out", "voice_samples")
    os.makedirs(out_dir, exist_ok=True)
    tmp = os.path.join(out_dir, "_tmp.mp3")
    gaps = {**mv.DEFAULT_GAPS, **script.get("pauses", {})}
    gap = np.zeros(int(0.08 * mv.SR), dtype=np.float32)

    jobs = [("0_OLD_Madhur_slow_pauses", "hi-IN-MadhurNeural", "+20%", "-2Hz", False)]
    jobs += [(n, v, mv.DEFAULT_RATE, p, True) for n, v, p in VOICES]
    for name, voice, rate, pitch, tight in jobs:
        parts = []
        for sc in scenes:
            parts += [render(sc["hi"], sc["en"].split(), voice, rate, pitch, gaps, tmp, tight), gap]
        audio = np.concatenate(parts)
        path = os.path.join(out_dir, f"{name}.mp3")
        mv.write_wav(path.replace(".mp3", ".wav"), audio)
        os.system(f'ffmpeg -v error -y -i "{path.replace(".mp3", ".wav")}" -b:a 128k "{path}" && rm "{path.replace(".mp3", ".wav")}"')
        print(f"{name:<28} {len(audio) / mv.SR:5.2f}s")
    os.remove(tmp)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
