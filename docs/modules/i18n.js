/**
 * Internationalization Module
 */

import { state, DATA_PATHS } from './state.js';
import { getElement, escapeHtml } from '../utils/dom.js';

export async function initI18n() {
  try {
    const res = await fetch(DATA_PATHS.TRANSLATIONS);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const translations = await res.json();
    state.setTranslations(translations);
    updateUILanguage();
    setupLanguageSwitcher();
    markActiveNav();
  } catch (err) {
    console.error('Error loading translations:', err);
    state.setTranslations({ [state.getLanguage()]: {} });
  }
}

function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const resolved = new URL(href, window.location.href).pathname;
    if (path === resolved || (resolved !== '/' && path.startsWith(resolved))) {
      link.classList.add('active');
    }
  });
}

export function updateUILanguage() {
  const currentLang = state.getLanguage();
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = state.getTranslation(key);
    if (translation !== key) {
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active', 'nk-button--color');
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active', 'nk-button--color');
    }
  });
}

function setupLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setLanguage(btn.dataset.lang);
      updateUILanguage();
      document.dispatchEvent(new CustomEvent('languageChanged'));
    });
  });
}

export function t(key) {
  return state.getTranslation(key);
}
