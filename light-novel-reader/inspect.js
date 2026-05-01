const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const URL = 'https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait a bit for any JS to settle / Cloudflare to clear
  await new Promise(r => setTimeout(r, 3000));

  const title = await page.title();
  console.log('Page title:', title);

  // Dump full HTML for inspection
  const html = await page.content();
  fs.writeFileSync('/tmp/skydemon-project.html', html);
  console.log('Saved HTML to /tmp/skydemon-project.html (', html.length, 'bytes)');

  // Try common chapter-list selectors and report
  const stats = await page.evaluate(() => {
    const out = {};
    const selectors = [
      'a[href*="/chapters/"]',
      'a[href*="/chapter/"]',
      'a.chapter-link',
      '.chapter-list a',
      '.chapters a',
      'a[href*="3801994495"]',
      'main a',
      'article a',
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      out[sel] = els.length;
    }
    // Also collect a sample of all anchor hrefs
    const allLinks = Array.from(document.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter(h => h && (h.includes('chapter') || h.match(/\/\d+/)))
      .slice(0, 25);
    out.sampleLinks = allLinks;
    return out;
  });
  console.log('Selector counts:', JSON.stringify(stats, null, 2));

  await browser.close();
})().catch(err => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
