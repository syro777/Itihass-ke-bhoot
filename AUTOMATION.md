# Daily routine — one new Short per day

The scheduled task runs this routine once a day in a fresh cloud session. Follow it end to end. Read `CLAUDE.md` first: its voice, caption and subscribe rules are mandatory.

## 0. Setup (≈2 min)
1. Attach the repo with push access (`add_repo` syro777/itihaas-ke-bhoot, access "push"), clone it, `cd` into it.
2. Install the tools:
   ```bash
   npm ci
   pip install -q edge-tts numpy scipy
   npx remotion browser ensure
   ```

## 1. Pick today's topic
Take the first entry in `topics.json` with `"status": "todo"`. If none is left, add 10 new topics following the notes in `topics.json` and the mix used so far, then pick the first.

## 2. Research (facts must be real)
Use WebSearch (2–3 searches). Separate **verified facts** (dates, places, people) from **legends** (say "kehte hain"). Leave out any claim you can't verify. Put the fact notes in the script's `notes`.

## 3. Script → `episodes/<id>/script.json`
Copy the structure of `episodes/kuldhara/script.json`:
- 8–9 scenes: hook (first 2 s must grab), location, history, 3–4 story beats, twist / real explanation, cta.
- `hi` in Devanagari, `en` in Hinglish with **one caption word per spoken word** (`*WORD` = red emphasis). Spell numbers that are spoken in Hindi as words only if the caption uses digits for the same single token (e.g. चौरासी ↔ `*84`).
- Final scene must end with: "… कमेंट में बताओ, और ऐसे ही रहस्यों के लिए इतिहास के भूत को सब्सक्राइब करो!" plus an A-vs-B question before it.
- SFX cues on key words, a `mood` per scene.

## 4. Voice and audio
```bash
python3 tools/make_voice.py episodes/<id>/script.json   # must print TOTAL ≤ 60 s
python3 tools/make_audio.py <id>
```
If TOTAL > 60 s, shorten the script and re-run. Fix any ALIGN ERROR by matching caption words to the spoken words.

## 5. Animation → `src/episodes/<id>/Scenes.tsx` + `<Name>.tsx`
- Copy `src/episodes/kuldhara/` as the template (composition, TopTitle, captions, progress bar, `SubscribeNudge` in an early-middle scene with free sky, `ChannelCard` in the CTA).
- Reuse `src/components/*` (Stickman rig/poses/outfits, Buildings, Desert, Props, Scenery, Subscribe). Add new reusable components when a topic needs them.
- Every beat is tied to a spoken word with `wordFrame(words, "<caption key>")`.
- Register the composition in `src/Root.tsx`. Run `npx tsc --noEmit`.

## 6. Check frames, then render
```bash
npx remotion render <Name> out/check --frames=<2 per scene + nudge + cta> --image-format=jpeg --scale=0.5 --is-production=false
```
Tile them into a contact sheet and **look at it**. Fix: text overlapping the title/tags/captions, things cut at the edges, characters hidden, empty scenes. Re-check after fixes. Then:
```bash
npx remotion render <Name> out/<id>.mp4 --codec=h264 --crf=18 --audio-bitrate=192k
```
Verify with ffprobe/ffmpeg: 1080×1920, 30 fps, duration ≤ 60.5 s, loudness ≈ -14 LUFS.

## 7. Upload kit
- `episodes/<id>/youtube.md` — titles, description, tags, pinned comment (same style as kuldhara).
- `episodes/<id>/upload.json`:
  ```json
  {"title": "... #shorts", "description": "...", "tags": ["..."], "categoryId": "27",
   "publishAt": "<today 19:00 IST as UTC, e.g. 2026-11-17T13:30:00Z>"}
  ```
  If it is already past 18:30 IST, use tomorrow 19:00 IST.

## 8. Publish
1. In `topics.json` set the topic to `"status": "done", "date": "<YYYY-MM-DD>"`.
2. Commit everything except `out/`, `node_modules/` and build files (see `.gitignore`), message `Episode: <id>`, and push to `main`.
3. Create the release (this triggers the YouTube upload workflow when AUTO_UPLOAD is on):
   ```bash
   gh release create ep-<YYYY-MM-DD>-<id> out/<id>.mp4 episodes/<id>/upload.json episodes/<id>/youtube.md \
     --title "<YYYY-MM-DD>: <topic title>" --notes-file episodes/<id>/youtube.md
   ```

## 9. Report
End with a short Hinglish summary: topic, duration, the facts vs legends used, the release link, and whether the YouTube upload is automatic (AUTO_UPLOAD on) or the user should upload it from the release. If any step failed, don't create the release; say what failed.
