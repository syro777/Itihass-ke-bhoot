"""Generate Hindi voiceover per scene with word timings, and build the episode timeline.

Usage: python3 tools/make_voice.py episodes/<id>/script.json
Outputs:
  episodes/<id>/build/voice.wav           full narration track (48 kHz mono)
  src/data/<id>.timeline.json             scenes, words (Hinglish captions) and SFX cues
"""
import asyncio
import json
import os
import re
import subprocess
import sys

import certifi

# Route TLS through the environment's proxy CA bundle when present.
if os.path.exists("/root/.ccr/ca-bundle.crt"):
    certifi.where = lambda: "/root/.ccr/ca-bundle.crt"

import edge_tts  # noqa: E402
import numpy as np  # noqa: E402

SR = 48000

# ---- Channel voice preferences (Itihaas Ke Bhoot) ----
# Clear male voice at a natural pace (user found +28% with hard-trimmed pauses too fast and choppy).
DEFAULT_VOICE = "hi-IN-MadhurNeural"
DEFAULT_RATE = "+8%"
DEFAULT_PITCH = "-2Hz"
# Longest silence allowed between words (seconds); longer TTS pauses are cut down to these.
DEFAULT_GAPS = {"word": 0.14, "comma": 0.24, "sentence": 0.34}

LEAD_FIRST = 0.08   # silence before first scene's voice
LEAD = 0.15         # silence at start of every other scene
TAIL = 0.25         # silence after last word of a scene
END_PAD = 1.6       # extra time on the final scene for the end card


def clean(word: str) -> str:
    return re.sub(r"[^\w]", "", word.lower().lstrip("*"))


async def tts_scene(text, voice, rate, pitch, mp3_path, tries=5):
    """TTS with retries: the free service occasionally returns no audio."""
    for attempt in range(tries):
        try:
            return await _tts_once(text, voice, rate, pitch, mp3_path)
        except edge_tts.exceptions.NoAudioReceived:
            if attempt == tries - 1:
                raise
            await asyncio.sleep(1.5 * (attempt + 1))


async def _tts_once(text, voice, rate, pitch, mp3_path):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(mp3_path, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({
                    "hi": ch["text"],
                    "start": ch["offset"] / 1e7,
                    "end": (ch["offset"] + ch["duration"]) / 1e7,
                })
    return words


def tighten(audio, words, en, gaps):
    """Cut long silences between words down to the allowed gap. Returns (audio, words) with new timings."""
    fade = int(0.012 * SR)
    out, new_words = [], []
    out_len = 0
    pos = max(0, int((words[0]["start"] - 0.03) * SR))
    for i, w in enumerate(words):
        ws, we = int(w["start"] * SR), int(w["end"] * SR)
        if i + 1 < len(words):
            ns = int(words[i + 1]["start"] * SR)
            tok = en[i] if i < len(en) else ""
            if tok.endswith(("...", ".", "!", "?", "।")):
                lim = gaps["sentence"]
            elif tok.endswith((",", ":", ";")):
                lim = gaps["comma"]
            else:
                lim = gaps["word"]
            lim_s = int(lim * SR)
            if ns - we > lim_s:
                keep_after = int(lim_s * 0.75)  # keep word tails intact
                seg_end, next_pos = we + keep_after, ns - (lim_s - keep_after)
            else:
                seg_end, next_pos = ns, ns
        else:
            seg_end, next_pos = len(audio), None
        seg = audio[pos:seg_end].copy()
        if len(seg) > 2 * fade:
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
        new_words.append({**w, "start": (out_len + ws - pos) / SR, "end": (out_len + we - pos) / SR})
        out.append(seg)
        out_len += len(seg)
        pos = next_pos
    return np.concatenate(out), new_words


def decode(mp3_path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", mp3_path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def write_wav(path, audio):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", path],
        input=audio.astype(np.float32).tobytes(), check=True,
    )


def main(script_path):
    script = json.load(open(script_path, encoding="utf-8"))
    ep_dir = os.path.dirname(script_path)
    build = os.path.join(ep_dir, "build")
    os.makedirs(build, exist_ok=True)

    scenes_out, chunks, cues = [], [], []
    t = 0.0
    n = len(script["scenes"])
    for i, sc in enumerate(script["scenes"]):
        mp3 = os.path.join(build, f"voice_{sc['id']}.mp3")
        voice = script.get("voice", DEFAULT_VOICE)
        rate = script.get("rate", DEFAULT_RATE)
        pitch = script.get("pitch", DEFAULT_PITCH)
        gaps = {**DEFAULT_GAPS, **script.get("pauses", {})}
        words = asyncio.run(tts_scene(sc["hi"], voice, rate, pitch, mp3))
        en = sc["en"].split()
        if len(en) != len(words):
            print(f"\n[ALIGN ERROR] scene {sc['id']}: {len(words)} spoken words vs {len(en)} caption words")
            for k in range(max(len(en), len(words))):
                print(f"  {k:2d}  {words[k]['hi'] if k < len(words) else '-':<14} {en[k] if k < len(en) else '-'}")
            sys.exit(1)

        audio, words = tighten(decode(mp3), words, en, gaps)
        last_end = words[-1]["end"]
        cut = min(len(audio), int((last_end + TAIL) * SR))
        audio = audio[:cut]
        # short fade-out so the cut is click-free
        fade = int(0.04 * SR)
        audio[-fade:] *= np.linspace(1, 0, fade)

        lead = LEAD_FIRST if i == 0 else LEAD
        dur = lead + len(audio) / SR + (END_PAD if i == n - 1 else 0.0) + float(sc.get("hold", 0.0))  # optional dramatic pause
        chunks.append((t + lead, audio))

        wlist = []
        for w, e in zip(words, en):
            emph = e.startswith("*")
            txt = e.lstrip("*").replace("_", " ")  # "30_August_1773" = one spoken token, shown with spaces
            wlist.append({
                "text": txt,
                "key": clean(e),
                "emph": emph,
                "hi": w["hi"],
                "start": round(lead + w["start"], 3),
                "end": round(lead + w["end"], 3),
            })

        for cue in sc.get("sfx", []):
            at = cue["at"]
            if at == "start":
                ts = 0.0
            elif at == "end":
                ts = dur
            else:
                hits = [w for w in wlist if w["key"] == at.lower()]
                nth = cue.get("nth", 1)
                if len(hits) < nth:
                    print(f"[SFX WARN] scene {sc['id']}: word '{at}' not found")
                    continue
                ts = hits[nth - 1]["start"]
            cues.append({"sfx": cue["sfx"], "t": round(t + ts + cue.get("off", 0.0), 3), "gain": cue.get("gain", 0.7)})

        scenes_out.append({"id": sc["id"], "mood": sc.get("mood", "mystery"), "start": round(t, 3), "duration": round(dur, 3), "words": wlist})
        print(f"{sc['id']:<10} start {t:6.2f}s  dur {dur:5.2f}s  words {len(words)}")
        t += dur

    total = t
    voice = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, audio in chunks:
        s = int(start * SR)
        voice[s:s + len(audio)] += audio
    write_wav(os.path.join(build, "voice.wav"), voice[: int(total * SR)])

    timeline = {"id": script["id"], "fps": 30, "duration": round(total, 3), "scenes": scenes_out, "sfx": cues}
    out = os.path.join(os.path.dirname(__file__), "..", "src", "data", f"{script['id']}.timeline.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(timeline, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"TOTAL {total:.2f}s -> {os.path.normpath(out)}")


if __name__ == "__main__":
    main(sys.argv[1])
