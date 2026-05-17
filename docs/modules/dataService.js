/**
 * Data Service Module
 */

import { state, DATA_PATHS } from './state.js';

function resolveAssetUrl(url) {
  if (!url || /^(https?:|data:|blob:)/.test(url)) return url;

  const assetsIndex = url.indexOf('assets/');
  if (assetsIndex !== -1) {
    return new URL(`../${url.slice(assetsIndex)}`, import.meta.url).href;
  }

  return new URL(url, DATA_PATHS.ARTWORKS).href;
}

function localizeArtwork(artwork, lang) {
  const translation = artwork.translations?.[lang] || artwork.translations?.eu || artwork.translations?.en;
  const images = (artwork.images || []).map(image => ({
    ...image,
    url: resolveAssetUrl(image.url)
  }));

  return {
    ...artwork,
    title: translation?.title || artwork.title || artwork.id,
    description: translation?.description || artwork.description || '',
    medium: translation?.medium ? [translation.medium] : (artwork.medium || []),
    images
  };
}

export async function loadData() {
  try {
    const res = await fetch(DATA_PATHS.ARTWORKS.replace('artworks.json', 'artworks.migrated.json'));
    if (!res.ok) throw new Error('Failed to fetch data');
    const data = await res.json();
    const currentLang = state.getLanguage();

    const artworks = (data.artworks || [])
      .filter(a => a.visibility !== 'private')
      .map(a => localizeArtwork(a, currentLang));

    state.setArtworks(artworks);
    return { artworks };
  } catch (err) {
    console.error('Error loading data:', err);
    throw err;
  }
}

export function getFilteredArtworks() {
  return state.getFilteredArtworks();
}

export function getArtworksByCollection(collection) {
  const artworks = state.getFilteredArtworks();
  return artworks.filter(a => a.collection === collection);
}
