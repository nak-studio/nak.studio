/**
 * Filters Module
 */

import { state, DOM_IDS } from './state.js';
import { getElement } from '../utils/dom.js';
import { t } from './i18n.js';

function getBadgeColorClass(topic) {
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['nk-bg--c', 'nk-bg--m', 'nk-bg--y', 'nk-bg--c-lighter'];
  return colors[Math.abs(hash) % colors.length];
}

export function filterByTopic(topic) {
  state.setFilter(topic);
  document.dispatchEvent(new CustomEvent('filterChanged'));
}

export function clearFilter() {
  state.clearFilter();
  document.dispatchEvent(new CustomEvent('filterChanged'));
}

export function updateFilterDisplay() {
  const filterBar = getElement(DOM_IDS.FILTER_BAR);
  const filterDisplay = getElement(DOM_IDS.FILTER_DISPLAY);
  if (!filterBar || !filterDisplay) return;

  const currentFilter = state.getFilter();
  if (currentFilter) {
    filterBar.style.display = '';
    filterDisplay.innerHTML = `
      <span>${t('filterLabel')} <strong>${currentFilter}</strong></span>
      <button class="nk-button" onclick="window.nakApp.clearFilter()" style="margin-left: var(--medium);">${t('clearFilter')}</button>
    `;
  } else {
    filterBar.style.display = 'none';
    filterDisplay.innerHTML = '';
  }
}

export function createTopicBadges(topics) {
  const container = document.createElement('div');
  container.style.cssText = 'display: flex; flex-wrap: wrap; gap: var(--x-small); margin-top: var(--small);';
  topics.forEach(topic => {
    const badge = document.createElement('span');
    badge.className = `nk-badge ${getBadgeColorClass(topic)}`;
    badge.textContent = topic;
    badge.style.cursor = 'pointer';
    badge.onclick = (e) => {
      e.stopPropagation();
      filterByTopic(topic);
    };
    container.appendChild(badge);
  });
  return container;
}
