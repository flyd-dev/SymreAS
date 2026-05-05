import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:3000/';
const selector = process.argv[3] || '.hero';
const label = process.argv[4] || 'section';

const outDir = path.resolve('temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });
const existing = fs.readdirSync(outDir).filter(f => /^screenshot-\d+/.test(f));
const next = existing.length === 0
  ? 1
  : Math.max(...existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)[1], 10))) + 1;
const file = path.join(outDir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

await page.evaluate(async () => {
  await new Promise(r => {
    let total = 0; const h = document.body.scrollHeight;
    const t = setInterval(() => {
      window.scrollBy(0, 400); total += 400;
      if (total >= h) { clearInterval(t); window.scrollTo(0, 0); r(); }
    }, 60);
  });
});
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')));
await new Promise(r => setTimeout(r, 600));

const el = await page.$(selector);
if (!el) { console.error('Selector not found:', selector); process.exit(1); }

await el.screenshot({ path: file });
await browser.close();
console.log(file);
