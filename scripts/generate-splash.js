#!/usr/bin/env node
/**
 * Generates splash PNGs that mirror the in-app BootScreen
 * (components/atoms/loading/index.tsx) pixel-for-pixel:
 *
 *   - Linear gradient background (start 0.1×W,0 → end 0.9×W,H)
 *   - SVG-style grid lines (80dp spacing)
 *   - Dot grid (40dp spacing, 1.5dp radius)
 *   - Four solid orb circles, positioned as fractions of W/H, radius in dp
 *   - Centred coloured COZA logo (160dp)
 *   - Bottom accent bar (32×2dp, 48dp from bottom)
 *
 * Output is responsive: one PNG per device profile (phone / tablet) per theme
 * (light / dark). The expo-splash-screen plugin selects the right asset per
 * device class at runtime.
 *
 * Mirrors are *exact*: fixed-dp elements use the profile's device pixel ratio
 * (3 on phones, 2 on tablets) so the output looks identical to what BootScreen
 * paints on a real device of that class.
 *
 * Run: npm run generate:splash
 */
const CanvasKitInit = require('canvaskit-wasm');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const LOGO_PATH = path.join(ASSETS_DIR, 'coza-coloured-logo.png');

// Device profiles: native pixel resolution + assumed pixel density.
// Sized at the largest common device per class so cover-resize downscales (clean)
// rather than upscales (blurry) on smaller devices.
const PROFILES = [
    { name: 'splash-phone', W: 1290, H: 2796, dpr: 3 }, // iPhone 14 Pro Max @3x
    { name: 'splash-tablet', W: 2048, H: 2732, dpr: 2 }, // iPad Pro 12.9" portrait @2x
];

// Theme variants — colours match BootScreen's gradient and GeometricPattern.
const THEMES = [
    {
        suffix: '',
        gradient: ['#3A006F', '#6200BE', '#4A007A'],
        dotAlpha: 0.12,
        lineAlpha: 0.08,
    },
    {
        suffix: '-dark',
        gradient: ['#0D001A', '#2D0060', '#1A003A'],
        dotAlpha: 0.07,
        lineAlpha: 0.04,
    },
];

// Orb definitions: positions as fraction of canvas, radius in dp, base colour.
// BootScreen animates alpha 0.18 ↔ 0.35; static splash uses the midpoint.
const ORBS = [
    { fx: 0.15, fy: 0.12, r: 130, color: '#9B30FF' },
    { fx: 0.85, fy: 0.25, r: 100, color: '#6200BE' },
    { fx: 0.1, fy: 0.78, r: 110, color: '#7B00E0' },
    { fx: 0.88, fy: 0.82, r: 140, color: '#4A0090' },
];
const ORB_ALPHA = 0.265;

function hexToRgba(hex, a = 1) {
    return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
        a,
    ];
}

function renderSplash(ck, profile, theme, logoData) {
    const { W, H, dpr } = profile;
    const dp = (v) => v * dpr;

    const surface = ck.MakeSurface(W, H);
    if (!surface) throw new Error(`Surface creation failed for ${W}×${H}`);
    const canvas = surface.getCanvas();

    // 1. Gradient background — matches LinearGradient props in BootScreen.
    const gradShader = ck.Shader.MakeLinearGradient(
        [W * 0.1, 0],
        [W * 0.9, H],
        theme.gradient.map((c) => ck.Color4f(...hexToRgba(c))),
        [0, 0.5, 1],
        ck.TileMode.Clamp
    );
    const bgPaint = new ck.Paint();
    bgPaint.setShader(gradShader);
    canvas.drawRect(ck.LTRBRect(0, 0, W, H), bgPaint);
    bgPaint.delete();
    gradShader.delete();

    // 2. Grid lines — 80dp pitch, 0.5dp stroke. Match SVG Pattern in GeometricPattern.
    const linePaint = new ck.Paint();
    linePaint.setColor(ck.Color4f(1, 1, 1, theme.lineAlpha));
    linePaint.setStrokeWidth(Math.max(1, dp(0.5)));
    linePaint.setStyle(ck.PaintStyle.Stroke);
    linePaint.setAntiAlias(true);
    const gridStep = dp(80);
    for (let y = 0; y < H; y += gridStep) canvas.drawLine(0, y, W, y, linePaint);
    for (let x = 0; x < W; x += gridStep) canvas.drawLine(x, 0, x, H, linePaint);
    linePaint.delete();

    // 3. Dots — 40dp pitch, 1.5dp radius, centred at (20,20) within each cell.
    const dotPaint = new ck.Paint();
    dotPaint.setColor(ck.Color4f(1, 1, 1, theme.dotAlpha));
    dotPaint.setAntiAlias(true);
    const dotStep = dp(40);
    const dotR = dp(1.5);
    const dotOffset = dp(20);
    for (let x = dotOffset; x < W; x += dotStep) {
        for (let y = dotOffset; y < H; y += dotStep) {
            canvas.drawCircle(x, y, dotR, dotPaint);
        }
    }
    dotPaint.delete();

    // 4. Orb blobs — solid circles at uniform alpha (BootScreen uses no blur).
    for (const orb of ORBS) {
        const cx = orb.fx * W;
        const cy = orb.fy * H;
        const r = dp(orb.r);
        const paint = new ck.Paint();
        paint.setColor(ck.Color4f(...hexToRgba(orb.color, ORB_ALPHA)));
        paint.setAntiAlias(true);
        canvas.drawCircle(cx, cy, r, paint);
        paint.delete();
    }

    // 5. Logo — 160dp square, centred. resizeMode: 'contain' is preserved by
    //    drawImageRect honouring the source aspect ratio (square logo here).
    const img = ck.MakeImageFromEncoded(logoData);
    if (!img) throw new Error('Failed to decode logo PNG');
    const logoSize = dp(80);
    const cx = W / 2;
    const cy = H / 2;
    const logoPaint = new ck.Paint();
    logoPaint.setAntiAlias(true);
    canvas.drawImageRect(
        img,
        ck.LTRBRect(0, 0, img.width(), img.height()),
        ck.LTRBRect(cx - logoSize / 2, cy - logoSize / 2, cx + logoSize / 2, cy + logoSize / 2),
        logoPaint,
        false
    );
    logoPaint.delete();
    img.delete();

    // 6. Bottom accent bar — 32×2dp, white@0.3, 48dp from bottom.
    const barPaint = new ck.Paint();
    barPaint.setColor(ck.Color4f(1, 1, 1, 0.3));
    barPaint.setAntiAlias(true);
    const barW = dp(32);
    const barH = Math.max(1, dp(2));
    const barY = H - dp(48);
    canvas.drawRect(
        ck.LTRBRect(W / 2 - barW / 2, barY, W / 2 + barW / 2, barY + barH),
        barPaint
    );
    barPaint.delete();

    // Export
    const snap = surface.makeImageSnapshot();
    const png = snap.encodeToBytes();
    const outFile = `${profile.name}${theme.suffix}.png`;
    fs.writeFileSync(path.join(ASSETS_DIR, outFile), Buffer.from(png));
    snap.delete();
    surface.delete();

    const kb = (png.length / 1024).toFixed(1);
    console.log(`✓ ${outFile.padEnd(28)} ${W}×${H}  ${kb} KB`);
}

async function main() {
    if (!fs.existsSync(LOGO_PATH)) {
        throw new Error(`Logo not found at ${LOGO_PATH}`);
    }
    const ck = await CanvasKitInit({
        locateFile: (f) => path.join(__dirname, '../node_modules/canvaskit-wasm/bin', f),
    });
    const logoData = fs.readFileSync(LOGO_PATH);

    for (const profile of PROFILES) {
        for (const theme of THEMES) {
            renderSplash(ck, profile, theme, logoData);
        }
    }
    console.log('\nDone. Update app.json if asset names changed.');
}

main().catch((e) => {
    console.error('FAILED:', e.message);
    process.exit(1);
});
