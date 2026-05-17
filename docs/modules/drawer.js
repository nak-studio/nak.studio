/**
 * Drawer Module
 */

import { state, DOM_IDS } from './state.js';
import { getElement, escapeHtml } from '../utils/dom.js';
import { t } from './i18n.js';
import { filterByTopic } from './filters.js';

function getBadgeColorClass(topic) {
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['nk-bg--c', 'nk-bg--m', 'nk-bg--y', 'nk-bg--c-lighter'];
  return colors[Math.abs(hash) % colors.length];
}

export function openDrawer(artwork, startIndex = 0) {
  const drawer = getElement(DOM_IDS.DRAWER);
  const dimmer = getElement(DOM_IDS.DIMMER);
  const content = getElement(DOM_IDS.DRAWER_CONTENT);
  if (!drawer || !dimmer || !content) return;

  state.setCurrentArtwork(artwork);
  content.innerHTML = buildDrawerContent(artwork, startIndex);
  setupCarousel(artwork, startIndex);
  drawer.classList.add('nk-is-open');
  dimmer.classList.add('nk-is-open');
  dimmer.onclick = closeDrawer;

  // Always re-bind close button after rendering drawer content
  const closeBtn = document.getElementById(DOM_IDS.CLOSE_DRAWER) || document.getElementById('close-drawer');
  if (closeBtn) {
    closeBtn.onclick = closeDrawer;
  }
}

export function closeDrawer() {
  const drawer = getElement(DOM_IDS.DRAWER);
  const dimmer = getElement(DOM_IDS.DIMMER);
  if (drawer) drawer.classList.remove('nk-is-open');
  if (dimmer) dimmer.classList.remove('nk-is-open');
}

export function setupDrawer() {
  const closeBtn = getElement(DOM_IDS.CLOSE_DRAWER);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

export function changeMainImage(url, alt) {
  // Legacy — kept for compatibility
}

function setupCarousel(artwork, startIndex) {
  const container = document.getElementById('drawer-carousel');
  if (!container || artwork.images.length <= 1) return;

  let current = startIndex;
  const img = container.querySelector('.carousel-img');
  const counter = container.querySelector('.carousel-counter');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');

  function update() {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = artwork.images[current].url;
      img.alt = artwork.images[current].alt || '';
      img.style.opacity = '1';
    }, 150);
    counter.textContent = `${current + 1} / ${artwork.images.length}`;
  }

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + artwork.images.length) % artwork.images.length;
    update();
  });
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % artwork.images.length;
    update();
  });
}

function buildDrawerContent(artwork, startIndex) {
  const mainImg = artwork.images[startIndex] || artwork.images[0];
  let html = '';

  // Carousel
  const hasMultiple = artwork.images.length > 1;
  html += `<div id="drawer-carousel" class="drawer-carousel">`;
  html += `<img class="carousel-img" src="${escapeHtml(mainImg.url)}" alt="${escapeHtml(mainImg.alt || '')}">`;
  if (hasMultiple) {
    html += `<button class="carousel-prev" aria-label="Previous">&#8249;</button>`;
    html += `<button class="carousel-next" aria-label="Next">&#8250;</button>`;
    html += `<span class="carousel-counter">${startIndex + 1} / ${artwork.images.length}</span>`;
  }
  html += `</div>`;

  // Title
  html += `<h2 class="drawer-title">${escapeHtml(artwork.title)}</h2>`;

  // // Description
  // if (artwork.description) {
  //   html += `<p class="drawer-description">${escapeHtml(artwork.description)}</p>`;
  // }

  // Details
  html += '<dl class="drawer-details">';

  // Status with dot
  const statusKey = artwork.status === 'private' ? 'privateCollection' : artwork.status;
  const statusClass = (artwork.status === 'sold' || artwork.status === 'private') ? 'status-dot--sold' : 'status-dot--available';
  html += `<div class="drawer-detail"><dt>${escapeHtml(t('status'))}</dt><dd><span class="status-dot ${statusClass}"></span>${escapeHtml(t(statusKey))}</dd></div>`;


  // Medium (localized)
  const lang = state.getLanguage ? state.getLanguage() : 'eu';
  let localizedMedium = artwork.translations && artwork.translations[lang] && artwork.translations[lang].medium;
  if (!localizedMedium && artwork.medium) {
    localizedMedium = Array.isArray(artwork.medium) ? artwork.medium.join(', ') : artwork.medium;
  }
  if (localizedMedium) {
    html += `<div class="drawer-detail"><dt>${escapeHtml(t('medium'))}</dt><dd>${escapeHtml(localizedMedium)}</dd></div>`;
  }

  // Painted date (localized month/year)
  if (artwork.paintedAt) {
    let paintedStr = artwork.paintedAt;
    // Try to localize month if format is 'YYYY Month'
    const match = paintedStr.match(/^(\d{4})\s+([A-Za-z]+)/);
    if (match) {
      const year = match[1];
      const monthEn = match[2];
      const months = {
        'en': {
          'January': 'January', 'February': 'February', 'March': 'March', 'April': 'April', 'May': 'May', 'June': 'June', 'July': 'July', 'August': 'August', 'September': 'September', 'October': 'October', 'November': 'November', 'December': 'December'
        },
        'eu': {
          'January': 'Urtarrila', 'February': 'Otsaila', 'March': 'Martxoa', 'April': 'Apirila', 'May': 'Maiatza', 'June': 'Ekaina', 'July': 'Uztaila', 'August': 'Abuztua', 'September': 'Iraila', 'October': 'Urria', 'November': 'Azaroa', 'December': 'Abendua'
        }
      };
      const lang = state.getLanguage ? state.getLanguage() : 'eu';
      const month = months[lang] && months[lang][monthEn] ? months[lang][monthEn] : monthEn;
      if (lang === 'eu') {
        paintedStr = `${year}ko ${month}`;
      } else {
        paintedStr = `${month} ${year}`;
      }
    }
    html += `<div class="drawer-detail"><dt>${escapeHtml(t('painted') || 'Painted')}</dt><dd>${escapeHtml(paintedStr)}</dd></div>`;
  }

  // Dimensions
  if (artwork.dimensions) {
    html += `<div class="drawer-detail"><dt>${escapeHtml(t('dimensions'))}</dt><dd>${artwork.dimensions.width} × ${artwork.dimensions.height} ${artwork.dimensions.unit}</dd></div>`;
  }

  html += '</dl>';

  return html;
}
