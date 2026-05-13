import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables required');
  console.error('Set them in .env or export before running:');
  console.error('  export SUPABASE_URL=https://your-project.supabase.co');
  console.error('  export SUPABASE_SERVICE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SERIES_SLUG = 'return-mount-hua-sect';
const SERIES_TITLE = 'Mount Hua Sect';
const SERIES_DESC = 'Novel about Mount Hua Sect martial arts';

const CHAPTERS_DIR = path.join(__dirname, '../public/chapters');
const INDEX_FILE = path.join(CHAPTERS_DIR, 'index.json');

async function getSeriesId() {
  const { data: series, error } = await supabase
    .from('series')
    .select('id')
    .eq('slug', SERIES_SLUG)
    .single();

  if (series) {
    console.log(`Series "${SERIES_SLUG}" already exists with id: ${series.id}`);
    return series.id;
  }

  const { data: newSeries, error: insertError } = await supabase
    .from('series')
    .insert({ slug: SERIES_SLUG, title: SERIES_TITLE, description: SERIES_DESC })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating series:', insertError);
    process.exit(1);
  }

  console.log(`Created series "${SERIES_SLUG}" with id: ${newSeries.id}`);
  return newSeries.id;
}

async function seedChapters(seriesId) {
  let indexData;

  try {
    indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  } catch (e) {
    console.error('Error reading index.json:', e.message);
    process.exit(1);
  }

  const indexMap = new Map(indexData.map(ch => [ch.id, ch]));

  const files = fs.readdirSync(CHAPTERS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');

  console.log(`Found ${files.length} chapter files`);

  const chapters = [];

  for (const file of files) {
    const filePath = path.join(CHAPTERS_DIR, file);
    const chapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const id = chapterData.id;
    const indexInfo = indexMap.get(id);

    chapters.push({
      id,
      series_id: seriesId,
      series_slug: SERIES_SLUG,
      chapter_number: id,
      title: indexInfo?.title || chapterData.title || `Chapter ${id}`,
      slug: indexInfo?.slug || `${id}-chapter`,
      posted_at: indexInfo?.postedAt || null,
      content: chapterData.content || ''
    });
  }

  chapters.sort((a, b) => a.id - b.id);

  console.log(`Uploading ${chapters.length} chapters to Supabase...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
    const batch = chapters.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('chapters').upsert(batch, {
      onConflict: 'series_id,id',
      merge: true
    });

    if (error) {
      console.error('Error uploading batch:', error);
      process.exit(1);
    }

    const progress = Math.min(i + BATCH_SIZE, chapters.length);
    console.log(`Uploaded ${progress}/${chapters.length} chapters`);
  }

  console.log('Seed complete!');
}

async function main() {
  console.log('=== Seed Chapters to Supabase ===\n');

  const seriesId = await getSeriesId();
  await seedChapters(seriesId);

  console.log('\n=== Done ===');
}

main();