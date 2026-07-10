# Image in Terminal.js

A lightweight Node.js application that converts any image into colorized ASCII art and prints it directly in your terminal. The program uses the brightness and hue of each pixel to choose both the character and its color, producing a terminal-friendly, visually appealing representation of your image.

## Screenshots

### Original Image
![Original Image](image.jpeg)

### Terminal Output
The program converts the above image into colorized ASCII art that displays in your terminal with proper coloring to match the original image's hues.

## Features

- **Multiple Image Format Support**: Loads images in PNG, JPEG, BMP, GIF, and more using Jimp.
- **Intelligent Resizing**: Compresses images to a customizable width (default 100px), automatically maintaining aspect ratio.
- **Terminal Character Correction**: Adjusts height to account for terminal character ratio (roughly 2:1), so the image doesn't appear stretched or distorted.
- **Smart Color Mapping**: Converts each pixel to HSV to extract brightness (V) and hue (H) for optimal color and character selection.
- **ASCII Gradient Mapping**: Maps brightness to ASCII characters (densest characters for brightest pixels): ` .'` ,:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$`
- **True Color Output**: Prints colorized ASCII art in terminal using ANSI 24-bit RGB colors.
- **Terminal Native**: Works entirely in terminal — no GUI required.
- **Customizable Width**: Adjust output width via command-line arguments to fit your terminal size.

## How It Works

### 1. Image Loading
The program reads the image from a file path supplied as a command-line argument using **Jimp** (JavaScript Image Manipulation Program), a pure JavaScript image library.

### 2. Resize & Aspect Ratio Correction
The image is resized to a specified width (default 100 pixels) while maintaining the original aspect ratio. The height is automatically divided by 2 to account for the taller shape of terminal characters, preventing vertical stretching.

```
Original: 640x480 → Resized to width 100 → Height = (480 / 640) × 100 ÷ 2 = 37.5 ≈ 38 chars
```

### 3. Pixel Processing
For each pixel in the resized image:
- Extract RGB values from the image pixel
- Convert RGB → HSV color space
- Use the V (brightness) value to determine which ASCII character to print

### 4. Character Mapping
Brightness values (0.0 to 1.0) are mapped to a gradient of characters:
- **Darkest pixels** (V ≈ 0): Rendered as spaces `" "`
- **Mid-tone pixels** (V ≈ 0.5): Rendered as characters like `"+"`, `"-"`, `"x"`
- **Brightest pixels** (V ≈ 1.0): Rendered as dense characters like `"#"`, `"@"`, `"$"`

### 5. Color Mapping
The original RGB values are preserved and printed using ANSI 24-bit escape codes:
```
\x1b[38;2;R;G;Bm   (foreground color: R, G, B values)
```

This allows each ASCII character to be displayed in its original color, creating a vibrant ASCII art representation.

### 6. Terminal Output
Characters are printed row by row, resulting in a colorized ASCII art version of your image.

## Installation

### Prerequisites
- **Node.js** (v14 or later)
- **npm** (comes with Node.js)

### Setup

1. Clone or download this repository:
```bash
git clone <repository-url>
cd image-in-terminaljs
```

2. Install dependencies:
```bash
npm install
```

This installs **Jimp**, which is required for image processing.

## Usage

### Basic Usage
Convert an image to ASCII art with default width (100 characters):
```bash
node index2.js image.jpg
```

### Custom Width
Adjust the output width to fit your terminal:
```bash
node index2.js image.jpg --width 120
```

Or using short flag:
```bash
node index2.js image.jpg -w 80
```

### Examples

**For narrower terminals** (80 columns):
```bash
node index2.js photo.png -w 80
```

**For wider terminals** (150+ columns):
```bash
node index2.js photo.png -w 150
```

**Supported image formats:**
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- BMP (`.bmp`)
- GIF (`.gif`)
- And other formats supported by Jimp

## Files

- **index1.js** - Initial implementation
- **index2.js** - Optimized version with improved color handling (recommended)
- **index3.js** - Alternative implementation
- **image.jpeg** - Sample image for testing
- **image1.jpeg** - Additional sample image for testing
- **package.json** - Node.js project configuration with dependencies

## How to Use Different Versions

Try different versions to see which rendering style you prefer:
```bash
node index1.js image.jpg -w 100
node index2.js image.jpg -w 100
node index3.js image.jpg -w 100
```

## Troubleshooting

### "Cannot find module 'jimp'"
Make sure you've installed dependencies:
```bash
npm install
```

### Image not found
Verify the image file exists and provide the correct path:
```bash
node index2.js ./path/to/image.jpg
```

### Output looks stretched or compressed
Adjust the width parameter. The program automatically corrects height based on terminal character aspect ratio, but if output still looks wrong, try a different width:
```bash
node index2.js image.jpg -w 80    # Try narrower
node index2.js image.jpg -w 120   # Try wider
```

### Colors not displaying correctly
Your terminal must support 24-bit ANSI color (also called "true color"). Most modern terminals support this:
- **macOS**: Terminal.app, iTerm2, Alacritty, Kitty
- **Linux**: Most terminals (GNOME Terminal, Konsole, xterm with 24-bit support)
- **Windows**: Windows Terminal, Alacritty, Kitty

If colors don't appear, your terminal may not support 24-bit color.

## Customization

### Modifying the Character Gradient

Edit the `GRADIENT` constant in `index2.js` to change the characters used:
```javascript
const GRADIENT =
    " .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
```

Different gradients produce different artistic effects:
- **Sparse gradient**: `" .:-=+*#%@"` (simpler, faster)
- **Extended gradient**: `" .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"` (more detail, smoother)

### Changing Default Width

Modify the `width: 100` default in the `parseArgs` function:
```javascript
const options = {
    image: null,
    width: 120,  // Change this value
};
```

## Performance

- **Processing time**: Typically < 1 second for most images
- **Terminal rendering**: Real-time output to stdout
- **Memory usage**: Minimal — Jimp handles efficient image processing

## Technical Details

### Dependencies
- **[Jimp](https://jimp.me)** - JavaScript Image Manipulation Program
  - Pure JavaScript implementation, no native dependencies
  - Supports multiple image formats
  - Handles resizing with high-quality algorithms

### Color Space Conversion
The program converts RGB to HSV because:
- **V (Value)** represents brightness, which correlates well with ASCII character density
- **H (Hue)** is preserved to select the original color for the character
- This separation allows independent brightness and color choices

### Why Divide Height by 2?
Terminal characters (monospace fonts) are typically taller than they are wide. Dividing height by 2 compensates for this aspect ratio difference, preventing images from appearing stretched vertically.

## Notes

- The program works best with images that have good contrast
- High-resolution images may take longer to process — start with `--width 80` or `--width 100`
- Small details in the original image may be lost due to the limited resolution of terminal characters
- The gradient can be customized for different artistic effects
- Tested and works on terminals with 24-bit ANSI color support

## About

A simple yet powerful Node.js application that converts any image into colorized ASCII art and prints it directly in your terminal.

## Topics

`javascript` `nodejs` `image-processing` `ascii-art` `terminal` `jimp` `ansi-colors` `node`

## Resources

- [Jimp Documentation](https://jimp.me)
- [ANSI Color Codes](https://en.wikipedia.org/wiki/ANSI_escape_code#24-bit)
- [HSV Color Space](https://en.wikipedia.org/wiki/HSL_and_HSV)

## License

This project is provided as-is for educational and personal use.

---

**Happy ASCII arting!** 🎨✨
