# Image in Terminal.js

Convert any image into colorized ASCII art and display it in your terminal.

## Screenshots

### Original Image
![Original Image](image.jpeg)

### Terminal Output
The program converts the image into ASCII characters colored to match the original image. Each pixel's brightness determines which character to use, and its color is preserved using ANSI 24-bit colors.

Example output (80 width):
```
mwqpdbkhao*#MW&8%B@$mwqpdbkhao*#MW&8%B@$mwqpdbkhao*#MW&8%B@$
po*#MW&8%B@$mwqpdbkhao*#MW&8%B@$mwqpdbkhao*#MW&8%B@$mwqpdbk
o*#MW&8%B@$mwqpdbkhao*#MW&8%B@$mwqpdbkhao*#MW&8%B@$mwqpdBk
...
```
(displayed with full RGB colors in your terminal)

## Features

- Loads PNG, JPEG, BMP, GIF and other image formats
- Resizes images intelligently while maintaining aspect ratio
- Maps pixel brightness to ASCII characters (space to `@`)
- Applies original colors using 24-bit ANSI colors
- Customizable output width

## Installation

1. Install Node.js (v14 or later)
2. Clone this repository and navigate to it
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
node index2.js photo.png -w 80      # Narrow output
node index2.js photo.png -w 150     # Wide output
```

## How It Works

1. **Load Image** - Reads image using Jimp
2. **Resize** - Compresses to specified width, adjusts height for terminal character ratio (2:1)
3. **Convert** - For each pixel:
   - Extract RGB values
   - Convert to HSV to get brightness (V value)
   - Map brightness to ASCII character
   - Apply original RGB color
4. **Display** - Print ASCII art with ANSI 24-bit colors to terminal

## Files

- `index2.js` - Main program (recommended)
- `index1.js` - Alternative implementation
- `index3.js` - Alternative implementation
- `image.jpeg` - Sample image

## Requirements

- Terminal must support 24-bit ANSI color (most modern terminals do)
- Node.js v14+

## Troubleshooting

**Colors not showing?**
- Your terminal may not support 24-bit color. Use modern terminals like iTerm2, Kitty, or Windows Terminal.

**Image not found?**
- Check the file path is correct: `node index2.js ./path/to/image.jpg`

**Module not found?**
- Run `npm install` to install dependencies

**Output looks stretched?**
- Adjust the width: `node index2.js image.jpg -w 100`

## Customization

Change the character gradient in `index2.js`:
```javascript
const GRADIENT =
    " .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
```

Change default width in `parseArgs()`:
```javascript
const options = { image: null, width: 120 };  // Change 120 to your preferred width
```

## Dependencies

- **Jimp** - JavaScript Image Manipulation Program (pure JavaScript, no native dependencies)
