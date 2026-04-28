/**
 * CloudPrep Quiz — store screenshot generator.
 *
 *   node marketing/generator/render.cjs
 *
 * Takes raw app captures from marketing/screenshots-source/ and renders
 * Play-Store-ready marketing slides at the required resolutions into
 * marketing/output/.
 *
 * No Next.js, no scaffolding — just Playwright + HTML strings. The skill's
 * marketing framework (one idea per slide, varied layouts, decorative blobs,
 * caption + headline structure) is followed; we just bypass the Next.js
 * machinery the original skill uses.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../output');
const SRC_DIR = path.resolve(__dirname, '../screenshots-source');

// Play Store required: phone screenshots can be 1080–7680 wide, 16:9 to 9:16.
// We render at 1080×1920 (canonical Android phone portrait).
const PHONE = { w: 1080, h: 1920 };
const FEATURE = { w: 1024, h: 500 };

const ACCENT = '#6C63FF';
const BG = '#0F0F14';
const SURFACE = '#15151D';
const TEXT_MUTED = '#9aa0b4';

// Each slide pairs a label, a headline, an accent color, a source PNG, and a
// "presentation" function that returns the HTML for the marketing layout.
const SLIDES = [
  {
    id: '01-hero',
    label: 'CLOUD CERT PREP',
    headline: 'Pass your<br/>cloud cert.',
    src: 'browse.png',
    devicePos: 'bottomCentered',
    accent: ACCENT,
    bgGradient: ['#1a1a2e', '#0F0F14'],
  },
  {
    id: '02-free',
    label: 'FREE FOREVER',
    headline: 'First quiz free.<br/>Every cert.',
    src: 'certification.png',
    devicePos: 'bottomCentered',
    accent: '#FF9F0A',
    bgGradient: ['#241813', '#0F0F14'],
  },
  {
    id: '03-real-questions',
    label: 'EXAM-STYLE',
    headline: 'Real questions,<br/>real explanations.',
    src: 'quiz-answering.png',
    devicePos: 'bottomCentered',
    accent: ACCENT,
    bgGradient: ['#1a1a2e', '#0F0F14'],
  },
  {
    id: '04-progress',
    label: 'TRACK PROGRESS',
    headline: 'Score trends.<br/>Daily streaks.',
    src: 'stats.png',
    devicePos: 'bottomCentered',
    accent: '#34D399',
    bgGradient: ['#0e2418', '#0F0F14'],
  },
  {
    id: '05-pro',
    label: 'CLOUDPREP PRO',
    headline: 'Unlock everything.<br/>One-time purchase.',
    src: 'paywall.png',
    devicePos: 'bottomCentered',
    accent: ACCENT,
    bgGradient: ['#1f1840', '#0F0F14'],
  },
];

function dataUri(file) {
  const p = path.join(SRC_DIR, file);
  const buf = fs.readFileSync(p);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function dataUriIcon() {
  const buf = fs.readFileSync(path.resolve(__dirname, '../../assets/icon-512.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

/**
 * Android phone frame implemented in CSS. Aspect ratio 9:19.5 with a small
 * punch-hole camera at top and a thin black bezel.
 */
function floatingScreen({ src }) {
  // Modern frameless: app screen as a large floating card with rounded
  // corners and drop shadow. Content reads at thumbnail size. The screen
  // takes ~93% of canvas width and extends from below the headline to past
  // the bottom edge (cropped) so it feels immersive.
  return `
  <div style="
    position: absolute; left: 50%; bottom: -60px;
    width: 93%; height: 1380px;
    transform: translateX(-50%);
    border-radius: 36px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 4px 0 rgba(255,255,255,0.04) inset;
    border: 1px solid rgba(255,255,255,0.06);
    background: #0F0F14;
    z-index: 3;
  ">
    <img src="${src}" style="
      display: block; width: 100%; height: 100%;
      object-fit: contain; object-position: top;
    " />
  </div>`;
}

function captionBlock({ label, headline, accent }) {
  return `
  <div style="
    position: absolute; top: 60px; left: 60px; right: 60px;
    text-align: center; z-index: 4;
  ">
    <div style="
      color: ${accent}; font-size: 28px;
      font-weight: 700; letter-spacing: 4px; margin-bottom: 16px;
      text-transform: uppercase;
    ">${label}</div>
    <div style="
      color: white; font-size: 84px; font-weight: 800; line-height: 1.05;
      letter-spacing: -1.5px;
    ">${headline}</div>
  </div>`;
}

function decorativeBlob({ color, size, top, left }) {
  return `
  <div style="
    position: absolute; top: ${top}; left: ${left};
    width: ${size}; height: ${size};
    background: ${color};
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.45;
    z-index: 1;
  "></div>`;
}

function slideHtml(slide) {
  const bg = `linear-gradient(180deg, ${slide.bgGradient[0]} 0%, ${slide.bgGradient[1]} 100%)`;
  const phoneSrc = dataUri(slide.src);
  return `
  <!doctype html><html><body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif; background: black;">
    <div style="
      position: relative; width: ${PHONE.w}px; height: ${PHONE.h}px;
      background: ${bg};
      overflow: hidden;
    ">
      ${decorativeBlob({ color: slide.accent, size: '700px', top: '-200px', left: '-200px' })}
      ${decorativeBlob({ color: slide.accent, size: '600px', top: '60%', left: '70%' })}
      ${captionBlock({ label: slide.label, headline: slide.headline, accent: slide.accent })}
      ${floatingScreen({ src: phoneSrc })}
    </div>
  </body></html>`;
}

function featureGraphicHtml() {
  const icon = dataUriIcon();
  return `
  <!doctype html><html><body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif;">
    <div style="
      position: relative; width: ${FEATURE.w}px; height: ${FEATURE.h}px;
      background: linear-gradient(135deg, #1f1840 0%, #0F0F14 60%, #1a1a2e 100%);
      overflow: hidden;
      display: flex; align-items: center; padding: 0 60px; gap: 36px;
    ">
      <div style="
        position: absolute; top: -120px; left: -120px;
        width: 480px; height: 480px;
        background: ${ACCENT}; border-radius: 50%;
        filter: blur(140px); opacity: 0.55;
      "></div>
      <div style="
        position: absolute; bottom: -180px; right: -120px;
        width: 520px; height: 520px;
        background: #34D399; border-radius: 50%;
        filter: blur(160px); opacity: 0.25;
      "></div>

      <img src="${icon}" style="
        width: 200px; height: 200px; border-radius: 44px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.55);
        position: relative; z-index: 2;
      "/>

      <div style="position: relative; z-index: 2;">
        <div style="color: white; font-size: 64px; font-weight: 800; line-height: 1; letter-spacing: -1px;">
          CloudPrep Quiz
        </div>
        <div style="color: rgba(255,255,255,0.78); font-size: 26px; margin-top: 14px; font-weight: 500;">
          Practice quizzes for AWS, Azure, GCP & DevOps.
        </div>
        <div style="margin-top: 22px; display: flex; gap: 10px;">
          ${['AWS', 'Azure', 'GCP', 'DevOps']
            .map(
              (t) => `<span style="
                background: rgba(255,255,255,0.08);
                color: white; font-size: 18px; font-weight: 600;
                padding: 8px 16px; border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.12);
              ">${t}</span>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </body></html>`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // Phone slides
  for (const slide of SLIDES) {
    const ctx = await browser.newContext({
      viewport: { width: PHONE.w, height: PHONE.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(slideHtml(slide), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const out = path.join(OUT_DIR, `${slide.id}-${PHONE.w}x${PHONE.h}.png`);
    await page.screenshot({ path: out, omitBackground: false });
    console.log('rendered', path.relative(process.cwd(), out));
    await ctx.close();
  }

  // Feature Graphic
  {
    const ctx = await browser.newContext({
      viewport: { width: FEATURE.w, height: FEATURE.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(featureGraphicHtml(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const out = path.join(OUT_DIR, `feature-graphic-${FEATURE.w}x${FEATURE.h}.png`);
    await page.screenshot({ path: out, omitBackground: false });
    console.log('rendered', path.relative(process.cwd(), out));
    await ctx.close();
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
