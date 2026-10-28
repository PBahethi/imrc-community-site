#!/usr/bin/env python3
"""Generate subscribable iCalendar files from observances.json.

observances.json is the single source of truth for the festival & holiday
calendar. Run this script after editing it:

    python3 scripts/build_observances.py

It writes calendars/observances/all.ics plus one file per category. Output is
deterministic (fixed DTSTAMP, sorted events) so diffs stay reviewable.
"""
import datetime as dt
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "observances.json"
OUT = ROOT / "calendars" / "observances"
DTSTAMP = "20261028T000000Z"


def esc(text):
    return (str(text).replace("\\", "\\\\").replace(";", "\\;")
            .replace(",", "\\,").replace("\r\n", "\\n").replace("\n", "\\n"))


def fold(line):
    """Fold a content line at 75 octets without splitting UTF-8 characters."""
    raw = line.encode("utf-8")
    if len(raw) <= 75:
        return [line]
    parts, current, limit = [], b"", 75
    for ch in line:
        b = ch.encode("utf-8")
        if len(current) + len(b) > limit:
            parts.append(current.decode("utf-8"))
            current, limit = b"", 74  # continuation lines start with a space
        current += b
    parts.append(current.decode("utf-8"))
    return [parts[0]] + [" " + p for p in parts[1:]]


def ymd(value):
    return value.replace("-", "")


def next_day(value):
    return (dt.date.fromisoformat(value) + dt.timedelta(days=1)).strftime("%Y%m%d")


def vevent(event, labels):
    tentative = event["status"] == "tentative"
    summary = f"{event['name']} · {event['hindi']}" + (" (tentative)" if tentative else "")
    desc = [event["description"]]
    if event.get("note"):
        desc.append(event["note"])
    desc.append("Date status: " + ("tentative, confirm before planning" if tentative else "verified against the source"))
    desc.append("Source: " + event["source"])
    lines = [
        "BEGIN:VEVENT",
        f"UID:{event['id']}@imrc-community-site",
        f"DTSTAMP:{DTSTAMP}",
        f"DTSTART;VALUE=DATE:{ymd(event['start'])}",
        f"DTEND;VALUE=DATE:{next_day(event.get('end', event['start']))}",
        "SUMMARY:" + esc(summary),
        "DESCRIPTION:" + esc("\n\n".join(desc)),
        "CATEGORIES:" + esc(labels[event["category"]]),
        "URL:" + event["source"],
        "STATUS:" + ("TENTATIVE" if tentative else "CONFIRMED"),
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
    ]
    return lines


def calendar(name, events, labels, description):
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//IMRC Community//Festival and Holiday Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:" + esc(name),
        "X-WR-CALDESC:" + esc(description),
        "REFRESH-INTERVAL;VALUE=DURATION:P1W",
        "X-PUBLISHED-TTL:P1W",
    ]
    for event in events:
        lines += vevent(event, labels)
    lines.append("END:VCALENDAR")
    out = []
    for line in lines:
        out += fold(line)
    return "\r\n".join(out) + "\r\n"


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    labels = {c["id"]: c["label"] for c in data["meta"]["categories"]}
    events = sorted(data["events"], key=lambda e: (e["start"], e["id"]))
    OUT.mkdir(parents=True, exist_ok=True)
    note = data["meta"]["locationNote"]
    files = {"all": ("IMRC festivals & holidays", events)}
    for cid, label in labels.items():
        files[cid] = (f"IMRC · {label}", [e for e in events if e["category"] == cid])
    for slug, (name, subset) in files.items():
        path = OUT / f"{slug}.ics"
        path.write_bytes(calendar(name, subset, labels, note).encode("utf-8"))
        print(f"wrote {path.relative_to(ROOT)} ({len(subset)} events)")


if __name__ == "__main__":
    main()
