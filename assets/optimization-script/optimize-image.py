#!/usr/bin/env python3
"""
optimize-image.py

Optimizes a single image for web/SEO:
 - resizes to 350px max width
 - converts to WebP (quality 85)
 - works with PNG, JPG, WEBP, and SVG formats

Requirements:
    pip install Pillow
    pip install cairosvg  # Optional, only needed for SVG support

Usage:
    python optimize-image.py <input_file> <output_file>
    
Examples:
    python optimize-image.py example.png example.webp
    python optimize-image.py photo.jpg optimized.webp
    python optimize-image.py logo.svg logo.webp
"""

import sys
from pathlib import Path
from PIL import Image
import io

MAX_WIDTH = 350    # optimal width for web images
QUALITY = 85       # WebP quality (balance between size and quality)

# Supported input formats
SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.webp', '.svg'}

# Check if cairosvg is available for SVG support
try:
    import cairosvg
    SVG_SUPPORT = True
except ImportError:
    SVG_SUPPORT = False

def optimize_image(input_path: Path, output_path: Path):
    """
    Optimize a single image: resize to MAX_WIDTH and convert to WebP.
    
    Args:
        input_path: Path to the input image
        output_path: Path for the output WebP file
    """
    try:
        original_size = input_path.stat().st_size
        
        # Handle SVG files specially
        if input_path.suffix.lower() == '.svg':
            if not SVG_SUPPORT:
                print("❌ Error: SVG support requires 'cairosvg' library")
                print("Install it with: pip install cairosvg")
                sys.exit(1)
            
            print(f"Converting SVG to PNG first...")
            
            # Convert SVG to PNG in memory
            png_data = cairosvg.svg2png(url=str(input_path), output_width=MAX_WIDTH)
            img = Image.open(io.BytesIO(png_data))
            
            w, h = img.size
            print(f"SVG converted to: {w}x{h}")
        else:
            # Open regular image formats
            img = Image.open(input_path)
            
            # Get original dimensions
            w, h = img.size
            print(f"Original: {w}x{h} ({original_size/1024:.2f} KB)")
            
            # Resize if necessary
            if w > MAX_WIDTH:
                new_h = int(h * MAX_WIDTH / w)
                img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
                print(f"Resized to: {MAX_WIDTH}x{new_h}")
            else:
                print(f"No resize needed (already {w}px wide)")
        
        # Ensure output path has .webp extension
        if output_path.suffix.lower() != '.webp':
            output_path = output_path.with_suffix('.webp')
            print(f"Output extension corrected to .webp")
        
        # Convert RGBA to RGB if necessary (WebP doesn't handle transparency well in all cases)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Keep transparency for RGBA images
            if img.mode == 'P':
                img = img.convert('RGBA')
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save as WebP
        img.save(output_path, "WEBP", quality=QUALITY, method=6)
        
        new_size = output_path.stat().st_size
        savings = ((original_size - new_size) / original_size * 100) if original_size > 0 else 0
        
        print(f"Optimized: {new_size/1024:.2f} KB", end="")
        if savings > 0:
            print(f" (saved {savings:.1f}%)")
        else:
            print()
        print(f"\n✅ Success! Saved to: {output_path}")
        
    except FileNotFoundError:
        print(f"❌ Error: Input file not found: {input_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        sys.exit(1)

def main():
    # Check arguments
    if len(sys.argv) != 3:
        print("❌ Error: Invalid number of arguments\n")
        print("Usage:")
        print("    python optimize-image.py <input_file> <output_file>\n")
        print("Examples:")
        print("    python optimize-image.py example.png example.webp")
        print("    python optimize-image.py photo.jpg optimized.webp")
        print("    python optimize-image.py logo.svg logo.webp")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Convert to Path objects
    input_path = Path(input_file)
    output_path = Path(output_file)
    
    # Validate input file exists
    if not input_path.exists():
        print(f"❌ Error: Input file does not exist: {input_path}")
        sys.exit(1)
    
    # Validate input file format
    if input_path.suffix.lower() not in SUPPORTED_FORMATS:
        print(f"❌ Error: Unsupported format: {input_path.suffix}")
        print(f"Supported formats: {', '.join(sorted(SUPPORTED_FORMATS))}")
        sys.exit(1)
    
    # Check SVG support if needed
    if input_path.suffix.lower() == '.svg' and not SVG_SUPPORT:
        print(f"⚠️  Warning: SVG files require the 'cairosvg' library")
        print(f"Install it with: pip install cairosvg")
        print(f"\nSupported formats without cairosvg: .png, .jpg, .jpeg, .webp")
        sys.exit(1)
    
    # Process the image
    print(f"🖼️  Optimizing: {input_path.name}")
    print(f"Target: {MAX_WIDTH}px wide, {QUALITY}% quality WebP")
    print("-" * 50)
    
    optimize_image(input_path, output_path)

if __name__ == "__main__":
    main()
