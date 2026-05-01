const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Capture the raw response body during navigation
  let rawHtml = null;
  page.on('response', async (resp) => {
    if (resp.url() === 'https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect') {
      try { rawHtml = await resp.text(); } catch {}
    }
  });

  await page.goto('https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Raw response captured:', rawHtml ? rawHtml.length + ' bytes' : 'NO');
  if (rawHtml) {
    console.log('Has freeChapters:', rawHtml.includes('freeChapters'));
    fs.writeFileSync('/tmp/skydemon-raw.html', rawHtml);
  }

  const post = await page.evaluate(() => {
    const xd = Array.from(document.querySelectorAll('[x-data]')).filter(e => (e.getAttribute('x-data') || '').includes('freeChapters'));
    const html = document.documentElement.outerHTML;
    return { xdataMatches: xd.length, hasFreeChaptersInDom: html.includes('freeChapters'), domLen: html.length };
  });
  console.log('Post-JS:', post);

  await browser.close();
})();
