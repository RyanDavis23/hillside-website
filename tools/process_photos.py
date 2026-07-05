#!/usr/bin/env python3
"""Process raw gallery JPEGs into web tiers + manifest.

Tiers (long edge):  thumb 480 q72 · mid 1024 q78 · full 1600 q82
Manifest: ordered records {n, w, h, c (avg color), s (scene idx), f (source name)}
Order: scene display order (Cocktail Hour, Auction, Party, Film), then `order`.
"""
import json, os, sys
from multiprocessing import Pool
from PIL import Image

SCRATCH = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(SCRATCH, "photos_raw")
REPO = "/Users/primary/Desktop/Hillside Website"
OUT = os.path.join(REPO, "assets", "gallery")

SCENES = ["Cocktail Hour", "Auction", "Party", "Film"]
TIERS = {"thumb": (480, 72), "mid": (1024, 78), "full": (1600, 82)}

for t in TIERS:
    os.makedirs(os.path.join(OUT, t), exist_ok=True)

recs = json.load(open(os.path.join(SCRATCH, "photo_index.json")))
recs = [r for r in recs if r.get("ok")]
recs.sort(key=lambda r: (SCENES.index(r["scene"]), r["order"]))

def work(args):
    seq, rec = args
    src = os.path.join(RAW, f"{rec['id']}.jpg")
    im = Image.open(src).convert("RGB")
    w, h = im.size
    # average color via 1px downsample
    avg = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    color = "#%02x%02x%02x" % avg
    name = f"{seq:03d}.webp"
    for tier, (edge, q) in TIERS.items():
        scale = edge / max(w, h)
        if scale < 1:
            tw, th = round(w * scale), round(h * scale)
            tim = im.resize((tw, th), Image.LANCZOS)
        else:
            tim = im
        tim.save(os.path.join(OUT, tier, name), "WEBP", quality=q, method=4)
    return {"n": seq, "w": w, "h": h, "c": color, "s": SCENES.index(rec["scene"]), "f": rec["file"]}

if __name__ == "__main__":
    jobs = list(enumerate(recs, start=1))
    with Pool(6) as p:
        manifest = p.map(work, jobs)
    manifest.sort(key=lambda m: m["n"])
    out = {"scenes": SCENES, "photos": manifest}
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"processed {len(manifest)} photos -> {OUT}")
    for i, s in enumerate(SCENES):
        print(f"  {s}: {sum(1 for m in manifest if m['s'] == i)}")
