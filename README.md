# Image in Terminal.js

Transform any image into stunning colorized ASCII art that renders directly in your terminal. Each pixel's brightness is mapped to an ASCII character, and the original colors are preserved using ANSI 24-bit RGB colors—creating a beautiful, textual representation of your image without any GUI.

## Screenshots

### Original Image
![Original Image](image.jpeg)

### Terminal Output
The image is converted into ASCII characters with each character colored to match the original image's hue and brightness:

```
oaoao*#*ooooaoooao**M*#M#M#MMMM#M#MM#M#MM#MMM##MM#MM#MWM#W*m[(i++++~i+++++++++!lI!ilI;::;l!lI:;i~i~i)(QbMWbkhkBhkhhBhBhah**o*#WWbWBaoa
aoaoao##*oooaooooo**#*M#M#M##MM#MM#MM#MMMMM#M#MMM#MMMWM#WW#mo)_i++++i++++!+++lII:;;Il!l::;l:;;;;I;I~!!~~)(Qpbobkhkahao*#MWMbWah
aoaao*##*oaoooaooo**##M#M#MMMMM#M#MMMMMMM#MMMMM#MMMWWWM#Wm{)_++i+++++++++lI!;:;I!;::;;;;;:;I;~:;!~~))(OmpbdbkhaBao*MMWWa
```
(displayed with full RGB colors in your terminal)

## Features

- **Multi-format Support** - Load PNG, JPEG, BMP, GIF and other image formats
- **Smart Resizing** - Automatically maintains aspect ratio while compressing to your desired width
- **Brightness-to-Character Mapping** - Maps pixel brightness to ASCII characters (` ` to `@`)
- **Full Color Preservation** - Uses 24-bit ANSI colors to recreate the original image's hues
- **Terminal Native** - No GUI required, runs entirely in your terminal
- **Customizable Output** - Adjust width to fit any terminal size

## Installation

1. Install Node.js (v14 or later)
2. Clone this repository
3. Install dependencies:
```bash
npm install
```

## Usage

### Basic usage:
```bash
node index2.js image.jpg
```

### Custom width:
```bash
node index2.js image.jpg --width 100
node index2.js image.jpg -w 80
```

### Examples:
```bash
node index2.js photo.png -w 80      # For narrow terminals
node index2.js photo.png -w 150     # For wide terminals
```

## How It Works

1. **Load Image** - Reads image file using Jimp
2. **Resize** - Compresses to specified width, adjusts height for terminal character ratio (taller than wide)
3. **Convert Pixels** - For each pixel:
   - Extract RGB color values
   - Calculate brightness to determine which ASCII character to use
   - Map brightness across gradient: ` .'` ,:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$`
4. **Apply Colors** - Use original RGB values with ANSI 24-bit color codes
5. **Display** - Print colored ASCII art to terminal

## Files

- `index2.js` - Main program (recommended)
- `index1.js` - Alternative implementation
- `index3.js` - Alternative implementation
- `image.jpeg` - Sample image
- `terminal_output_sample.txt` - Example terminal output (run with 120 width)

## Requirements

- Terminal with 24-bit ANSI color support (iTerm2, Kitty, Windows Terminal, most modern terminals)
- Node.js v14 or later

## Troubleshooting

**Colors not showing?**
- Your terminal may not support 24-bit color. Try using iTerm2, Kitty, Alacritty, or Windows Terminal.

**Image not found?**
- Verify the file path is correct: `node index2.js ./path/to/image.jpg`

**Module error?**
- Run `npm install` to install Jimp dependency

**Output looks stretched?**
- Adjust the width parameter: `node index2.js image.jpg -w 100`

## Customization

**Change character gradient** in `index2.js`:
```javascript
const GRADIENT =
    " .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
```

**Change default width** in `parseArgs()`:
```javascript
const options = { image: null, width: 120 };  // Change 120 to your preferred default
```

## Dependencies

- **Jimp** - Pure JavaScript image manipulation library (no native dependencies required)
