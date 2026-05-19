/**
 * Artwork Renderer Module
 */

import { DOM_IDS, TEXT_PREVIEW_LENGTH } from './state.js';
import { getElement, createEl, createMediaElement } from '../utils/dom.js';
import { createTopicBadges } from './filters.js';
import { openDrawer } from './drawer.js';
import { t } from './i18n.js';

export function displayArtworks(artworks, containerId) {
  const container = getElement(containerId || DOM_IDS.ARTWORKS);
  if (!container) return;
  container.innerHTML = '';
  artworks.forEach(artwork => {
    container.appendChild(createArtworkItem(artwork));
  });
}

function createArtworkItem(artwork) {
  const div = document.createElement('div');
  div.className = 'item';
  div.style.cursor = 'pointer';
  div.style.position = 'relative';
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', `View details of ${artwork.title}`);

  const openArtwork = (e) => {
    if (e.target.classList.contains('nk-badge')) return;
    openDrawer(artwork);
  };
  div.onclick = openArtwork;
  div.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArtwork(e); }
  };

  // Main image
  if (artwork.images && artwork.images.length > 0) {
    const figure = document.createElement('figure');
    figure.className = 'item-figure';

    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';
    imgWrapper.style.display = 'inline-block';
    imgWrapper.style.width = '100%';

    const mainImage = createMediaElement(artwork.images[0]);
    mainImage.className = 'nk-card__image';
    mainImage.style.objectFit = 'contain';
    mainImage.style.height = 'auto';
    mainImage.style.maxHeight = '700px';
    imgWrapper.appendChild(mainImage);

    if (artwork.isNew) {
      const badge = document.createElement('span');
      badge.className = 'badge-new';
      badge.textContent = t('new');
      imgWrapper.appendChild(badge);
    }

    figure.appendChild(imgWrapper);

    const caption = document.createElement('figcaption');
    caption.className = 'item-caption';

    // Group: title, dimensions, and status dot
    const metaRow = document.createElement('div');
    metaRow.style.display = 'flex';
    metaRow.style.alignItems = 'center';
    metaRow.style.gap = '0.75rem';

            // Availability dot
    if (artwork.status === 'sold' || artwork.status === 'private') {
      const dot = document.createElement('span');
      dot.className = 'status-dot status-dot--sold';
      dot.title = t(artwork.status === 'sold' ? 'sold' : 'privateCollection');
      metaRow.appendChild(dot);
    }

    // Title
    const titleEl = createEl('h3', artwork.title);
    metaRow.appendChild(titleEl);

    caption.appendChild(metaRow);
    figure.appendChild(caption);
    div.appendChild(figure);


    // Dimensions
    const dimensions = formatDimensions(artwork.dimensions);
    if (dimensions) {
      const meta = createEl('span', dimensions);
      meta.className = 'item-meta';
      caption.appendChild(meta);
    }
  }

  // Description
  // if (artwork.description) {
  //   const p = createEl('p', artwork.description);
  //   p.className = 'text-preview';
  //   div.appendChild(p);
  //   if (artwork.description.length > TEXT_PREVIEW_LENGTH) {
  //     addReadMore(p, artwork.description);
  //   }
  // }

  // Topics (hidden for now)
  // if (artwork.topics && artwork.topics.length > 0) {
  //   div.appendChild(createTopicBadges(artwork.topics));
  // }

  return div;
}

function formatDimensions(dimensions) {
  if (!dimensions || !dimensions.width || !dimensions.height) return '';
  return `${dimensions.width} x ${dimensions.height} ${dimensions.unit || ''}`.trim();
}

function addReadMore(p, fullText) {
  const readMore = document.createElement('span');
  readMore.textContent = ' ' + t('readMore');
  readMore.className = 'read-more';
  readMore.addEventListener('click', (e) => {
    e.stopPropagation();
    if (p.classList.contains('text-preview')) {
      p.classList.remove('text-preview');
      readMore.textContent = ' ' + t('showLess');
    } else {
      p.classList.add('text-preview');
      readMore.textContent = ' ' + t('readMore');
    }
  });
  p.appendChild(readMore);
}
