#!/usr/bin/env node

const { Jimp } = require("jimp");

function parseArgs(args) {
    const options = {
        image: null,
        width: 100,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--width" || arg === "-w") {
            options.width = parseInt(args[++i], 10);
        } else {
            options.image = arg;
        }
    }

    return options;
}

function intToRGBA(color) {
    return {
        r: (color >>> 24) & 255,
        g: (color >>> 16) & 255,
        b: (color >>> 8) & 255,
        a: color & 255,
    };
}

function brightness({ r, g, b, a }) {
    if (a < 128) return 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Ordered dithering matrix (Bayer 4x4)
const DITHER_MATRIX = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];

// Character set from darkest to lightest for ASCII art
const CHARS = [" ", "░", "▒", "▓", "█"];

function getCharForBrightness(value, x, y) {
    // Apply ordered dithering
    const ditherValue = DITHER_MATRIX[y % 4][x % 4] / 16;
    const adjustedValue = value / 255 + (ditherValue - 0.5) * 0.2;

    // Map to character set (0 = dark █, 4 = light space)
    const index = Math.floor(adjustedValue * CHARS.length);
    return CHARS[Math.max(0, Math.min(CHARS.length - 1, index))];
}

async function render(path, width) {
    const image = await Jimp.read(path);

    const aspect = image.bitmap.height / image.bitmap.width;
    const pixelWidth = width;
    const pixelHeight = Math.max(4, Math.floor(pixelWidth * aspect * 0.5)); // 0.5 for terminal aspect

    image.resize({
        w: pixelWidth,
        h: pixelHeight,
    });

    let output = "";

    for (let y = 0; y < image.bitmap.height; y++) {
        for (let x = 0; x < image.bitmap.width; x++) {
            const rgba = intToRGBA(image.getPixelColor(x, y));
            const bright = brightness(rgba);
            const char = getCharForBrightness(bright, x, y);
            output += char;
        }
        output += "\n";
    }

    console.log(output);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.image) {
        console.log("Usage: node index4.js image.jpg --width 100");
        process.exit(1);
    }

    try {
        await render(options.image, options.width);
    } catch (err) {
        console.error(err.message);
    }
}

main();
