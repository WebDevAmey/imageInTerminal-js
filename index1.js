#!/usr/bin/env node

const { Jimp } = require("jimp");

const RESET = "\x1b[0m";

function parseArgs(args) {
    const options = {
        image: null,
        width: null,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--width" || arg === "-w") {
            options.width = Number(args[++i]);
        } else {
            options.image = arg;
        }
    }

    return options;
}

function rgbaFromInt(color) {
    return {
        r: (color >>> 24) & 255,
        g: (color >>> 16) & 255,
        b: (color >>> 8) & 255,
        a: color & 255,
    };
}

function pixel(image, x, y) {
    const color = rgbaFromInt(image.getPixelColor(x, y));

    if (color.a < 32) {
        return [0, 0, 0];
    }

    return [color.r, color.g, color.b];
}

function ansiHalfBlock(top, bottom) {
    const [tr, tg, tb] = top;
    const [br, bg, bb] = bottom;

    return `\x1b[48;2;${tr};${tg};${tb}m\x1b[38;2;${br};${bg};${bb}m▄`;
}

async function renderImage(path, requestedWidth) {
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

    if (outputHeight % 2 !== 0) {
        outputHeight++;
    }

    image.resize({
        w: outputWidth,
        h: outputHeight,
    });

    let frame = "";

    for (let y = 0; y < outputHeight; y += 2) {

        for (let x = 0; x < outputWidth; x++) {

            const upper = pixel(image, x, y);

            const lower =
                y + 1 < outputHeight
                    ? pixel(image, x, y + 1)
                    : [0, 0, 0];

            frame += ansiHalfBlock(upper, lower);
        }

        frame += RESET + "\n";
    }

    process.stdout.write(frame);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.image) {
        console.error("Usage:");
        console.error("node index.js image.png --width 80");
        process.exit(1);
    }

    try {
        await renderImage(options.image, options.width);
    } catch (err) {
        console.error(err.message);
    }
}

main();