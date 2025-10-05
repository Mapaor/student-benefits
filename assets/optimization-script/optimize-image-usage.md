# Image Optimization Script

This folder contains `optimize-image.py`, a Python script for optimizing images.

### Requirements

- Requires pillow (`pip install pillow`)
- If you want to convert SVG images it also requires cairosvg (`pip install cairosvg`)

### Note
The input image needs to be in the same directory as the python script.

### Usage
```bash
python optimize-image.py <input_file> <output_file>
```

**Examples:**
```bash
python optimize-image.py example.png example.webp
python optimize-image.py photo.jpg optimized.webp
python optimize-image.py logo.svg logo.webp
```

**Supported Formats:**
- PNG
- JPG/JPEG
- WEBP
- SVG (requires `cairosvg`)

### What it does
- Resizes images to 350px width (maintains aspect ratio)
- Converts to WebP format (85% quality)
- Shows file size savings

### Why 350px?

It's just the dimensions needed for this website ([studentbenefits.qzz.io](htttps://studentbenefits.qzz.io)) in the desktop and mobile versions. The images in the benefits cards occupy 344px of width maximum.
