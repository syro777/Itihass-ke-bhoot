# Hindi Stickman Shorts — production pipeline

Animated 2D stickman YouTube Shorts (1080×1920, 30 fps) about Indian history and ghost stories, with a Hindi voiceover, Hinglish word-by-word captions, synthesized sound effects and an adaptive background score.

## One-time setup
```bash
npm install
pip install edge-tts numpy scipy
```

## Make an episode
1. **Script**: copy `episodes/bhangarh/script.json` to `episodes/<id>/script.json`. For each scene, set:
   - `hi`: the Devanagari text the voice reads.
   - `en`: the Hinglish caption words, one per spoken word, in the same order. Prefix a word with `*` to make it red and bigger.
   - `mood`: `tense | mystery | royal | calm | climax | creepy | sad` (drives the music).
   - `sfx`: cues tied to a caption word, e.g. `{"at": "mana", "sfx": "thunder"}`.
2. **Voice and timeline**: `python3 tools/make_voice.py episodes/<id>/script.json`
   This writes `src/data/<id>.timeline.json` and fails loudly if Hindi words and caption words don't line up.
3. **Music, SFX and mastering**: `python3 tools/make_audio.py <id>` writes `public/<id>/mix.wav` at -14 LUFS.
4. **Animation**: write `src/episodes/<id>/Scenes.tsx` using the shared parts in `src/components/` (Stickman rig and poses, Fort/Hut/Gate/RuinedHouses, WarningBoard/HighwaySign/DateBadge/NameTag/Boulder/Pin, Sky/Moon/Hills/Fog/Lightning/Dust/Sparkles), then register the composition in `src/Root.tsx`.
5. **Preview**: `npx remotion studio`
6. **Render**: `npx remotion render <CompositionId> out/<id>.mp4 --crf=18`

## Sound effects available (`tools/sfx.py`)
ding, whoosh, boom, thunder, heartbeat, bell, chime, shimmer, shimmer_dark, rumble, crash, riser (auto-lengths to the next hit), stamp, hit, footsteps, fanfare (shehnai + nagara), chisel, splash, ghost, glitch, swords, wind, creak, pop

## Voices
Channel default (see CLAUDE.md): `hi-IN-MadhurNeural` male, rate +28%, silences trimmed so narration is continuous. Compare voices with `python3 tools/voice_samples.py episodes/<id>/script.json <scene ids>`.
Free Microsoft neural voices: `hi-IN-MadhurNeural` (male) and `hi-IN-SwaraNeural` (female). To switch to ElevenLabs later, change only the voice step: anything that outputs per-word timings can feed the same timeline.

## Licensing
- Remotion is free for individuals and companies of up to 3 people. Larger companies need a Remotion company license.
- Fonts (Poppins, Creepster, Hind, Teko) are Google Fonts under the SIL Open Font License.
- All audio is generated procedurally (no samples).
