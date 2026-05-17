/**
 * Global State Management
 */

export const DOM_IDS = {
  ARTWORKS: 'artworks',
  DRAWER: 'artwork-drawer',
  DIMMER: 'drawer-dimmer',
  DRAWER_CONTENT: 'drawer-content',
  CLOSE_DRAWER: 'close-drawer',
  FILTER_BAR: 'filter-bar',
  FILTER_DISPLAY: 'filter-display'
};

function getDataPath(file) {
  return new URL(`../data/${file}`, import.meta.url).href;
}

export const DATA_PATHS = {
  TRANSLATIONS: getDataPath('translations.json'),
  ARTWORKS: getDataPath('artworks.json')
};

export const TEXT_PREVIEW_LENGTH = 200;
export const DEFAULT_LANG = 'eu';

class AppState {
  constructor() {
    this.currentLang = localStorage.getItem('lang') || DEFAULT_LANG;
    this.translations = {};
    this.allArtworks = [];
    this.currentFilter = null;
    this.currentArtwork = null;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  getLanguage() {
    return this.currentLang;
  }

  setTranslations(translations) {
    this.translations = translations;
  }

  getTranslations() {
    return this.translations;
  }

  getTranslation(key) {
    return this.translations[this.currentLang]?.[key] || key;
  }

  setArtworks(artworks) {
    this.allArtworks = artworks;
  }

  getArtworks() {
    return this.allArtworks;
  }

  setFilter(filter) {
    this.currentFilter = filter;
  }

  getFilter() {
    return this.currentFilter;
  }

  clearFilter() {
    this.currentFilter = null;
  }

  setCurrentArtwork(artwork) {
    this.currentArtwork = artwork;
  }

  getCurrentArtwork() {
    return this.currentArtwork;
  }

  getFilteredArtworks() {
    if (!this.currentFilter) return this.allArtworks;
    return this.allArtworks.filter(a => a.topics && a.topics.includes(this.currentFilter));
  }
}

export const state = new AppState();
