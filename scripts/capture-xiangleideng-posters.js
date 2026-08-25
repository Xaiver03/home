const fs = require('fs/promises');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'https://xiangleideng.site';
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'webshots');
const RAW_DIR = path.join(OUTPUT_DIR, 'raw');
const POSTER_DIR = path.join(OUTPUT_DIR, 'poster');

const MOBILE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP_VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
const DEVICE_DESKTOP = 'desktop';
const DEVICE_MOBILE = 'mobile';
const requestedShotIds = process.env.SCREENSHOT_SHOTS
  ? new Set(process.env.SCREENSHOT_SHOTS.split(',').map((value) => value.trim()).filter(Boolean))
  : null;
const POSTER_PRESETS = {
  [DEVICE_DESKTOP]: {
    canvas: { width: 1920, height: 1080 },
    pagePadding: 38,
    posterPaddingX: 54,
    posterPaddingTop: 42,
    posterPaddingBottom: 34,
    topArea: 78,
    footerArea: 62,
    titleFont: 84,
    subtitleFont: 30,
    frameRadius: 22,
    frameRatio: 16 / 9,
    scale: 1,
  },
  [DEVICE_MOBILE]: {
    canvas: { width: 1080, height: 1920 },
    pagePadding: 36,
    posterPaddingX: 40,
    posterPaddingTop: 42,
    posterPaddingBottom: 28,
    topArea: 190,
    footerArea: 70,
    titleFont: 68,
    subtitleFont: 30,
    frameRadius: 28,
    frameRatio: 390 / 844,
    scale: 2,
  },
};
const CLASSIC_POSTER_PRESETS = {
  [DEVICE_DESKTOP]: {
    canvas: { width: 1920, height: 1080 },
    pagePadding: 56,
    topArea: 170,
    footerArea: 92,
    titleFont: 64,
    subtitleFont: 34,
    frameRadius: 30,
    frameRatio: 16 / 9,
    scale: 1,
  },
  [DEVICE_MOBILE]: {
    canvas: { width: 1080, height: 1920 },
    pagePadding: 42,
    topArea: 210,
    footerArea: 110,
    titleFont: 62,
    subtitleFont: 30,
    frameRadius: 26,
    frameRatio: 9 / 16,
    scale: 2,
  },
};

const SHOTS = [
  {
    id: '01-home-overview',
    title: '灯下灯首页',
    subtitle: '个人主页的核心入口与品牌信息一览',
    type: 'home',
    homepage: true,
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '02-articles-anchor',
    title: '文章精选区',
    subtitle: '一眼进入文章区域，快速预览最新内容',
    type: 'anchor',
    anchor: '#articles',
    homepage: true,
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '03-article-list',
    title: '全部文章列表',
    subtitle: '打开完整博客列表，支持快速翻阅所有文章',
    type: 'url',
    url: '/blog/log/article',
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '04-article-detail',
    title: '文章详情阅读',
    subtitle: '点击文章进入正文页，验证阅读与版式体验',
    type: 'url',
    url: '/blog/log/article/detail/41',
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '05-about-author',
    title: '作者介绍',
    subtitle: '从主页导航直接进入作者信息页',
    type: 'url',
    url: '/blog/about',
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '06-message-board',
    title: '留言板页面',
    subtitle: '进入站内留言板，检查用户反馈与互动功能',
    type: 'url',
    url: '/blog/message',
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '07-wechat-qr',
    title: '公众号二维码',
    subtitle: '扫码关注更新，快速获取内容触达入口',
    type: 'anchor',
    anchor: '#wechat-qr',
    homepage: true,
    devices: [DEVICE_DESKTOP],
  },
  {
    id: '08-mobile-home',
    title: '移动端首页示例',
    subtitle: 'iPhone 比例下的首页主视觉与导航入口',
    type: 'url',
    url: '/',
    homepage: true,
    devices: [DEVICE_MOBILE],
    posterDevice: DEVICE_MOBILE,
  },
  {
    id: '09-mobile-article-list',
    title: '移动端文章区',
    subtitle: 'iPhone 比例下的文章入口与底部导航',
    type: 'anchor',
    anchor: '#articles',
    homepage: true,
    devices: [DEVICE_MOBILE],
    posterDevice: DEVICE_MOBILE,
  },
];

function normalizeUrl(target) {
  return target.startsWith('http') ? target : new URL(target, BASE_URL).toString();
}

async function safeDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dismissOverlays(page) {
  const candidates = [
    'button:has-text("同意")',
    'button:has-text("接受")',
    'button:has-text("确定")',
    'button:has-text("允许")',
    '[aria-label="关闭"]',
    '.el-message-box__close',
    '.close',
    'button:has-text("OK")',
  ];

  for (const selector of candidates) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.isVisible({ timeout: 200 })) {
        await locator.click({ timeout: 400 });
        await safeDelay(200);
      }
    } catch (e) {
      // ignore
    }
  }
}

async function stabilizeDom(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await dismissOverlays(page);
  await safeDelay(600);
}

async function cleanDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => fs.unlink(path.join(directory, entry.name))),
  );
}

async function cleanSelectedShots(shotIds) {
  const targets = [];
  for (const shotId of shotIds) {
    targets.push(path.join(RAW_DIR, `${shotId}-desktop.png`));
    targets.push(path.join(RAW_DIR, `${shotId}-mobile.png`));
    targets.push(path.join(POSTER_DIR, `${shotId}.png`));
  }
  await Promise.all(targets.map((target) => fs.unlink(target).catch(() => {})));
}

async function captureRawScreenshot(page, state, viewportLabel) {
  const filename = `${state.id}-${viewportLabel}.png`;
  const target = path.join(RAW_DIR, filename);
  await page.screenshot({ path: target, fullPage: false });
  return target;
}

async function captureOneDevice(browser, state, viewport) {
  const deviceLabel = viewport.isMobile ? 'mobile' : 'desktop';
  const maxRetry = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetry; attempt++) {
    let context = null;

    try {
      context = await browser.newContext({
        viewport,
        userAgent: viewport.isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined,
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
      });
      const page = await context.newPage();

      if (state.type === 'home') {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await stabilizeDom(page);
      }

      if (state.type === 'anchor') {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await stabilizeDom(page);
        const selector = `a[href="${state.anchor}"]`;
        try {
          const anchorLink = page.locator(selector).first();
          if (await anchorLink.isVisible({ timeout: 800 })) {
            await anchorLink.click({ timeout: 1200 });
          } else {
            await page.evaluate((hash) => {
              const target = document.querySelector(hash) || document.querySelector(`[name='${hash.substring(1)}']`) || document.getElementById(hash.substring(1));
              if (target) {
                target.scrollIntoView({ block: 'start', behavior: 'instant' });
                window.scrollBy(0, -72);
              }
            }, state.anchor);
          }
        } catch (e) {
          await page.evaluate((hash) => {
            const target = document.querySelector(hash) || document.querySelector(`[name='${hash.substring(1)}']`) || document.getElementById(hash.substring(1));
            if (target) {
              target.scrollIntoView({ block: 'start', behavior: 'instant' });
              window.scrollBy(0, -72);
            }
          }, state.anchor);
        }
        await safeDelay(900);
      }

      if (state.type === 'url') {
        await page.goto(normalizeUrl(state.url), { waitUntil: 'domcontentloaded', timeout: 30000 });
        await stabilizeDom(page);
      }

      const rawPath = await captureRawScreenshot(page, state, deviceLabel);
      await context.close();
      return rawPath;
    } catch (err) {
      lastError = err;
      await context?.close().catch(() => {});
      if (attempt < maxRetry) {
        await safeDelay(700);
        continue;
      }
      return { error: lastError.message };
    }
  }

  return { error: lastError ? lastError.message : 'capture failed' };
}

async function createClassicPoster(browser, sourceImagePath, state) {
  const posterType = state.posterDevice || (state.devices && state.devices.includes(DEVICE_MOBILE) ? DEVICE_MOBILE : DEVICE_DESKTOP);
  const preset = CLASSIC_POSTER_PRESETS[posterType] || CLASSIC_POSTER_PRESETS[DEVICE_DESKTOP];
  const frameMaxWidth = preset.canvas.width - preset.pagePadding * 2;
  const frameMaxHeight = preset.canvas.height - preset.topArea - preset.footerArea - preset.pagePadding * 2;
  const frameWidthByHeight = Math.min(frameMaxWidth, frameMaxHeight * preset.frameRatio);
  const frameWidth = Math.max(1, Math.floor(frameWidthByHeight));
  const frameHeight = Math.max(1, Math.floor(frameWidth / preset.frameRatio));
  const frameLeft = Math.round((preset.canvas.width - frameWidth) / 2);
  const output = path.join(POSTER_DIR, `${state.id}.png`);
  const posterContext = await browser.newContext({ viewport: preset.canvas, deviceScaleFactor: preset.scale });
  const posterPage = await posterContext.newPage();
  const imageUrl = `data:image/png;base64,${(await fs.readFile(sourceImagePath)).toString('base64')}`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light; }
      html, body { margin: 0; width: 100%; height: 100%; }
      body {
        width: ${preset.canvas.width}px;
        height: ${preset.canvas.height}px;
        background: linear-gradient(170deg, #f6f8fd 0%, #e8eefb 52%, #edf2ff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", Arial, sans-serif;
      }
      .poster {
        width: ${preset.canvas.width - preset.pagePadding * 2}px;
        height: ${preset.canvas.height - preset.pagePadding * 2}px;
        border-radius: 34px;
        background: rgba(255, 255, 255, 0.72);
        box-shadow: 0 26px 50px rgba(16, 34, 61, 0.24);
        backdrop-filter: blur(4px);
        display: grid;
        grid-template-rows: ${preset.topArea}px auto ${preset.footerArea}px;
        padding: 24px 28px 18px;
        box-sizing: border-box;
      }
      .top {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: ${preset.topArea - 24}px;
        padding: 0 18px;
      }
      .top h1 {
        margin: 0;
        color: #111827;
        font-size: ${preset.titleFont}px;
        line-height: 1.06;
        letter-spacing: 0.5px;
      }
      .top p {
        margin: 10px 0 0;
        color: #445063;
        font-size: ${preset.subtitleFont}px;
        line-height: 1.35;
      }
      .frame {
        position: relative;
        width: ${frameWidth}px;
        height: ${frameHeight}px;
        margin: 16px ${frameLeft}px 0;
        border-radius: ${preset.frameRadius}px;
        overflow: hidden;
        border: 1px solid rgba(14, 37, 80, 0.12);
        box-shadow: 0 20px 40px rgba(11, 20, 34, 0.22);
      }
      .frame::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 44%, rgba(0, 0, 0, 0.1) 100%);
        pointer-events: none;
      }
      .frame img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #0b1716;
      }
      .foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 18px 0;
        color: #3d4a5a;
        font-size: 32px;
      }
      .badge {
        padding: 10px 18px;
        border-radius: 999px;
        background: #1d4ed8;
        color: #fff;
        font-weight: 600;
      }
      .foot small { opacity: 0.82; }
    </style>
  </head>
  <body>
    <div class="poster">
      <div class="top">
        <h1>${state.title}</h1>
        <p>${state.subtitle}</p>
      </div>
      <div class="frame">
        <img src="${imageUrl}" alt="${state.title}" />
      </div>
      <div class="foot">
        <small>xiangleideng.site</small>
        <span class="badge">功能快照</span>
      </div>
    </div>
  </body>
</html>`;

  try {
    await posterPage.setContent(html, { waitUntil: 'load' });
    await safeDelay(500);
    await posterPage.screenshot({ path: output, fullPage: false });
  } finally {
    await posterContext.close().catch(() => {});
  }
  return output;
}

async function createPoster(browser, sourceImagePath, state) {
  const posterType = state.posterDevice || (state.devices && state.devices.includes(DEVICE_MOBILE) ? DEVICE_MOBILE : DEVICE_DESKTOP);
  const preset = POSTER_PRESETS[posterType] || POSTER_PRESETS[DEVICE_DESKTOP];
  const posterWidth = preset.canvas.width - preset.pagePadding * 2;
  const posterHeight = preset.canvas.height - preset.pagePadding * 2;
  const innerWidth = posterWidth - preset.posterPaddingX * 2;
  const innerHeight = posterHeight - preset.posterPaddingTop - preset.posterPaddingBottom;
  const isMobile = posterType === DEVICE_MOBILE;
  const frameWidth = isMobile ? 560 : Math.floor((innerWidth - 44) * 0.66);
  const frameHeight = Math.max(1, Math.floor(frameWidth / preset.frameRatio));
  const platformLabel = isMobile ? 'MOBILE / IPHONE RATIO' : 'WEB / DESKTOP';

  const output = path.join(POSTER_DIR, `${state.id}.png`);
  const posterContext = await browser.newContext({ viewport: preset.canvas, deviceScaleFactor: preset.scale });
  const posterPage = await posterContext.newPage();
  // Embed the capture instead of referencing a file:// URL. This keeps the
  // screenshot available when setContent runs in a separate page context,
  // including workspace paths that contain spaces.
  const imageUrl = `data:image/png;base64,${(await fs.readFile(sourceImagePath)).toString('base64')}`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light; }
      html, body { margin: 0; width: 100%; height: 100%; }
      body {
        width: ${preset.canvas.width}px;
        height: ${preset.canvas.height}px;
        background: #050807;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", Arial, sans-serif;
      }
      .poster {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        width: ${posterWidth}px;
        height: ${posterHeight}px;
        border: 1px solid rgba(196, 255, 219, 0.16);
        border-radius: ${isMobile ? 34 : 28}px;
        background:
          radial-gradient(circle at 78% 12%, rgba(184, 244, 204, 0.13), transparent 25%),
          radial-gradient(circle at 18% 86%, rgba(184, 244, 204, 0.07), transparent 28%),
          linear-gradient(135deg, #111817 0%, #0b100f 48%, #080c0c 100%);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        padding: ${preset.posterPaddingTop}px ${preset.posterPaddingX}px ${preset.posterPaddingBottom}px;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 0.34fr minmax(0, 0.66fr);
        grid-template-rows: ${preset.topArea}px minmax(0, 1fr) ${preset.footerArea}px;
        column-gap: 44px;
      }
      .poster::before {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;
        opacity: 0.36;
        background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: linear-gradient(135deg, black, transparent 68%);
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        grid-column: 1 / -1;
        height: ${preset.topArea}px;
        color: #dcebe1;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 22px;
        letter-spacing: 0.04em;
        font-weight: 700;
      }
      .brand-mark {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #b8f4cc;
        box-shadow: 0 0 0 6px rgba(184, 244, 204, 0.11);
      }
      .platform {
        color: rgba(220, 235, 225, 0.55);
        font-size: 16px;
        letter-spacing: 0.16em;
      }
      .copy {
        grid-column: 1;
        align-self: center;
        padding: 18px 24px 0 8px;
      }
      .kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;
        color: #b8f4cc;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.12em;
      }
      .kicker::before {
        content: '';
        width: 42px;
        height: 2px;
        background: #b8f4cc;
      }
      .copy h1 {
        max-width: ${isMobile ? 780 : 560}px;
        margin: 0;
        color: #f2f7f3;
        font-size: ${preset.titleFont}px;
        line-height: 1.08;
        letter-spacing: -0.045em;
        font-weight: 750;
      }
      .copy p {
        max-width: ${isMobile ? 760 : 520}px;
        margin: 24px 0 0;
        color: rgba(220, 235, 225, 0.62);
        font-size: ${preset.subtitleFont}px;
        line-height: 1.45;
        letter-spacing: -0.015em;
      }
      .copy-note {
        margin-top: 38px;
        color: rgba(220, 235, 225, 0.42);
        font-size: 18px;
        letter-spacing: 0.04em;
      }
      .capture {
        grid-column: 2;
        grid-row: 2 / 4;
        align-self: center;
        justify-self: end;
        width: ${frameWidth}px;
      }
      .frame {
        display: flex;
        position: relative;
        width: ${frameWidth}px;
        height: ${frameHeight}px;
        border-radius: ${preset.frameRadius}px;
        overflow: hidden;
        border: 1px solid rgba(216, 255, 229, 0.24);
        background: #07100e;
        box-shadow: 0 28px 56px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(184, 244, 204, 0.035);
      }
      .frame::before {
        content: '';
        position: absolute;
        z-index: 2;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: #b8f4cc;
        opacity: 0.78;
        pointer-events: none;
      }
      .frame img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        background: #07100e;
      }
      .foot {
        grid-column: 1;
        grid-row: 3;
        align-self: end;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 26px;
        align-items: center;
        height: ${preset.footerArea}px;
        color: rgba(220, 235, 225, 0.56);
        font-size: 18px;
      }
      .foot::before {
        content: '';
        width: 54px;
        height: 1px;
        background: rgba(184, 244, 204, 0.55);
      }
      .foot small {
        letter-spacing: 0.05em;
      }
      .foot strong {
        justify-self: end;
        color: #b8f4cc;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.12em;
      }
      .mobile .topbar,
      .mobile .copy,
      .mobile .foot,
      .mobile .capture {
        grid-column: 1 / -1;
      }
      .mobile {
        grid-template-columns: 1fr;
        grid-template-rows: ${preset.topArea}px 260px minmax(0, 1fr) ${preset.footerArea}px;
        row-gap: 12px;
      }
      .mobile .topbar {
        grid-row: 1;
        align-items: flex-start;
      }
      .mobile .platform {
        font-size: 14px;
      }
      .mobile .copy {
        grid-row: 2;
        align-self: start;
        padding: 0 8px;
      }
      .mobile .kicker {
        margin-bottom: 18px;
        font-size: 16px;
      }
      .mobile .copy h1 {
        font-size: ${preset.titleFont}px;
      }
      .mobile .copy p {
        margin-top: 18px;
        font-size: ${preset.subtitleFont}px;
      }
      .mobile .copy-note {
        display: none;
      }
      .mobile .capture {
        grid-row: 3;
        align-self: end;
        justify-self: center;
        width: ${frameWidth}px;
      }
      .mobile .foot {
        grid-row: 4;
        height: ${preset.footerArea}px;
      }
      .mobile .foot strong {
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="poster ${isMobile ? 'mobile' : 'desktop'}">
      <div class="topbar">
        <div class="brand"><span class="brand-mark"></span><span>灯下灯 / XAIVER</span></div>
        <span class="platform">${platformLabel}</span>
      </div>
      <div class="copy">
        <div class="kicker">站内功能快照</div>
        <h1>${state.title}</h1>
        <p>${state.subtitle}</p>
        <div class="copy-note">真实页面 / 直接进入 / 即刻阅读</div>
      </div>
      <div class="capture">
        <div class="frame">
          <img src="${imageUrl}" alt="${state.title}" />
        </div>
      </div>
      <div class="foot">
        <small>xiangleideng.site</small>
        <strong>FEATURE SNAPSHOT</strong>
      </div>
    </div>
  </body>
</html>`;

  try {
    await posterPage.setContent(html, { waitUntil: 'load' });
    await safeDelay(500);
    await posterPage.screenshot({ path: output, fullPage: false });
  } finally {
    await posterContext.close().catch(() => {});
  }
  return output;
}

function resolvePosterSource(state, mobileResult, desktopResult) {
  const preferred = state.posterDevice || (state.devices && state.devices.includes(DEVICE_MOBILE) ? DEVICE_MOBILE : DEVICE_DESKTOP);

  if (preferred === DEVICE_MOBILE && typeof mobileResult === 'string') {
    return { source: mobileResult, posterDevice: DEVICE_MOBILE };
  }

  if (preferred === DEVICE_DESKTOP && typeof desktopResult === 'string') {
    return { source: desktopResult, posterDevice: DEVICE_DESKTOP };
  }

  if (typeof mobileResult === 'string') {
    return { source: mobileResult, posterDevice: DEVICE_MOBILE };
  }

  if (typeof desktopResult === 'string') {
    return { source: desktopResult, posterDevice: DEVICE_DESKTOP };
  }

  return { source: null, posterDevice: preferred };
}

(async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(RAW_DIR, { recursive: true });
  await fs.mkdir(POSTER_DIR, { recursive: true });
  const shotsToRun = requestedShotIds
    ? SHOTS.filter((state) => requestedShotIds.has(state.id))
    : SHOTS;
  if (requestedShotIds) {
    await cleanSelectedShots(shotsToRun.map((state) => state.id));
  } else {
    await cleanDirectory(RAW_DIR);
    await cleanDirectory(POSTER_DIR);
  }

  const report = [];

  for (const state of shotsToRun) {
    console.log(`[capture] start ${state.id}`);
    const browser = await chromium.launch({ headless: true });

    const targetDevices = state.devices && state.devices.length ? state.devices : [DEVICE_DESKTOP];
    let mobileResult = null;
    let desktopResult = null;

    for (const device of targetDevices) {
      if (device === DEVICE_MOBILE) {
        mobileResult = await captureOneDevice(browser, state, MOBILE_VIEWPORT);
      }
      if (device === DEVICE_DESKTOP) {
        desktopResult = await captureOneDevice(browser, state, DESKTOP_VIEWPORT);
      }
    }

    let posterPath = null;
    let posterErr = null;
    const { source: posterSource, posterDevice } = resolvePosterSource(state, mobileResult, desktopResult);
    if (posterSource) {
      try {
        posterPath = await createPoster(browser, posterSource, { ...state, posterDevice });
      } catch (err) {
        posterErr = err.message;
      }
    } else {
      posterErr = 'no capture output for poster generation';
    }

    report.push({
      id: state.id,
      title: state.title,
      subtitle: state.subtitle,
      mobile: typeof mobileResult === 'string' ? mobileResult : null,
      mobile_error: mobileResult && typeof mobileResult === 'object' ? mobileResult.error : null,
      desktop: typeof desktopResult === 'string' ? desktopResult : null,
      desktop_error: desktopResult && typeof desktopResult === 'object' ? desktopResult.error : null,
      poster: posterPath,
      poster_error: posterErr,
    });

    await browser.close().catch(() => {});
  }

  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[done] report=${reportPath}`);
})();
