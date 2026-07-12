#!/usr/bin/env node

const { Jimp } = require("jimp");

const RESET = "\x1b[0m";

function parseArgs(args) {
    const options = {
        image: null,
        width: 100,
        contrast: 1.0,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--width" || arg === "-w") {
            options.width = parseInt(args[++i], 10);
        } else if (arg === "--contrast" || arg === "-c") {
            options.contrast = parseFloat(args[++i]);
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
    if (a < 32) return 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Get pixel at coordinates safely
function pixel(image, x, y) {
    const color = intToRGBA(image.getPixelColor(x, y));
    if (color.a < 32) return [255, 255, 255]; // transparent = white
    return [color.r, color.g, color.b];
}

// Enhanced block character with color gradient
function ansiGradientBlock(top, mid, bottom, contrast) {
    const [tr, tg, tb] = top;
    const [mr, mg, mb] = mid;
    const [br, bg, bb] = bottom;

    // Apply contrast enhancement
    const enhance = (val) => Math.round(128 + (val - 128) * contrast);

    return `\x1b[48;2;${enhance(tr)};${enhance(tg)};${enhance(tb)}m\x1b[38;2;${enhance(mr)};${enhance(mg)};${enhance(mb)}m▄`;
}

// Smart block selection based on pixel density
function selectBlock(pixels, contrast) {
    const avg = pixels.map(p => brightness({ r: p[0], g: p[1], b: p[2], a: 255 }))
        .reduce((a, b) => a + b, 0) / pixels.length;

    // High contrast areas use solid blocks
    if (avg < 64) return "█";
    if (avg > 192) return " ";
    return "▄";
}

async function render(path, requestedWidth, contrast) {
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

    if (outputHeight % 3 !== 0) {
        outputHeight += 3 - (outputHeight % 3);
    }

    image.resize({
        w: outputWidth,
        h: outputHeight,
    });

    let frame = "";

    // Render in 3-pixel vertical chunks for better detail
    for (let y = 0; y < outputHeight; y += 3) {
        for (let x = 0; x < outputWidth; x++) {
            const topPixel = pixel(image, x, y);
            const midPixel = pixel(image, x, y + 1);
            const botPixel = y + 2 < outputHeight
                ? pixel(image, x, y + 2)
                : [0, 0, 0];

            frame += ansiGradientBlock(topPixel, midPixel, botPixel, contrast);
        }

        frame += RESET + "\n";
    }

    process.stdout.write(frame);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.image) {
        console.error("Usage:");
        console.error("node index4.js image.png --width 100 --contrast 1.2");
        console.error("");
        console.error("Options:");
        console.error("  --width, -w       Terminal width (default: auto)");
        console.error("  --contrast, -c    Contrast boost 0.5-2.0 (default: 1.0)");
        process.exit(1);
    }

    try {
        await render(options.image, options.width, options.contrast);
    } catch (err) {
        console.error(err.message);
    }
}

main();
