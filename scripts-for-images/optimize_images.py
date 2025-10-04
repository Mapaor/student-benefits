#!/usr/bin/env python3
"""
optimitza_imatges.py

Optimitza imatges locals per web/SEO:
 - redimensiona (ample màxim = 800px)
 - converteix a WebP (qualitat 80)
 - neteja noms de fitxer

Ús:
    python optimize_images.py imatges/ sortida/
"""

import os
import re
import sys
from pathlib import Path
from PIL import Image

MAX_WIDTH = 700   # comprimim a màxim 700px d'amplada per millor SEO
QUALITY = 80       # qualitat WebP recomanada

def seo_friendly_name(name: str) -> str:
    """Converteix un nom de fitxer a SEO-friendly."""
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '-', name)
    name = re.sub(r'-+', '-', name)
    return name.strip('-')

def process_image(input_path: Path, output_dir: Path):
    try:
        img = Image.open(input_path)
        # redimensiona si cal
        w, h = img.size
        if w > MAX_WIDTH:
            new_h = int(h * MAX_WIDTH / w)
            img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

        # extreure nom base SEO-friendly
        stem = seo_friendly_name(input_path.stem)

        # decidir extensió final
        if img.mode in ("RGBA", "LA") or input_path.suffix.lower() in (".png", ".webp", ".svg"):
            out_name = f"{stem}.webp"
            out_path = output_dir / out_name
            img.save(out_path, "WEBP", quality=QUALITY, method=6)
        else:
            out_name = f"{stem}.webp"
            out_path = output_dir / out_name
            img.save(out_path, "WEBP", quality=QUALITY, method=6)

        print(f"[+] {input_path.name} → {out_name}")
    except Exception as e:
        print(f"[!] Error amb {input_path.name}: {e}")

def main():
    if len(sys.argv) < 3:
        print("Ús: python optimitza_imatges.py <carpeta_entrada> <carpeta_sortida>")
        sys.exit(1)

    in_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    for f in in_dir.iterdir():
        if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".svg"):
            process_image(f, out_dir)

    print(f"[✓] Optimització completada! Imatges guardades a {out_dir}")

if __name__ == "__main__":
    main()
