# Itihaas Ke Bhoot — channel rules (read before making any video)

Channel: **Itihaas Ke Bhoot** (इतिहास के भूत), handle **@ItihaasKeBhoot**.
Niche: Indian history facts and ghost stories from around the world, as 2D stickman animated YouTube Shorts.
Brand assets: `src/brand/Brand.tsx` (ghost-king mascot; renders LogoAvatar, LogoFull, Banner).

## Format
- YouTube Shorts, 1080×1920, 30 fps, aim for **≤ 60 s**.
- Hindi voiceover; burned-in captions in **Hinglish (Roman script)**, 2–3 words per page, active word yellow, key words red (`*WORD` in script).
- Strong hook in the first 2 seconds, a twist/question at the end.
- Facts must be real: check them before writing. Frame legends as folklore ("kehte hain") and never state an unverified claim as fact.

## Voiceover (user preference — always follow)
- **Good male voice.** Default: `hi-IN-MadhurNeural` (only free Hindi male voice; the multilingual voices fail on Hindi text). Once ElevenLabs credits are available (quota resets on the 23rd of each month), offer a premium Hindi male voice.
- **Continuous delivery, short pauses:** the narrator keeps talking. `tools/make_voice.py` trims silences to word 0.05 s / comma 0.09 s / sentence 0.14 s and uses tiny gaps between scenes. Don't lengthen these.
- **Slightly fast speed:** rate `+28%` (was +20% on the first video, which the user found too slow).

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
- GitHub repo: **syro777/itihaas-ke-bhoot** (user's personal account; never use the swiings2123-dev account).
- A daily scheduled task runs `AUTOMATION.md` end to end: next topic from `topics.json` → research → script → voice/audio → scenes → checked render → commit → GitHub Release.
- `.github/workflows/youtube-upload.yml` uploads the release to YouTube when repo variable `AUTO_UPLOAD` = `true` (only after the YouTube API audit; see `YOUTUBE_SETUP.md`). Secrets live only in GitHub Actions secrets.
