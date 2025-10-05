#!/usr/bin/env python3
"""
optimize-webp.py

Optimizes images for web/SEO:
 - resizes to 350px max width (optimized for student-benefits site)
 - converts to WebP (quality 85)
 - maintains original filenames

Usage:
    python optimize-webp.py
    (processes assets/benefits/*.webp → assets/benefits/optimized/*.webp)
"""

import os
import re
import sys
from pathlib import Path
from PIL import Image

MAX_WIDTH = 350    # optimal width for the student-benefits layout
QUALITY = 85       # WebP quality (balance between size and quality)

def process_image(input_path: Path, output_dir: Path):
    """Process a single image: resize and convert to WebP."""
    try:
        img = Image.open(input_path)
        original_size = input_path.stat().st_size
        
        # Resize if necessary
        w, h = img.size
        if w > MAX_WIDTH:
            new_h = int(h * MAX_WIDTH / w)
            img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
            print(f"  Resized from {w}x{h} to {MAX_WIDTH}x{new_h}")
        
        # Keep original filename
        out_name = input_path.name
        out_path = output_dir / out_name
        
        # Save as WebP
        img.save(out_path, "WEBP", quality=QUALITY, method=6)
        
        new_size = out_path.stat().st_size
        savings = ((original_size - new_size) / original_size * 100)
        
        print(f"[+] {input_path.name}")
        print(f"    {original_size/1024:.2f} KB → {new_size/1024:.2f} KB (saved {savings:.1f}%)")
        
        return original_size, new_size
    except Exception as e:
        print(f"[!] Error processing {input_path.name}: {e}")
        return 0, 0

def main():
    # Set up paths
    script_dir = Path(__file__).parent
    in_dir = script_dir / "assets" / "benefits"
    out_dir = in_dir / "optimized"
    
    # Verify input directory exists
    if not in_dir.exists():
        print(f"[!] Input directory not found: {in_dir}")
        print(f"    Make sure you're running this from the project root")
        sys.exit(1)
    
    # Create output directory
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🖼️  Image Optimization for Student Benefits")
    print(f"=" * 60)
    print(f"Input:  {in_dir}")
    print(f"Output: {out_dir}")
    print(f"Target: {MAX_WIDTH}px wide, {QUALITY}% quality WebP")
    print(f"=" * 60)
    print()
    
    # Process all WebP files
    webp_files = list(in_dir.glob("*.webp"))
    
    if not webp_files:
        print("[!] No .webp files found in assets/benefits/")
        sys.exit(1)
    
    print(f"Found {len(webp_files)} images to optimize\n")
    
    total_original = 0
    total_optimized = 0
    processed = 0
    
    for f in webp_files:
        orig, opt = process_image(f, out_dir)
        total_original += orig
        total_optimized += opt
        if opt > 0:
            processed += 1
        print()
    
    # Summary
    print(f"=" * 60)
    print(f"📊 Summary:")
    print(f"   Processed: {processed}/{len(webp_files)} images")
    print(f"   Total original size: {total_original/1024:.2f} KB")
    print(f"   Total optimized size: {total_optimized/1024:.2f} KB")
    print(f"   Total savings: {(total_original-total_optimized)/1024:.2f} KB ({((total_original-total_optimized)/total_original*100):.1f}%)")
    print(f"=" * 60)
    print(f"\n✅ Optimization complete!")
    print(f"📁 Optimized images saved to: {out_dir}")
    print(f"\n⚠️  Next steps:")
    print(f"   1. Review the optimized images")
    print(f"   2. Update benefits.json to point to optimized/ subfolder")
    print(f"   3. Test the website with the new images\n")

if __name__ == "__main__":
    main()