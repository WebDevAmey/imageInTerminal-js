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

function brightness({ r, g, b }) {
    return (
        0.299 * r +
        0.587 * g +
        0.114 * b
    );
}

function pixelOn(value) {
    return value < 128;
}

const BRAILLE = [
    [0x01, 0x08],
    [0x02, 0x10],
    [0x04, 0x20],
    [0x40, 0x80],
];

async function render(path, width) {
    const image = await Jimp.read(path);

    const aspect =
        image.bitmap.height /
        image.bitmap.width;

    const pixelWidth = width * 2;

    const pixelHeight = Math.max(
        4,
        Math.floor(pixelWidth * aspect)
    );

    image.resize({
        w: pixelWidth,
        h: pixelHeight,
    });

    let output = "";

    for (let y = 0; y < image.bitmap.height; y += 4) {

        for (let x = 0; x < image.bitmap.width; x += 2) {

            let code = 0;

            for (let dy = 0; dy < 4; dy++) {
                for (let dx = 0; dx < 2; dx++) {

                    const px = x + dx;
                    const py = y + dy;

                    if (
                        px >= image.bitmap.width ||
                        py >= image.bitmap.height
                    ) {
                        continue;
                    }

                    const rgba = intToRGBA(
                        image.getPixelColor(px, py)
                    );

                    if (pixelOn(brightness(rgba))) {
                        code |= BRAILLE[dy][dx];
                    }
                }
            }

            output += String.fromCharCode(0x2800 + code);
        }

        output += "\n";
    }

    console.log(output);
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