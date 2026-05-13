import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SERIES_ID = 2;
const SERIES_SLUG = 'return-mount-hua-sect';
const BASE_URL = 'https://amethystwriters.com/novel/return-of-the-mount-hua-sect';
const DELAY_MS = 500;

const START = process.env.START ? parseInt(process.env.START, 10) : 1243;
const END = process.env.END ? parseInt(process.env.END, 10) : 1962;
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchChapter(chapterNum) {
  const url = `${BASE_URL}/${chapterNum}/`;

  const { data } = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });

  const $ = cheerio.load(data);

  const pageTitle = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  const titleMatch = pageTitle.match(/^(.+?)\s*-\s*(\d+)\s*-\s*(.+?)\s*-\s*Amethyst Writers/);
  const title = titleMatch ? titleMatch[3].trim() : `Chapter ${chapterNum}`;

  const content = $('.entry-content').html() || '';

  return {
    id: chapterNum,
    series_id: SERIES_ID,
    series_slug: SERIES_SLUG,
    chapter_number: chapterNum,
    title,
    slug: slugify(`${chapterNum}-${title}`),
    posted_at: null,
    content: content.trim()
  };
}

async function upsertChapter(chapter) {
  const { error } = await supabase
    .from('chapters')
    .upsert(chapter, {
      onConflict: 'series_id,id'
    });

  if (error) {
    throw new Error(`Failed to upsert chapter ${chapter.id}: ${error.message}`);
  }
}

async function main() {
  console.log(`=== Amethyst Scraper ===`);
  console.log(`Range: ${START} to ${END}`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log('');

  const totalToScrape = Math.min(LIMIT, END - START + 1);
  console.log(`Chapters to scrape: ${totalToScrape}`);

  let success = 0;
  let failed = 0;
  const failedChapters = [];

  for (let ch = START; ch <= END && success + failed < totalToScrape; ch++) {
    try {
      const chapter = await fetchChapter(ch);
      await upsertChapter(chapter);
      success++;
      console.log(`✓ [${success}/${totalToScrape}] Ch.${ch}: ${chapter.title.slice(0, 60)}`);
    } catch (err) {
      failed++;
      failedChapters.push({ chapter: ch, error: err.message });
      console.error(`✗ Ch.${ch} failed: ${err.message}`);
    }

    if (ch < END && success + failed < totalToScrape) {
      await sleep(DELAY_MS);
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);

  if (failedChapters.length > 0) {
    console.log('');
    console.log('Failed chapters:');
    failedChapters.forEach(({ chapter, error }) => {
      console.log(`  Ch.${chapter}: ${error}`);
    });
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});