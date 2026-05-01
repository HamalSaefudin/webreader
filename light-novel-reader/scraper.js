const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const PROJECT_URL = 'https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect';
const PROJECT_BASE = PROJECT_URL;
const OUTPUT_DIR = path.join(__dirname, 'public', 'chapters');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');
const DELAY_MS = 600;

// Env vars:
//   LIMIT=5       — cap to first 5 chapters (smoke test)
//   START=577     — only scrape chapters with id >= 577
//   END=600       — only scrape chapters with id <= 600
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity;
const START = process.env.START ? parseInt(process.env.START, 10) : 1;
const END = process.env.END ? parseInt(process.env.END, 10) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getChapterIndex(page) {
  console.log('Fetching chapter index from project page...');
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1500);

  // Trigger Livewire lazy load: scrollIntoView on the chapter-list component.
  console.log('Triggering chapter-list lazy-load...');
  await page.evaluate(() => {
    const el = document.querySelector('[wire\\:name="project.chapter-list"]');
    if (el) el.scrollIntoView({ block: 'center' });
    // Also scroll window in case
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Wait for the freeChapters x-data attribute to appear (after lazy load).
  console.log('Waiting for freeChapters to populate...');
  const handle = await page.waitForFunction(() => {
    for (const el of document.querySelectorAll('[x-data]')) {
      const v = el.getAttribute('x-data');
      if (v && v.includes('freeChapters')) return v;
    }
    return null;
  }, { timeout: 30000, polling: 500 });
  const rawAttr = await handle.jsonValue();

  if (!rawAttr) throw new Error('No x-data attribute containing freeChapters found');

  const m = rawAttr.match(/freeChapters:\s*JSON\.parse\('((?:\\'|[^'])*)'\)/);
  if (!m) throw new Error('freeChapters JSON.parse(...) not found in x-data');
  // The string has its " characters serialized as the literal 6-char sequence ".
  // Decode that (and \/ which appears in URL paths) before feeding to JSON.parse.
  const decoded = m[1]
    .replace(/\\u0022/g, '"')
    .replace(/\\\//g, '/');
  let chapters;
  try {
    chapters = JSON.parse(decoded);
  } catch (e) {
    throw new Error('Failed to JSON.parse freeChapters: ' + e.message + ' | sample: ' + decoded.slice(0, 200));
  }

  if (!chapters || chapters.error) {
    throw new Error('Failed to extract chapter index: ' + JSON.stringify(chapters));
  }
  // Sort ascending by episode number for sane reading order.
  chapters.sort((a, b) => a.episode - b.episode);
  console.log(`Found ${chapters.length} chapters (range ${chapters[0].episode}–${chapters[chapters.length - 1].episode})`);
  return chapters;
}

async function scrapeChapter(page, slug) {
  const url = `${PROJECT_BASE}/${slug}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Wait briefly for prose to render
  await page.waitForSelector('.prose', { timeout: 15000 });

  const data = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const prose = document.querySelector('.prose');
    return {
      title: h1 ? h1.textContent.trim() : '',
      content: prose ? prose.innerHTML.trim() : '',
    };
  });

  return { ...data, url };
}

function chapterFilePath(id) {
  return path.join(OUTPUT_DIR, `${id}.json`);
}

function loadAlreadyScrapedIds() {
  if (!fs.existsSync(OUTPUT_DIR)) return new Set();
  const ids = new Set();
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    const m = f.match(/^(\d+)\.json$/);
    if (m) ids.add(parseInt(m[1], 10));
  }
  return ids;
}

function saveChapter(record) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(chapterFilePath(record.id), JSON.stringify(record));
}

function saveIndex(index) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  // Trim each entry to just what the manifest needs.
  const slim = index.map((c) => ({
    id: c.episode,
    title: c.title,
    slug: c.slug,
    postedAt: c.postedAt,
  }));
  fs.writeFileSync(INDEX_FILE, JSON.stringify(slim));
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // Block heavy assets to speed up; keep stylesheets so layout/IntersectionObserver works.
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const t = req.resourceType();
    if (t === 'image' || t === 'font' || t === 'media') {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    const index = await getChapterIndex(page);
    saveIndex(index);
    console.log(`Wrote manifest with ${index.length} chapters → ${INDEX_FILE}`);

    const haveIds = loadAlreadyScrapedIds();
    console.log(`${haveIds.size} chapter files already on disk; resuming.`);

    let toDo = index.filter((c) => c.episode >= START && c.episode <= END && !haveIds.has(c.episode));
    if (LIMIT !== Infinity) toDo = toDo.slice(0, LIMIT);
    console.log(`Will scrape ${toDo.length} chapters this run (range ${START}–${END === Infinity ? '∞' : END}).`);

    let done = haveIds.size;
    for (let i = 0; i < toDo.length; i++) {
      const ch = toDo[i];
      try {
        const scraped = await scrapeChapter(page, ch.slug);
        const record = {
          id: ch.episode,
          title: scraped.title || ch.title,
          content: scraped.content,
          url: scraped.url,
          slug: ch.slug,
          postedAt: ch.postedAt,
        };
        saveChapter(record);
        done++;
        console.log(`✓ [${done}/${index.length}] Ch.${ch.episode}: ${record.title.slice(0, 70)}`);
      } catch (err) {
        console.error(`✗ Ch.${ch.episode} (${ch.slug}) failed: ${err.message}`);
      }
      await sleep(DELAY_MS);
    }

    // Trim manifest to chapters that actually have files on disk so the
    // sidebar doesn't list chapters the app can't load.
    const onDisk = loadAlreadyScrapedIds();
    const filteredIndex = index.filter((c) => onDisk.has(c.episode));
    saveIndex(filteredIndex);
    console.log(`\nDone. ${done}/${index.length} chapters in ${OUTPUT_DIR}/`);
    console.log(`Manifest trimmed to ${filteredIndex.length} chapters present on disk.`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
