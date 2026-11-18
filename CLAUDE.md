# Itihaas Ke Bhoot — channel rules (read before making any video)

Channel: **Itihaas Ke Bhoot** (इतिहास के भूत), handle **@ItihaasKeBhoot**.
Niche: Indian history facts and ghost stories from around the world, as 2D stickman animated YouTube Shorts.
Brand assets: `src/brand/Brand.tsx` (ghost-king mascot; renders LogoAvatar, LogoFull, Banner).

## Format
- YouTube Shorts, 1080×1920, 30 fps, aim for **≤ 60 s**.
- Hindi voiceover; burned-in captions in **Hinglish (Roman script)**, 2–3 words per page, active word yellow, key words red (`*WORD` in script).
- Strong hook in the first 2 seconds, a twist/question at the end.
- Facts must be real: check them before writing. Frame legends as folklore ("kehte hain") and never state an unverified claim as fact.

## Visual style (user preference)
- **3D animation** for new videos (since Roopkund, Nov 2026): procedural low-poly Three.js worlds + "bean" 3D characters in `src/components/three/` (World.tsx, Bean.tsx), rendered with `--gl=swangle`. Earlier episodes are 2D stickman.
- **Free tools only.** Do not use paid AI generation (Gemini image/video, ElevenLabs credits) unless the user asks; the Gemini project has no prepaid credits.

## Voiceover (user preference — always follow)
- **Clear, natural, "viral narrator" male voice.** Clarity beats speed: every word must be pronounced fully.
- Free default: `hi-IN-MadhurNeural` at rate **+8%** with natural pauses (word 0.14 s / comma 0.24 s / sentence 0.34 s, soft 12 ms fades). The old +28% with hard-trimmed pauses sounded too fast and choppy — never go back to it.
- Premium: ElevenLabs Hindi male narrator (quota resets on the 23rd of each month) — offer it when credits are available.
- Keep scripts short enough (≈ 120–135 words) to stay ≤ 60 s at this pace instead of speeding the voice up.

## Viral script rules (WATCH; from the short-form-video skills)
- **W**in the first 3 s: most striking frame first (no fade-in), hook text on screen by frame 1, curiosity gap in the first line.
- **A**rc with one open loop (a question) answered only at the end; a visual change (cut, punch-in, stamp, badge) every ~2–4 s.
- **T**wo tracks: captions + stamps/chips must tell the story on mute.
- **C**ash the promise: the payoff answers the hook honestly (no bait-and-switch, no invented stats); legends framed as legends.
- **H**old the loop: the last line should feed back into the hook; one CTA (comment question + subscribe line).
- Keep text inside the 9:16 safe area: ~120 px clear at the top and right, ~320 px at the bottom.

## Subscribe focus (user preference — every video)
1. Mid-video **SubscribeNudge** (pill slides in, cursor clicks, "SUBSCRIBED" + bell ding) in a quiet early-middle moment, placed where it doesn't overlap the title or other text.
2. Final scene: spoken line "… ऐसे ही रहस्यों के लिए इतिहास के भूत को सब्सक्राइब करो!" with **ChannelCard** (avatar, name, handle, animated SUBSCRIBE click + bell).
3. Ask a comment question before the subscribe line (e.g. "SACH ya KAHANI?").
4. Description and pinned comment include "Subscribe: @ItihaasKeBhoot".
Components live in `src/components/Subscribe.tsx`; SFX `pop` + `ding`.

## Pipeline
```bash
python3 tools/make_voice.py episodes/<id>/script.json   # voice + word timings + timeline
python3 tools/make_audio.py <id>                        # score + SFX + -14 LUFS master
npx remotion render <Comp> out/<id>.mp4 --crf=18        # final video
```
See README.md for the script format, components and SFX list. Always render check frames and look at them before the final render.

## Each delivery includes
The MP4, plus title (with #shorts), description, hashtags (first 3 matter, max 15), tags and a pinned comment, written in Hinglish/Hindi.

## Automation (daily)
- GitHub repo: **syro777/Itihass-ke-bhoot** (user's personal account; never use the swiings2123-dev account).
- **On demand only (user preference):** never create videos on a schedule. Make a video only when the user asks. The routine in `AUTOMATION.md` runs end to end: next topic from `topics.json` → research → script → voice/audio → scenes → checked frames → commit + `episodes/LATEST` → push.
- `.github/workflows/publish.yml` (on push of `episodes/LATEST`) renders the MP4, creates the GitHub Release, and uploads to YouTube when repo variable `AUTO_UPLOAD` = `true` (only after the YouTube API audit; see `YOUTUBE_SETUP.md`). Claude Code sessions cannot create releases themselves. Secrets live only in GitHub Actions secrets.
