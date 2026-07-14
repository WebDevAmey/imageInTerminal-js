#!/usr/bin/env node

const { Jimp } = require("jimp");

const RESET = "\x1b[0m";

function parseArgs(args) {
    const options = {
        image: null,
        width: 100,
        vibrant: 1.2,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--width" || arg === "-w") {
            options.width = parseInt(args[++i], 10);
        } else if (arg === "--vibrant" || arg === "-v") {
            options.vibrant = parseFloat(args[++i]);
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

// Boost color vibrancy
function vibrantize(r, g, b, amount) {
    const gray = brightness({ r, g, b });
    return [
        Math.min(255, Math.round(gray + (r - gray) * amount)),
        Math.min(255, Math.round(gray + (g - gray) * amount)),
        Math.min(255, Math.round(gray + (b - gray) * amount)),
    ];
}

function pixel(image, x, y) {
    if (x < 0 || y < 0 || x >= image.bitmap.width || y >= image.bitmap.height) {
        return [100, 100, 100];
    }
    const color = intToRGBA(image.getPixelColor(x, y));
    if (color.a < 32) return [150, 150, 150];
    return [color.r, color.g, color.b];
}

// Sample 2x2 block into top/bottom halves for dual-color effect
function sampleDualBlock(image, startX, startY, vibrantAmount) {
    // Top half
    const topPixels = [
        pixel(image, startX, startY),
        pixel(image, startX + 1, startY),
    ];
    const topR = Math.round(topPixels.reduce((s, p) => s + p[0], 0) / 2);
    const topG = Math.round(topPixels.reduce((s, p) => s + p[1], 0) / 2);
    const topB = Math.round(topPixels.reduce((s, p) => s + p[2], 0) / 2);
    const [vTopR, vTopG, vTopB] = vibrantize(topR, topG, topB, vibrantAmount);

    // Bottom half
    const botPixels = [
        pixel(image, startX, startY + 1),
        pixel(image, startX + 1, startY + 1),
    ];
    const botR = Math.round(botPixels.reduce((s, p) => s + p[0], 0) / 2);
    const botG = Math.round(botPixels.reduce((s, p) => s + p[1], 0) / 2);
    const botB = Math.round(botPixels.reduce((s, p) => s + p[2], 0) / 2);
    const [vBotR, vBotG, vBotB] = vibrantize(botR, botG, botB, vibrantAmount);

    return {
        topR: vTopR, topG: vTopG, topB: vTopB,
        botR: vBotR, botG: vBotG, botB: vBotB,
    };
}

async function render(path, requestedWidth, vibrantAmount) {
    const image = await Jimp.read(path);

    const terminalWidth = process.stdout.columns || 80;
    const outputWidth = Math.min(
        requestedWidth || terminalWidth,
        terminalWidth,
        image.bitmap.width / 2
    );

    let outputHeight = Math.round(
        outputWidth * image.bitmap.height / (image.bitmap.width * 0.5)
    );

    image.resize({
        w: outputWidth * 2,
        h: outputHeight * 2,
    });

    let frame = "";

    for (let y = 0; y < image.bitmap.height; y += 2) {
        for (let x = 0; x < image.bitmap.width; x += 2) {
            const block = sampleDualBlock(image, x, y, vibrantAmount);

            // Use half-block character with dual colors for rich color depth
            // Background = top color, Foreground = bottom color
            frame += `\x1b[48;2;${block.topR};${block.topG};${block.topB}m\x1b[38;2;${block.botR};${block.botG};${block.botB}m▄`;
        }

        frame += RESET + "\n";
    }

    process.stdout.write(frame);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.image) {
        console.error("Usage:");
        console.error("node index6.js image.png --width 100 --vibrant 1.2");
        console.error("");
        console.error("Options:");
        console.error("  --width, -w      Terminal width (default: auto)");
        console.error("  --vibrant, -v    Color vibrancy boost 0.5-2.0 (default: 1.2)");
        process.exit(1);
    }

    try {
        await render(options.image, options.width, options.vibrant);
    } catch (err) {
        console.error(err.message);
    }
}

main();
