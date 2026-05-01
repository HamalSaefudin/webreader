const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const URL = 'https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect/1-what-the-hell-is-this-situation-1';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Page title:', await page.title());

  const html = await page.content();
  fs.writeFileSync('/tmp/skydemon-chapter.html', html);
  console.log('Saved chapter HTML (', html.length, 'bytes)');

  // Probe likely selectors and grab their text length
  const probe = await page.evaluate(() => {
    const selectors = [
      'article',
      'main article',
      '.prose',
      '[class*="prose"]',
      '.chapter-content',
      '#chapter-content',
      'main .content',
      '[wire\\:key*="chapter"]',
      'main',
    ];
    const out = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      out[sel] = el ? { tag: el.tagName, textLen: el.textContent.trim().length, classes: el.className.slice(0, 200) } : null;
    }
    // Find headings
    out.h1 = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()).slice(0, 5);
    out.h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).slice(0, 5);
    return out;
  });
  console.log(JSON.stringify(probe, null, 2));

  await browser.close();
})().catch(err => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
