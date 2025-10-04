#!/usr/bin/env python3
"""
download_page_images_to_zip.py

Ús:
    python download_page_images_to_zip.py https://exemple.com sortida.zip --wait 5

Aquest script:
 - obre la URL amb Playwright (headless Chromium)
 - intercepta totes les responses i filtra les imatges
 - desa les imatges dins d'un ZIP
"""

import argparse
import os
import re
from urllib.parse import urlparse, unquote
from zipfile import ZipFile
from collections import OrderedDict
from playwright.sync_api import sync_playwright
import time

SAFE_NAME_RE = re.compile(r'[^A-Za-z0-9._-]')

def safe_filename_from_url(url, default_ext="img"):
    """Genera un nom de fitxer segur basat en la URL."""
    p = urlparse(url)
    path = unquote(p.path or "")
    name = os.path.basename(path)
    if not name:
        name = f"image.{default_ext}"
    # if no extension, try guess from path; otherwise keep generic extension
    if '.' not in name:
        name = name + f".{default_ext}"
    # sanitize
    name = SAFE_NAME_RE.sub('_', name)
    return name

def main():
    parser = argparse.ArgumentParser(description="Descarrega imatges de la pàgina i les posa en un ZIP.")
    parser.add_argument("url", help="URL de la pàgina a analitzar")
    parser.add_argument("zip_out", help="Nom del fitxer zip de sortida (ex: images.zip)")
    parser.add_argument("--wait", type=float, default=3.0,
                        help="Segons addicionals per esperar després de networkidle (default 3)")
    parser.add_argument("--timeout", type=int, default=30000,
                        help="Timeout per la càrrega de la pàgina en ms (default 30000)")
    args = parser.parse_args()

    images = OrderedDict()  # url -> (mime, bytes)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        def on_response(response):
            try:
                req = response.request
                # Primer intent: usar resource_type
                if req.resource_type == "image":
                    # accept
                    ct = response.headers.get("content-type", "")
                    try:
                        body = response.body()
                        images[response.url] = (ct, body)
                    except Exception:
                        pass
                    return

                # Si no és explícitament resource_type image, comprovar content-type
                ct = response.headers.get("content-type", "")
                if ct and ct.startswith("image"):
                    try:
                        body = response.body()
                        images[response.url] = (ct, body)
                    except Exception:
                        pass
            except Exception:
                # ignora errors de parsing o responses tancades
                pass

        page.on("response", on_response)

        print(f"[+] Obrint {args.url} ...")
        page.goto(args.url, wait_until="networkidle", timeout=args.timeout)
        # esperar un parell de segons perquè carreguin lazy images per scroll / js
        time.sleep(args.wait)

        # opcional: fer scroll pau per forçar lazy-load
        try:
            viewport_height = page.evaluate("() => window.innerHeight")
            total_height = page.evaluate("() => document.body.scrollHeight")
            y = 0
            step = viewport_height // 2 or 400
            while y < total_height:
                page.evaluate(f"() => window.scrollTo(0, {y})")
                time.sleep(0.2)
                y += step
            # esperar una mica més per rescatar demandes
            time.sleep(1.0)
        except Exception:
            pass

        # tancar context i navegador
        context.close()
        browser.close()

    if not images:
        print("[!] No s'han trobat imatges.")
        return

    # Escriure a zip
    used_names = {}
    with ZipFile(args.zip_out, "w") as zf:
        for url, (ct, body) in images.items():
            # ext a partir de content-type si existeix
            ext = None
            if ct and '/' in ct:
                ext_candidate = ct.split('/')[-1].split(';')[0].strip()
                if ext_candidate and re.match(r'^[a-z0-9]+$', ext_candidate):
                    ext = ext_candidate
            filename = safe_filename_from_url(url, default_ext=ext or "img")
            # evitar duplicats
            base, extn = os.path.splitext(filename)
            counter = 1
            candidate = filename
            while candidate in used_names:
                candidate = f"{base}_{counter}{extn}"
                counter += 1
            used_names[candidate] = True
            try:
                zf.writestr(candidate, body)
                print(f"[+] Afegit: {candidate}  <- {url}  (ct={ct})")
            except Exception as e:
                print(f"[!] Error escrivint {candidate}: {e}")

    print(f"[✓] Fet. ZIP creat: {args.zip_out} ( {len(used_names)} imatges )")

if __name__ == "__main__":
    main()
