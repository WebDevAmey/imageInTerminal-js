#!/usr/bin/env node

const { Jimp } = require("jimp");

const RESET = "\x1b[0m";

// Stipple/dither pattern - uses █ and space to approximate tone
const DITHER_PATTERNS = [
    "  ",  // 0 - all empty
    " █",  // 1 - 25%
    "█ ",  // 2 - 25%
    "██",  // 3 - 50%
];

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

function brightness({ r, g, b }) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// RGB to nearest ANSI 256 color (basic palette)
function rgbTo256Color([r, g, b]) {
    // Simple 6x6x6 color cube mapping
    const ri = Math.round(r / 255 * 5);
    const gi = Math.round(g / 255 * 5);
    const bi = Math.round(b / 255 * 5);
    return 16 + ri * 36 + gi * 6 + bi;
}

// Choose dither pattern based on brightness
function ditherChar(br, x, y) {
    // Quantize to 0-3 range based on brightness
    const level = Math.min(3, Math.floor((br / 255) * 4));

    // Alternate pattern based on position for better dither effect
    const offset = (x + y) % 2;
    const pattern = DITHER_PATTERNS[level];

    return offset === 0 ? pattern[0] : pattern[1];
}

function pixel(image, x, y) {
    const color = intToRGBA(image.getPixelColor(x, y));
    if (color.a < 32) return [200, 200, 200];
    return [color.r, color.g, color.b];
}

async function render(path, requestedWidth) {
    const image = await Jimp.read(path);

    const terminalWidth = process.stdout.columns || 80;
    const outputWidth = Math.min(
        requestedWidth || terminalWidth,
        terminalWidth,
        image.bitmap.width
    );

    let outputHeight = Math.round(
        outputWidth * image.bitmap.height / image.bitmap.width
    );

    image.resize({
        w: outputWidth,
        h: outputHeight,
    });

    let frame = "";

    for (let y = 0; y < image.bitmap.height; y++) {
        for (let x = 0; x < image.bitmap.width; x++) {
            const [r, g, b] = pixel(image, x, y);
            const br = brightness({ r, g, b });
            const colorCode = rgbTo256Color([r, g, b]);
            const char = ditherChar(br, x, y);

            frame += `\x1b[38;5;${colorCode}m${char}`;
        }

        frame += RESET + "\n";
    }

    process.stdout.write(frame);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.image) {
        console.error("Usage:");
        console.error("node index5.js image.png --width 80");
        console.error("");
        console.error("Options:");
        console.error("  --width, -w   Terminal width (default: auto)");
        process.exit(1);
    }

    try {
        await render(options.image, options.width);
    } catch (err) {
        console.error(err.message);
    }
}

main();
