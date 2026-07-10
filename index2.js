#!/usr/bin/env node

const { Jimp } = require("jimp");

const RESET = "\x1b[0m";

// Dark → Bright
const GRADIENT =
    " .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

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

// Jimp stores colours as one 32-bit integer
function intToRGBA(color) {
    return {
        r: (color >>> 24) & 255,
        g: (color >>> 16) & 255,
        b: (color >>> 8) & 255,
        a: color & 255,
    };
}

// RGB -> HSV
function rgbToHSV({ r, g, b }) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const delta = max - min;

    let h = 0;

    if (delta !== 0) {

        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }

        h *= 60;

        if (h < 0) {
            h += 360;
        }
    }

    const s = max === 0 ? 0 : delta / max;

    return {
        h,
        s,
        v: max,
    };
}

function brightnessToChar(v) {

    const index = Math.floor(
        v * (GRADIENT.length - 1)
    );

    return GRADIENT[index];
}

function colorize({ r, g, b }, ch) {

    return `\x1b[38;2;${r};${g};${b}m${ch}`;
}

async function render(path, targetWidth) {

    const image = await Jimp.read(path);

    const aspect =
        image.bitmap.height / image.bitmap.width;

    // Terminal characters are roughly 2× taller
    const targetHeight = Math.max(
        1,
        Math.floor(targetWidth * aspect * 0.5)
    );

    image.resize({
        w: targetWidth,
        h: targetHeight,
    });

    let output = "";

   

    for (let y = 0; y < image.bitmap.height; y++) {

        for (let x = 0; x < image.bitmap.width; x++) {

            const rgba = intToRGBA(
                image.getPixelColor(x, y)
            );

            const hsv = rgbToHSV(rgba);

            const ch = brightnessToChar(hsv.v);

            output += colorize(rgba, ch);
        }

        output += RESET + "\n";
    }

    process.stdout.write(output + RESET);
}

async function main() {

    const options = parseArgs(
        process.argv.slice(2)
    );

    if (!options.image) {

        console.log(
            "Usage: node index.js image.jpg --width 100"
        );

        process.exit(1);
    }

    try {

        await render(
            options.image,
            options.width
        );

    } catch (err) {

        console.error(err.message);

    }
}

main();