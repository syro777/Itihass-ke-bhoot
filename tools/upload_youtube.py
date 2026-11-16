"""Upload a rendered Short to YouTube with the metadata in upload.json.

Usage: python tools/upload_youtube.py <video.mp4> <upload.json>
Env:   YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN  (GitHub Actions secrets)

upload.json:
{
  "title": "...", "description": "...", "tags": ["..."],
  "categoryId": "27",                     # 27 = Education, 24 = Entertainment
  "publishAt": "2026-11-17T13:30:00Z",     # optional: schedule (UTC); omit to publish immediately
  "privacy": "public"                      # used when publishAt is absent
}
Note: uploads from a Google Cloud project that has not passed the YouTube API audit are locked
to private by YouTube. Only enable AUTO_UPLOAD after the audit is approved (see YOUTUBE_SETUP.md).
"""
import datetime as dt
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


def main(video_path, meta_path):
    missing = [k for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN") if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing GitHub secrets: {', '.join(missing)}. Add them as described in YOUTUBE_SETUP.md (step 5).")
    meta = json.load(open(meta_path, encoding="utf-8"))
    creds = Credentials(
        token=None,
        refresh_token=os.environ["YT_REFRESH_TOKEN"],
        client_id=os.environ["YT_CLIENT_ID"],
        client_secret=os.environ["YT_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
    )
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)

    status = {"selfDeclaredMadeForKids": False}
    publish_at = meta.get("publishAt")
    if publish_at and dt.datetime.fromisoformat(publish_at.replace("Z", "+00:00")) > dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=15):
        status.update(privacyStatus="private", publishAt=publish_at)
    else:
        status["privacyStatus"] = meta.get("privacy", "public")

    body = {
        "snippet": {
            "title": meta["title"][:100],
            "description": meta["description"][:5000],
            "tags": meta.get("tags", [])[:30],
            "categoryId": meta.get("categoryId", "27"),
            "defaultLanguage": "hi",
            "defaultAudioLanguage": "hi",
        },
        "status": status,
    }
    media = MediaFileUpload(video_path, mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        progress, resp = req.next_chunk()
        if progress:
            print(f"uploaded {int(progress.progress() * 100)}%")
    vid = resp["id"]
    url = f"https://youtube.com/shorts/{vid}"
    st = resp["status"]
    print(f"OK {url} status={st.get('privacyStatus')} publishAt={st.get('publishAt')}")
    with open("youtube_url.txt", "w") as f:
        f.write(url + "\n")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(f"### Uploaded to YouTube\n- {url}\n- Title: {body['snippet']['title']}\n"
                    f"- Privacy: {st.get('privacyStatus')}, publish at: {st.get('publishAt', 'now')}\n")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
