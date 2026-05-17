// Migration script: combine language variants for collection pages.
// Run with: node migrate-artworks.js

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'docs/data/artworks.json');
const OUTPUT = path.join(__dirname, 'docs/data/artworks.migrated.json');

const raw = fs.readFileSync(INPUT, 'utf8');
const data = JSON.parse(raw);

function normalizeAssetUrl(url) {
  if (!url || /^(https?:|data:|blob:)/.test(url)) return url;
  const assetsIndex = url.indexOf('assets/');
  return assetsIndex === -1 ? url : url.slice(assetsIndex);
}

function normalizeImages(images) {
  return (images || [])
    .map(image => ({
      ...image,
      url: normalizeAssetUrl(image.url)
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function fallbackDescription(source, lang) {
  if (source.description) {
    return lang === 'en'
      ? source.description.replace('Bila Bilduma pieza', 'Bila Collection piece')
      : source.description;
  }

  return lang === 'en'
    ? `${source.title || source.id} from the Bila Collection`
    : `${source.title || source.id} Bila Bildumakoa`;
}

const grouped = {};
for (const a of data.artworks) {
  if (!a.collection || a.collection !== 'bila-collection') continue;
  if (!a.id.startsWith('bila-')) continue;
  if (!a.slug) continue;
  const key = a.id.replace(/-(eu|en)$/, '');
  if (!grouped[key]) grouped[key] = {};
  grouped[key][a.language || 'default'] = a;
}

const migrated = [];
for (const slug in grouped) {
  const entry = grouped[slug];
  const source = entry.eu || entry.en || entry.default;
  if (!source) continue;

  const base = {
    ...source,
    id: source.id.replace(/-(eu|en)$/, ''),
    images: normalizeImages(source.images),
    translations: {
      eu: {
        title: (entry.eu || source).title,
        description: fallbackDescription(entry.eu || source, 'eu')
      },
      en: {
        title: (entry.en || source).title,
        description: fallbackDescription(entry.en || source, 'en')
      }
    }
  };

  delete base.title;
  delete base.description;
  delete base.language;
  migrated.push(base);
}

fs.writeFileSync(OUTPUT, JSON.stringify({ artworks: migrated }, null, 2));
console.log('Migration complete. Output:', OUTPUT);
