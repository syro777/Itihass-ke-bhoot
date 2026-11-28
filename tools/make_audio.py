"""Compose an adaptive background score, place SFX, duck under the voice and master to -14 LUFS.

Usage: python3 tools/make_audio.py <episode-id>
Needs: episodes/<id>/build/voice.wav and src/data/<id>.timeline.json (from make_voice.py)
Writes: public/<id>/mix.wav  (+ stems in episodes/<id>/build/)
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy import signal

sys.path.insert(0, os.path.dirname(__file__))
import sfx as S  # noqa: E402

SR = S.SR
CR = 100  # control rate (Hz) for automation curves
D2 = 73.42
BHAIRAV = [0, 1, 4, 5, 7, 8, 11]  # D Eb F# G A Bb C#  (raag Bhairav flavour)

MOODS = {
    #            drone tension tanpura flute box drums wind
    "tense":   (1.0, 0.8, 0.0, 0.0, 0.2, 0.6, 0.6),
    "mystery": (0.8, 0.3, 0.7, 0.4, 0.0, 0.0, 0.4),
    "royal":   (0.6, 0.0, 1.0, 0.9, 0.0, 0.35, 0.0),
    "calm":    (0.7, 0.15, 1.0, 1.0, 0.0, 0.0, 0.3),
    "climax":  (1.0, 1.0, 0.2, 0.0, 0.0, 1.0, 0.5),
    "creepy":  (0.8, 0.6, 0.2, 0.0, 1.0, 0.0, 0.3),
    "sad":     (0.8, 0.4, 0.5, 0.8, 0.0, 0.0, 0.8),
}
LAYERS = ["drone", "tension", "tanpura", "flute", "box", "drums", "wind"]


def hz(semi, base=D2):
    return base * 2 ** (semi / 12)


def saw_voice(t, f, harmonics=10, detunes=(-0.0013, 0.0, 0.0013), bright=1.0):
    out = np.zeros((2, len(t)))
    for j, d in enumerate(detunes):
        ph = 2 * np.pi * f * (1 + d) * t + j * 1.7
        x = sum(np.sin(k * ph) / k ** (1.0 + 0.6 / bright) for k in range(1, harmonics + 1))
        pan = (j - (len(detunes) - 1) / 2) * 0.6
        out += S.stereo(x, pan)
    return out / len(detunes)


def ks_pluck(f, dur=3.2, decay=0.996, bright=0.5):
    n_total = int(dur * SR)
    N = int(SR / f)
    buf = S.filt(S.noise(N), "lowpass", 2000 + 6000 * bright)
    out = np.zeros(n_total + N)
    out[:N] = buf
    prev_last = 0.0
    for start in range(N, n_total, N):
        prev = out[start - N:start]
        shifted = np.concatenate([[prev_last], prev[:-1]])
        blk = decay * 0.5 * (prev + shifted)
        end = min(start + N, len(out))
        out[start:end] = blk[: end - start]
        prev_last = prev[-1]
    y = out[:n_total]
    y = np.tanh(2.5 * y) * 0.7 + 0.3 * S.filt(y, "highpass", 1500) * 4  # jawari buzz
    return y


def tanpura_layer(T):
    cycle = 3.6
    one = np.zeros(int((cycle + 3.4) * SR))
    for i, (semi, g) in enumerate([(7, 0.8), (12, 0.7), (12, 0.7), (0, 1.0)]):  # Pa Sa' Sa' Sa
        p = ks_pluck(hz(semi), 3.3, 0.9985 if semi == 0 else 0.998)
        s = int(i * 0.9 * SR)
        one[s:s + len(p)] += g * p
    out = np.zeros(int(T * SR) + len(one))
    for k in range(int(T / cycle) + 1):
        s = int(k * cycle * SR)
        out[s:s + len(one)] += one
    return S.stereo(out[: int(T * SR)], 0.15, 0.5)


def flute_layer(T):
    phrases = [
        [(7, 1.0), (8, 0.5), (7, 0.5), (4, 1.0), (1, 0.6), (0, 1.8)],
        [(12, 0.8), (11, 0.4), (8, 0.6), (7, 1.2), (5, 0.5), (4, 0.5), (1, 1.6)],
        [(0, 0.6), (1, 0.4), (4, 0.6), (5, 0.6), (7, 1.6), (8, 0.5), (7, 1.4)],
    ]
    t = np.arange(int(T * SR)) / SR
    target = np.full(len(t), np.nan)
    amp = np.zeros(len(t))
    pos, k = 0.6, 0
    while pos < T:
        for semi, d in phrases[k % len(phrases)]:
            s, e = int(pos * SR), int(min(pos + d, T) * SR)
            target[s:e] = hz(semi + 24)  # D4 range
            amp[s:e] = 1.0
            pos += d
        pos += 2.2  # breath between phrases
        k += 1
    # glide (meend) between notes
    f = np.copy(target)
    last = hz(24)
    for i in range(len(f)):
        if np.isnan(f[i]):
            f[i] = last
        last = f[i]
    f = S.filt(f, "lowpass", 9)
    amp = S.filt(amp, "lowpass", 6)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.3 * t)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = S.filt(S.noise(len(t)), "bandpass", [700, 2600]) * 0.06
    return S.stereo((x + breath) * np.clip(amp, 0, 1), -0.2, 0.6)


def box_layer(T):
    t = np.arange(int(T * SR)) / SR
    x = np.zeros(len(t))
    pattern = [12, 15, 19, 18, 12, 13, 19, None, 24, 23, 19, 16, 13, None, 12, None]
    step, i, pos = 0.42, 0, 0.3
    while pos < T - 0.5:
        n = pattern[i % len(pattern)]
        if n is not None:
            s = int(pos * SR)
            tl = t[: min(len(t) - s, int(2.0 * SR))]
            note = S.bell_partials(tl, hz(BHAIRAV[n % 7] + 12 * (n // 7) + 36), [1, 2.0, 3.0, 4.2], [1, 0.25, 0.12, 0.05], [3, 6, 9, 12], 0.6)
            x[s:s + len(tl)] += note
        pos += step
        i += 1
    return S.stereo(x, 0.3, 0.6)


def drum_layer(T, bpm=76):
    t = np.arange(int(T * SR)) / SR
    x = np.zeros(len(t))
    beat = 60 / bpm
    hit_len = int(0.9 * SR)
    th = np.arange(hit_len) / SR
    big = S.sine_sweep(th, 95, 48, 9) * np.exp(-th * 6) + S.filt(S.noise(hit_len), "lowpass", 300) * np.exp(-th * 22) * 0.6
    small = S.sine_sweep(th, 140, 80, 12) * np.exp(-th * 10) * 0.5
    k = 0
    while k * beat < T:
        s = int(k * beat * SR)
        h = big if k % 4 in (0, 2) else (small if k % 4 == 3 else None)
        if h is not None:
            e = min(len(x), s + hit_len)
            x[s:e] += h[: e - s]
        k += 1
    return S.stereo(np.tanh(1.6 * x))


def drone_layer(T):
    t = np.arange(int(T * SR)) / SR
    lfo = 0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * t)
    x = saw_voice(t, hz(0), 12) * 1.0 + saw_voice(t, hz(7), 8) * 0.55 + saw_voice(t, hz(12), 6) * 0.4
    x = np.stack([S.filt(c, "lowpass", 900) for c in x]) * lfo
    sub = np.sin(2 * np.pi * hz(0) * t) * 0.6
    return x + S.stereo(sub)


def tension_layer(T):
    t = np.arange(int(T * SR)) / SR
    trem = 0.7 + 0.3 * np.sin(2 * np.pi * 6.5 * t)
    x = saw_voice(t, hz(13), 6) * 0.6 + saw_voice(t, hz(18), 6) * 0.45  # Eb3 + G#3 (tritone from D)
    hi = S.stereo(np.sin(2 * np.pi * hz(37) * t) * 0.15 + np.sin(2 * np.pi * hz(38) * t) * 0.12, 0.4)
    x = np.stack([S.filt(c, "lowpass", 2200) for c in x])
    return (x + hi) * trem


def curves(timeline, T):
    n = int(T * CR) + 1
    g = {k: np.zeros(n) for k in LAYERS}
    for sc in timeline["scenes"]:
        prof = MOODS.get(sc.get("mood", "mystery"), MOODS["mystery"])
        s, e = int(sc["start"] * CR), int((sc["start"] + sc["duration"]) * CR) + 1
        for k, v in zip(LAYERS, prof):
            g[k][s:e] = v
    win = np.hanning(int(0.7 * CR))
    win /= win.sum()
    for k in LAYERS:
        g[k][-1] = g[k][-2]
        g[k] = np.convolve(np.pad(g[k], len(win), mode="edge"), win, mode="same")[len(win):-len(win)]
    # music drops before the big hits, then slams back
    drop = np.ones(n)
    for c in timeline["sfx"]:
        if c["sfx"] in ("thunder", "crash"):
            ti = c["t"]
            tt_ = np.arange(n) / CR
            d = np.where((tt_ > ti - 0.55) & (tt_ < ti), 0.12, 1.0)
            d = np.where((tt_ >= ti) & (tt_ < ti + 0.8), 0.12 + 0.88 * (tt_ - ti) / 0.8, d)
            drop = np.minimum(drop, d)
    # fade in/out of the whole bed
    tt_ = np.arange(n) / CR
    fade = np.clip(tt_ / 0.3, 0, 1) * np.clip((T - tt_) / 1.2, 0, 1)
    return g, drop * fade


def to_audio_rate(c, n):
    return np.interp(np.arange(n) / SR, np.arange(len(c)) / CR, c)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def read_wav(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def write_wav(path, st):
    data = np.ascontiguousarray(st.T.astype(np.float32))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s16le", path], input=data.tobytes(), check=True)


def main(ep, no_music=False):
    root = os.path.join(os.path.dirname(__file__), "..")
    build = os.path.join(root, "episodes", ep, "build")
    timeline = json.load(open(os.path.join(root, "src", "data", f"{ep}.timeline.json"), encoding="utf-8"))
    T = timeline["duration"]
    n = int(T * SR)

    # ---- voice ----
    vfx = os.path.join(build, "voice_fx.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(build, "voice.wav"), "-af",
                    "highpass=f=75,equalizer=f=170:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.4:g=3,"
                    "acompressor=threshold=0.1:ratio=3:attack=5:release=120:makeup=2,"
                    "aecho=0.8:0.5:28|52:0.09|0.05", "-ar", str(SR), vfx], check=True)
    voice = read_wav(vfx)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    venv = S.filt(np.abs(voice), "lowpass", 8)
    active = venv > 0.02
    voice *= 10 ** (-16.5 / 20) / (np.sqrt(np.mean(voice[active] ** 2)) + 1e-9)
    print(f"voice active RMS {rms_db(voice[active]):.1f} dBFS")

    # ---- music ----
    print("composing score ...")
    layers = {
        "drone": drone_layer(T), "tension": tension_layer(T), "tanpura": tanpura_layer(T),
        "flute": flute_layer(T), "box": box_layer(T), "drums": drum_layer(T), "wind": S.wind(T),
    }
    mix_w = {"drone": 0.55, "tension": 0.32, "tanpura": 0.45, "flute": 0.38, "box": 0.4, "drums": 0.7, "wind": 0.35}
    g, master = curves(timeline, T)
    music = np.zeros((2, n))
    wet_bus = np.zeros((2, n))
    for k, lay in layers.items():
        lay = lay[:, :n] if lay.shape[1] >= n else np.pad(lay, ((0, 0), (0, n - lay.shape[1])))
        lay = S.norm(lay, 1.0) * mix_w[k] * to_audio_rate(g[k], n)
        (wet_bus if k in ("flute", "box", "tanpura") else music)[:] += lay
    music += S.reverb(wet_bus, 3.2, 0.45)[:, :n]
    music *= to_audio_rate(master, n)
    music *= 10 ** (-23 / 20) / (np.sqrt(np.mean(music ** 2)) + 1e-9)
    venv2 = S.filt(S.filt(np.abs(voice), "lowpass", 8), "lowpass", 2.5, order=1)
    duck = 1 - 0.62 * np.clip(venv2 / 0.05, 0, 1)
    music *= duck
    if no_music:
        music *= 0  # voice + SFX only: leaves room for a licensed trending sound added in the YouTube app
    print(f"music RMS {rms_db(music):.1f} dBFS")

    # ---- sfx ----
    print("placing sfx ...")
    fx = np.zeros((2, n + SR * 6))
    hits = [c for c in timeline["sfx"] if c["sfx"] in ("thunder", "boom", "crash", "stamp")]
    cache = {}
    for c in timeline["sfx"]:
        name = c["sfx"]
        if name == "riser":
            nxt = [h["t"] for h in hits if 0.4 < h["t"] - c["t"] < 4.0]
            dur = (min(nxt) - c["t"]) if nxt else 1.8
            clip = S.riser(dur)
        else:
            if name not in cache:
                cache[name] = S.LIBRARY[name]()
            clip = cache[name]
        s = max(0, int(c["t"] * SR))
        fx[:, s:s + clip.shape[1]] += clip * c["gain"]
    fx = fx[:, :n] * 10 ** (-7 / 20)
    print(f"sfx RMS {rms_db(fx):.1f} dBFS")

    mixed = S.stereo(voice) * np.sqrt(2) + music + fx
    mixed = np.tanh(mixed * 1.1) / 1.1  # gentle soft-clip safety
    raw = os.path.join(build, "mix_raw.wav")
    write_wav(raw, mixed)
    write_wav(os.path.join(build, "stem_music.wav"), music)
    write_wav(os.path.join(build, "stem_sfx.wav"), fx)

    out_dir = os.path.join(root, "public", ep)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "mix_nomusic.wav" if no_music else "mix.wav")
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                           "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"):])
    lf = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", lf, "-ar", str(SR), "-c:a", "pcm_s16le", out], check=True)
    # Compressed copy that is committed to git and used by the composition (CI renders from it).
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-c:a", "aac", "-b:a", "192k", out.replace(".wav", ".m4a")], check=True)
    print(f"input loudness {m['input_i']} LUFS -> -14 LUFS  => {os.path.normpath(out.replace('.wav', '.m4a'))}")


if __name__ == "__main__":
    # python3 tools/make_audio.py <id> [--no-music]   (--no-music writes public/<id>/mix_nomusic.m4a)
    main(sys.argv[1], no_music="--no-music" in sys.argv[2:])
