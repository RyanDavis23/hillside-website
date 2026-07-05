#!/usr/bin/env python3
"""Download every photo of the pic-time gallery (lowres/1600px tier, the
resolution pic-time itself serves in its viewer) plus a structured index.

gallery.json  scenes[].photos: flat stride-5 [idOffset, ?, ?, order, propIdx]
gallery_meta.json photos:      flat stride-4 [idOffset, dateTakenUnix, palette(20 ints), filename]
Photo URL: {BASE}/lowres/{minId+idOffset}.jpg?rotate=0
"""
import json, os, sys, time, urllib.request, concurrent.futures as cf

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = "https://pictime6eus1public-pub-f5djhafrcqd3djf7.a02.azurefd.net/pictures/51/857/51857431/5t7ciipmote4zpva68"
OUT = os.path.join(SCRATCH, "photos_raw")
os.makedirs(OUT, exist_ok=True)

gallery = json.load(open(os.path.join(SCRATCH, "gallery.json")))
meta = json.load(open(os.path.join(SCRATCH, "gallery_meta.json")))
MIN_ID = gallery["minId"]
assert meta["minId"] == MIN_ID

# --- index meta by idOffset ---
m = meta["photos"]
meta_by_off = {}
for i in range(0, len(m), 4):
    off, taken, palette, name = m[i], m[i+1], m[i+2], m[i+3]
    meta_by_off[off] = {"taken": taken, "palette": palette, "file": name}

# --- walk scenes in display order ---
records = []
for scene in gallery["scenes"]:
    photos = scene.get("photos") or []
    for i in range(0, len(photos), 5):
        off, _a, _b, order, prop_idx = photos[i:i+5]
        rec = {
            "scene": scene["nm"],
            "sceneId": scene["id"],
            "order": order,
            "id": MIN_ID + off,
            "off": off,
            "prop": gallery["proportions"][prop_idx] if prop_idx < len(gallery["proportions"]) else None,
        }
        rec.update(meta_by_off.get(off, {"taken": None, "palette": None, "file": None}))
        records.append(rec)

print(f"total records: {len(records)}")
for s in gallery["scenes"]:
    n = len(s.get("photos") or []) // 5
    if n: print(f"  {s['nm']}: {n}")

# --- download ---
def fetch(rec, tries=4):
    url = f"{BASE}/lowres/{rec['id']}.jpg?rotate=0"
    dest = os.path.join(OUT, f"{rec['id']}.jpg")
    if os.path.exists(dest) and os.path.getsize(dest) > 10_000:
        rec["ok"] = True; return rec
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            if data[:2] != b"\xff\xd8":  # JPEG magic
                raise ValueError(f"not a JPEG ({len(data)} bytes)")
            with open(dest, "wb") as f:
                f.write(data)
            rec["ok"] = True; rec["bytes"] = len(data)
            return rec
        except Exception as e:
            rec["err"] = str(e)
            time.sleep(1.5 * (t + 1))
    rec["ok"] = False
    return rec

done = 0
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for rec in ex.map(fetch, records):
        done += 1
        if done % 50 == 0:
            print(f"  {done}/{len(records)} downloaded...", flush=True)

ok = [r for r in records if r.get("ok")]
fail = [r for r in records if not r.get("ok")]
print(f"OK: {len(ok)}  FAILED: {len(fail)}")
for r in fail[:12]:
    print("  FAIL", r["scene"], r["id"], r.get("err", "?"))

json.dump(records, open(os.path.join(SCRATCH, "photo_index.json"), "w"), indent=1)
print("index written to photo_index.json")
