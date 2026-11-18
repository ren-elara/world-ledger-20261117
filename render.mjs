import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Build-time tools only; the submitted program needs no installed packages.
const require = createRequire(process.env.RENDER_PACKAGE_JSON || new URL('./package.json', import.meta.url));
const { chromium } = require('playwright');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE,
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('./frontpage.html', import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => {
    const issues = [];
    const boxes = [];
    const regions = [...document.querySelectorAll('[data-region]')];
    for (const region of regions) {
      const b = region.getBoundingClientRect();
      boxes.push({ name: region.dataset.region, x: b.x, y: b.y, width: b.width, height: b.height });
      if (b.left < 0 || b.top < 0 || b.right > 1024 || b.bottom > 1024) issues.push(`Outside canvas: ${region.dataset.region}`);
      const ranges = [];
      const walker = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('svg')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          const label = node.textContent.trim().slice(0, 80);
          if (rect.left < b.left - 1 || rect.right > b.right + 1 || rect.top < b.top - 1 || rect.bottom > b.bottom + 1) issues.push(`Text outside ${region.dataset.region}: ${label}`);
          ranges.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, label, parent: node.parentElement });
        }
      }
      for (let i = 0; i < ranges.length; i++) for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i], c = ranges[j];
        // Adjacent lines in the same typographic block share font ascender space.
        // Independent blocks still must have completely separate line boxes.
        if (a.parent === c.parent) continue;
        if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 1 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) issues.push(`Text overlap in ${region.dataset.region}: ${a.label} / ${c.label}`);
      }
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x) + 1 && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y) + 1) issues.push(`Regions overlap: ${a.name} / ${b.name}`);
    }
    for (const svg of document.querySelectorAll('svg')) {
      const bounds = svg.viewBox.baseVal;
      for (const text of svg.querySelectorAll('text')) {
        const box = text.getBBox();
        if (box.x < bounds.x || box.y < bounds.y || box.x + box.width > bounds.width + 1 || box.y + box.height > bounds.height + 1) issues.push(`SVG label outside artwork: ${text.textContent}`);
      }
    }
    return { issues, boxes, fontLoaded: document.fonts.check('16px Ledger'), visualInspection: 'Unavailable: this agent cannot view images.' };
  });
  if (errors.length || geometry.issues.length || !geometry.fontLoaded) throw new Error(JSON.stringify({ errors, ...geometry }, null, 2));
  const imagePath = fileURLToPath(new URL('./entry.png', import.meta.url));
  await page.screenshot({ path: imagePath, type: 'png' });
  const first = await readFile(imagePath);
  const second = await page.screenshot({ type: 'png' });
  if (!first.equals(second)) throw new Error('Consecutive renders differ');
  if (first.length > 1048576) throw new Error(`Image too large: ${first.length}`);
  const printPage = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 3 });
  await printPage.goto(new URL('./frontpage.html', import.meta.url).href);
  await printPage.evaluate(() => document.fonts.ready);
  await printPage.screenshot({ path: fileURLToPath(new URL('./print-master.png', import.meta.url)), type: 'png' });
  await printPage.close();
  await page.evaluate(() => { document.querySelector('#paper').style.transform = 'scale(0.29296875)'; document.querySelector('#paper').style.transformOrigin = 'top left'; });
  await page.setViewportSize({ width: 300, height: 300 });
  await page.screenshot({ path: fileURLToPath(new URL('./preview-300.png', import.meta.url)), type: 'png' });
  const report = { ...geometry, bytes: first.length, sha256: createHash('sha256').update(first).digest('hex'), deterministicRender: true };
  await writeFile(new URL('./validation.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
