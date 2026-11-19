"""Validate an episode's YouTube metadata (upload.json) before it is published.

Usage: python3 tools/check_upload_meta.py episodes/<id>/upload.json
Exits non-zero with a list of problems; prints the metadata summary when it passes.
"""
import datetime as dt
import json
import re
import sys

MAX_TITLE = 100
MAX_DESC = 5000
MAX_TAGS_CHARS = 500
MAX_HASHTAGS = 15


def tags_length(tags):
    # YouTube counts quotes around tags with spaces and a separator between tags.
    return sum(len(t) + (2 if " " in t else 0) for t in tags) + max(0, len(tags) - 1)


def check(meta):
    errs = []
    for k in ("composition", "title", "description", "tags"):
        if not meta.get(k):
            errs.append(f"'{k}' missing")
    title = meta.get("title", "")
    desc = meta.get("description", "")
    tags = meta.get("tags", [])
    if len(title) > MAX_TITLE:
        errs.append(f"title is {len(title)} chars (max {MAX_TITLE})")
    if not meta.get("long") and "#shorts" not in (title + " " + desc).lower():
        errs.append("add #shorts to the title or description")
    for field, text in (("title", title), ("description", desc)):
        if "<" in text or ">" in text:
            errs.append(f"{field} contains < or > (YouTube rejects them)")
    if len(desc) > MAX_DESC:
        errs.append(f"description is {len(desc)} chars (max {MAX_DESC})")
    if "@ItihaasKeBhoot" not in desc:
        errs.append("description must contain 'Subscribe karo: @ItihaasKeBhoot'")
    n_hash = len(re.findall(r"#\w+", title + " " + desc))
    if n_hash > MAX_HASHTAGS:
        errs.append(f"{n_hash} hashtags (more than {MAX_HASHTAGS} makes YouTube ignore all of them)")
    if not isinstance(tags, list) or not all(isinstance(t, str) and t for t in tags):
        errs.append("tags must be a list of non-empty strings")
    elif tags_length(tags) > MAX_TAGS_CHARS:
        errs.append(f"tags total {tags_length(tags)} chars (max {MAX_TAGS_CHARS})")
    if meta.get("publishAt"):
        try:
            dt.datetime.fromisoformat(meta["publishAt"].replace("Z", "+00:00"))
        except ValueError:
            errs.append("publishAt must be ISO 8601 UTC, e.g. 2026-11-17T13:30:00Z")
    return errs


def main(path):
    meta = json.load(open(path, encoding="utf-8"))
    errs = check(meta)
    if errs:
        print(f"upload.json problems in {path}:")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
    print(f"OK  title ({len(meta['title'])} chars): {meta['title']}")
    print(f"    tags: {len(meta['tags'])} ({tags_length(meta['tags'])} chars)  publishAt: {meta.get('publishAt', 'immediately')}")


if __name__ == "__main__":
    main(sys.argv[1])
