"""Procedural sound-effect library (no samples, copyright-free).

Every function returns a stereo float32 array of shape (2, n) at 48 kHz.
"""
import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)


# ---------- helpers ----------
def tt(dur):
    return np.arange(int(dur * SR)) / SR


def noise(n):
    return RNG.standard_normal(n).astype(np.float64)


def brown(n):
    b = np.cumsum(noise(n))
    b = signal.sosfilt(signal.butter(1, 15, "hp", fs=SR, output="sos"), b)
    return b / (np.max(np.abs(b)) + 1e-9)


def filt(x, kind, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, kind, fs=SR, output="sos"), x)


def svf_bp(x, fc, q=2.0):
    """Time-varying band-pass (Chamberlin state-variable filter). fc: array or scalar."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    damp = 1.0 / q
    low = band = 0.0
    out = np.empty_like(x)
    for i in range(len(x)):
        low += f[i] * band
        high = x[i] - low - damp * band
        band += f[i] * high
        out[i] = band
    return out


def env_exp(t, rate):
    return np.exp(-t * rate)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


def stereo(mono, pan=0.0, width=0.0):
    p = (pan + 1) * np.pi / 4
    l, r = np.cos(p) * mono, np.sin(p) * mono
    if width > 0:
        d = int(0.011 * SR)
        r = np.concatenate([np.zeros(d), r[:-d]]) * (1 - width) + r * width
    return np.stack([l, r])


def reverb(st, decay=1.6, wet=0.3, predelay=0.015):
    """Synthetic stereo convolution reverb. st: (2, n) or mono."""
    if st.ndim == 1:
        st = stereo(st)
    n_ir = int(decay * 1.4 * SR)
    t = np.arange(n_ir) / SR
    out = []
    for ch in range(2):
        ir = noise(n_ir) * np.exp(-t * 6.9 / decay)
        ir = filt(ir, "lowpass", 6000)
        ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out.append(signal.fftconvolve(st[ch], ir)[: st.shape[1] + n_ir])
    wetsig = np.stack(out)
    dry = np.pad(st, ((0, 0), (0, wetsig.shape[1] - st.shape[1])))
    return dry * (1 - wet) + wetsig * wet * 0.5


def sine_sweep(t, f0, f1, curve=4.0):
    f = f1 + (f0 - f1) * np.exp(-t * curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def bell_partials(t, f0, ratios, amps, decays, detune=1.2):
    x = np.zeros_like(t)
    for r, a, d in zip(ratios, amps, decays):
        f = f0 * r
        x += a * np.exp(-t * d) * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * (f + detune) * t))
    return x


# ---------- effects ----------
def whoosh(dur=0.75):
    t = tt(dur)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    fc = 350 + 2600 * shape
    x = svf_bp(noise(len(t)), fc, q=1.4) * shape
    st = np.stack([x * np.linspace(1.0, 0.35, len(t)), x * np.linspace(0.35, 1.0, len(t))])
    return norm(reverb(st, 0.8, 0.2), 0.85)


def boom(dur=2.4):
    t = tt(dur)
    body = sine_sweep(t, 140, 36, 3.5) * env_exp(t, 2.0)
    thump = filt(noise(len(t)), "lowpass", 260) * env_exp(t, 9) * 0.6
    click = filt(noise(len(t)), "highpass", 2500) * env_exp(t, 120) * 0.35
    x = np.tanh(2.2 * (body + thump + click))
    return norm(reverb(stereo(x), 2.2, 0.22), 0.95)


def thunder(dur=4.5):
    t = tt(dur)
    crack = filt(noise(len(t)), "highpass", 1200) * env_exp(t, 18)
    for d in RNG.uniform(0.02, 0.35, 5):
        s = int(d * SR)
        crack[s:] += filt(noise(len(t) - s), "highpass", 900) * env_exp(t[: len(t) - s], 30) * RNG.uniform(0.3, 0.7)
    mod = np.abs(filt(noise(len(t)), "lowpass", 4)) * 6 + 0.3
    rumble = filt(brown(len(t)), "lowpass", 170) * mod * np.minimum(t / 0.06, 1) * env_exp(t, 0.85)
    x = norm(crack, 0.6) + norm(rumble, 1.0)
    return norm(reverb(stereo(x, 0, 0.6), 2.5, 0.3), 0.95)


def heartbeat(beats=4, bpm=74):
    period = 60 / bpm
    dur = beats * period + 0.5
    t = tt(dur)
    x = np.zeros_like(t)
    for b in range(beats):
        for off, f0, amp in ((0.0, 62, 1.0), (0.26, 74, 0.75)):
            s = int((b * period + off) * SR)
            tl = t[: len(t) - s]
            th = sine_sweep(tl, f0 * 1.5, f0 * 0.75, 18) * env_exp(tl, 14)
            th += filt(noise(len(tl)), "lowpass", 140) * env_exp(tl, 25) * 0.5
            x[s:] += amp * th
    return norm(stereo(np.tanh(1.8 * x)), 0.95)


def bell(dur=5.0, f0=470):
    t = tt(dur)
    ratios = [0.5, 1.0, 1.19, 1.51, 2.0, 2.52, 2.66, 3.01, 4.17]
    amps = [0.6, 1.0, 0.55, 0.45, 0.4, 0.25, 0.2, 0.15, 0.08]
    decays = [0.5, 0.8, 1.2, 1.5, 1.9, 2.6, 3.0, 3.8, 5.0]
    x = bell_partials(t, f0, ratios, amps, decays)
    x += filt(noise(len(t)), "bandpass", [1500, 5000]) * env_exp(t, 60) * 0.4
    return norm(reverb(stereo(x, 0.1, 0.4), 3.0, 0.35), 0.8)


def chime(dur=3.0):
    t = tt(dur)
    x = np.zeros_like(t)
    for i, f in enumerate([1174.7, 1396.9, 1661.2]):  # D6 F6 G#6 — eerie tritone
        s = int(i * 0.22 * SR)
        tl = t[: len(t) - s]
        x[s:] += bell_partials(tl, f, [1, 2.76, 5.4], [1, 0.3, 0.1], [2.5, 5, 9], 0.8)
    return norm(reverb(stereo(x, 0.2, 0.5), 2.5, 0.45), 0.6)


def shimmer(dur=2.2, lo=2000, hi=7000, rising=True):
    t = tt(dur)
    x = np.zeros_like(t)
    gl = int(0.09 * SR)
    win = np.hanning(gl)
    for _ in range(90):
        c = RNG.beta(2, 2) * (dur - 0.1)
        s = int(c * SR)
        f = RNG.uniform(lo, hi)
        x[s:s + gl] += np.sin(2 * np.pi * f * np.arange(gl) / SR) * win * RNG.uniform(0.2, 0.6)
    if rising:
        x += 0.25 * sine_sweep(t, 1800, 500, 1.2)[::-1] * np.sin(np.pi * t / dur)
    return norm(reverb(stereo(x, 0, 0.8), 2.2, 0.5), 0.6)


def shimmer_dark():
    return shimmer(2.4, 500, 1800, rising=False)


def rumble(dur=2.6):
    t = tt(dur)
    roll = 0.55 + 0.45 * np.sin(2 * np.pi * (3 + 4 * t / dur) * t) ** 2
    x = filt(brown(len(t)), "lowpass", 130) * roll * np.minimum(t / 0.6, 1)
    grit = np.zeros_like(t)
    idx = RNG.choice(len(t), 260, replace=False)
    grit[idx] = RNG.uniform(-1, 1, len(idx))
    grit = filt(grit, "bandpass", [700, 3000]) * 3
    return norm(stereo(np.tanh(1.5 * (x + grit * 0.25)), 0, 0.5), 0.9)


def crash(dur=3.0):
    t = tt(dur)
    b = boom(dur)[0][: len(t)]
    grav = np.zeros_like(t)
    idx = RNG.choice(int(0.9 * SR), 1800, replace=False)
    grav[idx] = RNG.uniform(-1, 1, len(idx))
    grav = filt(grav, "bandpass", [600, 4000]) * env_exp(t, 3.5) * 4
    burst = filt(noise(len(t)), "lowpass", 1800) * env_exp(t, 7)
    x = b + 0.6 * norm(grav) + 0.5 * norm(burst)
    return norm(reverb(stereo(np.tanh(1.5 * x), 0, 0.5), 2.0, 0.25), 0.98)


def riser(dur=1.8):
    t = tt(dur)
    p = t / dur
    fc = 300 * (4000 / 300) ** p
    x = svf_bp(noise(len(t)), fc, q=2.5) * p ** 2
    x += 0.35 * np.sin(2 * np.pi * np.cumsum(110 * (8 ** p)) / SR) * p ** 2
    x *= 1 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 22 * p) / SR)
    return norm(reverb(stereo(x, 0, 0.7), 1.2, 0.25)[:, : len(t)], 0.8)


def stamp(dur=0.9):
    t = tt(dur)
    th = sine_sweep(t, 160, 55, 20) * env_exp(t, 12)
    smack = filt(noise(len(t)), "bandpass", [600, 2500]) * env_exp(t, 45)
    x = np.tanh(2.5 * (th + 0.6 * smack))
    return norm(reverb(stereo(x), 0.9, 0.18), 0.95)


def hit(dur=2.2):
    t = tt(dur)
    x = boom(dur)[0][: len(t)] * 0.8
    x += 0.35 * bell_partials(t, 196, [1, 2.3, 3.7, 5.1], [1, 0.6, 0.4, 0.2], [2.5, 3.5, 5, 7])
    return norm(reverb(stereo(x), 2.0, 0.3), 0.9)


def footsteps(steps=4, gap=0.42):
    dur = steps * gap + 0.4
    t = tt(dur)
    x = np.zeros_like(t)
    for i in range(steps):
        s = max(0, int((i * gap + RNG.uniform(-0.02, 0.02)) * SR))
        tl = t[: len(t) - s]
        crunch = filt(noise(len(tl)), "bandpass", [1200, 5000]) * env_exp(tl, 32)
        thud = filt(noise(len(tl)), "lowpass", 180) * env_exp(tl, 40) * 1.5
        x[s:] += (crunch + thud) * (0.8 if i % 2 else 1.0)
    return norm(stereo(x, -0.1, 0.3), 0.7)


def _shehnai(t, freq_curve):
    ph = 2 * np.pi * np.cumsum(freq_curve) / SR
    saw = sum(np.sin(k * ph) / k for k in range(1, 18))
    y = filt(saw, "bandpass", [600, 1500]) * 1.5 + filt(saw, "bandpass", [2200, 3200]) * 0.8
    return y


def fanfare():
    notes = [(293.66, 0.18), (369.99, 0.18), (440.0, 0.9)]  # D4 F#4 A4
    dur = sum(d for _, d in notes) + 1.2
    t = tt(dur)
    fcurve = np.zeros_like(t)
    pos = 0
    for f, d in notes:
        n = int(d * SR)
        fcurve[pos:pos + n] = f
        pos += n
    fcurve[pos:] = notes[-1][0]
    fcurve = filt(fcurve, "lowpass", 25)
    fcurve *= 1 + 0.008 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.4) * 2, 0, 1)
    end = pos / SR
    env = np.clip(t / 0.03, 0, 1) * np.clip((end + 0.25 - t) / 0.25, 0, 1)
    x = _shehnai(t, fcurve) * env
    for i in range(3):  # nagara hits
        s = int(i * 0.18 * SR)
        tl = t[: len(t) - s]
        x[s:] += 1.2 * sine_sweep(tl, 120, 70, 15) * env_exp(tl, 10)
    return norm(reverb(stereo(x, 0, 0.3), 1.6, 0.3), 0.75)


def chisel(hits=3):
    dur = hits * 0.2 + 0.6
    t = tt(dur)
    x = np.zeros_like(t)
    for i in range(hits):
        s = int(i * 0.2 * SR)
        tl = t[: len(t) - s]
        x[s:] += bell_partials(tl, 2300 + RNG.uniform(-80, 80), [1, 1.62, 2.31], [1, 0.6, 0.3], [28, 35, 45], 3)
        x[s:] += filt(noise(len(tl)), "highpass", 3000) * env_exp(tl, 90) * 0.6
    return norm(reverb(stereo(x, 0.2, 0.3), 0.9, 0.25), 0.6)


def splash(dur=1.2):
    t = tt(dur)
    x = np.zeros_like(t)
    w = whoosh(0.35)[0][: len(x)]
    x[: len(w)] += w * 0.5
    s = int(0.3 * SR)
    tl = t[: len(t) - s]
    x[s:] += filt(noise(len(tl)), "lowpass", 1400) * env_exp(tl, 9)
    for _ in range(9):
        b = s + int(RNG.uniform(0, 0.45) * SR)
        n = int(0.03 * SR)
        f = RNG.uniform(350, 700)
        bl = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 2.5, n)) / SR) * np.hanning(n)
        x[b:b + n] += bl * 0.5
    return norm(reverb(stereo(x), 0.8, 0.2), 0.8)


def ghost(dur=2.4, base=330):
    t = tt(dur)
    glide = base * (1 + 0.25 * np.sin(np.pi * t / dur)) * (1 - 0.18 * t / dur)
    vib = 1 + 0.025 * np.sin(2 * np.pi * 5 * t)
    ph = 2 * np.pi * np.cumsum(glide * vib) / SR
    tone = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.6 * np.sin(0.5 * ph)
    tone = filt(tone, "bandpass", [250, 1300])
    breath = filt(noise(len(t)), "bandpass", [800, 3000]) * 0.18
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.3
    x = (tone + breath) * env
    return norm(reverb(stereo(x, -0.3, 0.9), 3.0, 0.6), 0.75)


def glitch(dur=0.45):
    n = int(dur * SR)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(RNG.uniform(0.01, 0.05) * SR)
        kind = RNG.integers(0, 3)
        tl = np.arange(seg) / SR
        if kind == 0:
            y = np.sign(np.sin(2 * np.pi * RNG.uniform(80, 900) * tl))
        elif kind == 1:
            y = noise(seg)
        else:
            y = np.repeat(noise(seg // 40 + 1), 40)[:seg]
        x[pos:pos + seg] = y[: n - pos] * RNG.uniform(0.3, 1)
        pos += seg
    x = filt(x, "bandpass", [200, 6000])
    return norm(stereo(x, 0, 0.5), 0.55)


def swords():
    dur = 2.2
    t = tt(dur)
    x = np.zeros_like(t)
    for i, d in enumerate([0.0, 0.32, 0.7]):
        s = int(d * SR)
        tl = t[: len(t) - s]
        x[s:] += bell_partials(tl, 1850 + i * 140, [1, 1.47, 2.09, 2.83, 3.97], [1, 0.8, 0.6, 0.4, 0.2], [5, 6, 8, 10, 13], 7)
        x[s:] += filt(noise(len(tl)), "highpass", 2500) * env_exp(tl, 50)
        x[s:] += 0.8 * sine_sweep(tl, 110, 60, 12) * env_exp(tl, 9)
    return norm(reverb(stereo(x, 0, 0.6), 1.8, 0.3), 0.75)


def wind(dur=5.0):
    t = tt(dur)
    chans = []
    for _ in range(2):
        m = filt(noise(len(t)), "lowpass", 0.6)
        m = (m - m.min()) / (m.max() - m.min() + 1e-9)
        x = svf_bp(noise(len(t)), 280 + 650 * m, q=5) * (0.4 + 0.6 * m)
        chans.append(x)
    env = np.minimum(t / 0.8, 1) * np.minimum((dur - t) / 1.0, 1)
    return norm(np.stack(chans) * env, 0.7)


def creak(dur=1.6):
    t = tt(dur)
    rate = 18 + 70 * np.sin(np.pi * t / dur) ** 2
    phase = np.cumsum(rate) / SR
    imp = np.zeros_like(t)
    idx = np.where(np.diff(np.floor(phase)) > 0)[0]
    imp[idx] = RNG.uniform(0.5, 1, len(idx))
    x = sum(filt(imp, "bandpass", [f * 0.92, f * 1.08], order=2) * g for f, g in ((420, 1), (1150, 0.7), (2300, 0.4)))
    return norm(reverb(stereo(x, 0.3, 0.3), 1.2, 0.25), 0.6)


def pop(dur=0.3):
    t = tt(dur)
    x = sine_sweep(t, 500, 1300, 30) * env_exp(t, 28)
    x += filt(noise(len(t)), "highpass", 4000) * env_exp(t, 200) * 0.3
    return norm(stereo(x), 0.6)


def ding(dur=1.4):
    """Bright two-note notification ding."""
    t = tt(dur)
    x = np.zeros_like(t)
    for i, f in enumerate([1318.5, 1975.5]):  # E6 -> B6
        s = int(i * 0.11 * SR)
        tl = t[: len(t) - s]
        x[s:] += bell_partials(tl, f, [1, 2.0, 3.0], [1, 0.25, 0.08], [6, 10, 16], 0.5)
    return norm(reverb(stereo(x, 0.1, 0.3), 1.0, 0.2), 0.7)


def fire(dur=4.0):
    """Campfire: low roar plus random crackles."""
    t = tt(dur)
    roar = filt(brown(len(t)), "lowpass", 400) * 0.5
    crk = np.zeros_like(t)
    idx = RNG.choice(len(t), 140, replace=False)
    crk[idx] = RNG.uniform(-1, 1, len(idx))
    crk = filt(crk, "bandpass", [1500, 6000]) * 6
    env = np.minimum(t / 0.4, 1) * np.minimum((dur - t) / 0.8, 1)
    return norm(stereo((roar + crk) * env, 0.1, 0.4), 0.6)


def tick(beats=6, gap=0.5):
    """Clock ticking (tick-tock) for suspense."""
    dur = beats * gap + 0.3
    t = tt(dur)
    x = np.zeros_like(t)
    for i in range(beats):
        s = int(i * gap * SR)
        tl = t[: len(t) - s]
        f0 = 2400 if i % 2 == 0 else 1900
        x[s:] += bell_partials(tl, f0, [1, 1.7, 2.6], [1, 0.4, 0.2], [90, 120, 160], 2) * 0.9
        x[s:] += filt(noise(len(tl)), "highpass", 3000) * env_exp(tl, 300) * 0.4
    return norm(stereo(x, 0.1, 0.2), 0.6)


LIBRARY = {
    "whoosh": whoosh, "boom": boom, "thunder": thunder, "heartbeat": heartbeat, "bell": bell,
    "chime": chime, "shimmer": shimmer, "shimmer_dark": shimmer_dark, "rumble": rumble,
    "crash": crash, "riser": riser, "stamp": stamp, "hit": hit, "footsteps": footsteps,
    "fanfare": fanfare, "chisel": chisel, "splash": splash, "ghost": ghost, "glitch": glitch,
    "swords": swords, "wind": wind, "creak": creak, "pop": pop, "ding": ding, "fire": fire, "tick": tick,
}
