import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:3000/';
const label = process.argv[3] || '';
const viewportArg = process.argv[4] || 'desktop'; // desktop | mobile

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile:  { width: 390,  height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const outDir = path.resolve('temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir).filter(f => /^screenshot-\d+/.test(f));
const next = existing.length === 0
  ? 1
  : Math.max(...existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)[1], 10))) + 1;

const suffix = label ? `-${label}` : '';
const file = path.join(outDir, `screenshot-${next}${suffix}.png`);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport(viewports[viewportArg] || viewports.desktop);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll through the page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  await new Promise(resolve => {
    const distance = 400;
    const delay = 80;
    let total = 0;
    const height = document.body.scrollHeight;
    const tick = setInterval(() => {
      window.scrollBy(0, distance);
      total += distance;
      if (total >= height) {
        clearInterval(tick);
        window.scrollTo(0, 0);
        resolve();
      }
    }, delay);
  });
});

// Force any still-hidden reveal elements to show (safety net)
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
});

// Settle: fonts, animations, scroll
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: file, fullPage: true });
await browser.close();
console.log(file);
