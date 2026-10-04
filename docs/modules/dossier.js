import { initI18n } from './i18n.js';

const root = document.querySelector('[data-dossier]');
const index = document.getElementById('dossier-index-list');
const content = document.getElementById('dossier-item-content');
const previewNotice = document.getElementById('local-preview-notice');
const projectLinks = document.getElementById('dossier-project-links');
const isLocalPreview = new URLSearchParams(window.location.search).get('preview') === '1'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);
let config;
let items = [];
let expandedItems = new Set();
let indexInitialized = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function currentLanguage() {
  return document.documentElement.lang === 'en' ? 'en' : 'eu';
}

function translation(item) {
  return item.translations[currentLanguage()] || item.translations.eu || item.translations.en;
}

function itemTitle(item) {
  const text = translation(item);
  return text.title || text.heading || item.id;
}

function itemUrl(item) {
  const params = new URLSearchParams();
  if (isLocalPreview) params.set('preview', '1');
  params.set('item', item.slug);
  return `?${params}`;
}

function renderProjectLinks() {
  projectLinks.replaceChildren();
  const artworksUrl = config.artworksUrl;
  projectLinks.hidden = !artworksUrl;
  if (!artworksUrl) return;

  const labels = config.artworksLinkLabel || { eu: 'Obrak ikusi', en: 'View artworks' };
  const link = element('a', 'dossier-project-link', labels[currentLanguage()] || labels.en);
  link.href = artworksUrl;
  projectLinks.appendChild(link);
}

function visibleTree(source) {
  return source
    .filter(item => isLocalPreview || item.hide_publish !== true)
    .sort((a, b) => a.order - b.order)
    .map(item => ({ ...item, children: visibleTree(item.children || []) }));
}

function findItemPath(source, slug, parents = []) {
  for (const item of source) {
    const path = [...parents, item];
    if (item.slug === slug) return path;
    const found = findItemPath(item.children || [], slug, path);
    if (found) return found;
  }
  return null;
}

function renderIndexEntry(item, currentSlug) {
  const listItem = element('li');
  const row = element('div', 'dossier-index__row');
  const link = element('a', `dossier-index__item dossier-index__item--${item.type}`, itemTitle(item));
  link.href = itemUrl(item);
  if (item.slug === currentSlug) link.setAttribute('aria-current', 'page');
  row.appendChild(link);

  if (item.children.length) {
    const expanded = expandedItems.has(item.slug);
    const childList = element('ol', 'dossier-index__nested');
    childList.id = `dossier-children-${item.slug}`;
    childList.hidden = !expanded;
    item.children.forEach(child => childList.appendChild(renderIndexEntry(child, currentSlug)));

    const toggle = element('button', 'dossier-index__toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-controls', childList.id);
    const updateLabel = () => {
      const label = currentLanguage() === 'eu'
        ? `${expanded ? 'Tolestu' : 'Zabaldu'} ${itemTitle(item)} azpiatalak`
        : `${expanded ? 'Collapse' : 'Expand'} ${itemTitle(item)} items`;
      toggle.setAttribute('aria-label', label);
    };
    updateLabel();
    toggle.addEventListener('click', () => {
      const nextExpanded = toggle.getAttribute('aria-expanded') !== 'true';
      if (nextExpanded) expandedItems.add(item.slug);
      else expandedItems.delete(item.slug);
      toggle.setAttribute('aria-expanded', String(nextExpanded));
      childList.hidden = !nextExpanded;
      const label = currentLanguage() === 'eu'
        ? `${nextExpanded ? 'Tolestu' : 'Zabaldu'} ${itemTitle(item)} azpiatalak`
        : `${nextExpanded ? 'Collapse' : 'Expand'} ${itemTitle(item)} items`;
      toggle.setAttribute('aria-label', label);
    });

    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (expandedItems.has(item.slug)) expandedItems.delete(item.slug);
      else expandedItems.add(item.slug);
      window.history.pushState({}, '', link.href);
      render();
    });

    row.appendChild(toggle);
    listItem.append(row, childList);
  } else {
    listItem.appendChild(row);
  }
  return listItem;
}

function renderIndex(currentSlug) {
  index.replaceChildren();
  const activePath = findItemPath(items, currentSlug) || [];
  if (!indexInitialized) {
    expandedItems.add('core');
    activePath.filter(item => item.children.length).forEach(item => expandedItems.add(item.slug));
    indexInitialized = true;
  }
  items.forEach(item => index.appendChild(renderIndexEntry(item, currentSlug)));
}

function renderBlock(block) {
  if (block.type === 'heading') return element('h2', 'dossier-item__subheading', block.text);
  if (block.type === 'paragraph') return element('p', 'dossier-item__paragraph', block.text);

  const figure = element('figure', 'dossier-item__figure');
  const image = element('img');
  image.src = block.src;
  image.alt = block.alt || '';
  image.loading = 'lazy';
  figure.appendChild(image);
  if (block.caption) figure.appendChild(element('figcaption', '', block.caption));
  return figure;
}

function childHeading(item) {
  if (item.type === 'core') {
    return { eu: 'Une historikoak', en: 'Historical moments' }[currentLanguage()];
  }
  const headings = {
    section: { eu: 'Azpiatalak', en: 'Sections' },
    'historical-moment': { eu: 'Argazkilariak', en: 'Photographers' },
    photographer: { eu: 'Aukeratutako argazkiak', en: 'Selected photographs' }
  };
  return headings[item.type]?.[currentLanguage()] || (currentLanguage() === 'eu' ? 'Azpiatalak' : 'Contents');
}

function renderChildren(item, article) {
  if (!item.children.length) return;
  const section = element('section', 'dossier-item__children');
  section.appendChild(element('h2', '', childHeading(item)));
  const list = element('ol', 'dossier-item__child-list');
  item.children.forEach(child => {
    const row = element('li');
    const link = element('a', '', itemTitle(child));
    link.href = itemUrl(child);
    row.appendChild(link);
    const summary = translation(child).summary;
    if (summary) row.appendChild(element('p', '', summary));
    list.appendChild(row);
  });
  section.appendChild(list);
  article.appendChild(section);
}

function renderBreadcrumb(path) {
  if (path.length < 2) return null;

  const nav = element('nav', 'dossier-breadcrumb');
  nav.setAttribute('aria-label', currentLanguage() === 'eu' ? 'Orrialdearen kokapena' : 'Breadcrumb');
  const list = element('ol');
  path.forEach((item, itemIndex) => {
    const entry = element('li');
    if (itemIndex === path.length - 1) {
      const current = element('span', '', itemTitle(item));
      current.setAttribute('aria-current', 'page');
      entry.appendChild(current);
    } else {
      const link = element('a', '', itemTitle(item));
      link.href = itemUrl(item);
      entry.appendChild(link);
    }
    list.appendChild(entry);
  });
  nav.appendChild(list);
  return nav;
}

function renderSelectedItem(path) {
  const item = path[path.length - 1];
  const text = translation(item);
  const article = element('article', `dossier-item dossier-item--${item.type}`);
  const breadcrumb = renderBreadcrumb(path);
  if (breadcrumb) article.appendChild(breadcrumb);

  const imageBlock = ['introduction', 'photographer'].includes(item.type)
    ? text.blocks.find(block => block.type === 'image')
    : null;
  const photographerMasthead = item.type === 'photographer' && imageBlock;
  let photographerBodyBlocks = [];
  if (imageBlock) {
    const mastheadClass = item.type === 'introduction'
      ? 'dossier-introduction__masthead'
      : 'dossier-photographer__masthead';
    const masthead = element('header', mastheadClass);
    masthead.appendChild(renderBlock(imageBlock));
    if (photographerMasthead) {
      const profile = element('div', 'dossier-photographer__content');
      profile.appendChild(element('h1', '', text.heading || text.title));
      if (text.summary) profile.appendChild(element('p', 'dossier-photographer__dates', text.summary));
      photographerBodyBlocks = text.blocks.filter(block => block !== imageBlock);
      if (photographerBodyBlocks.length) profile.appendChild(renderBlock(photographerBodyBlocks.shift()));
      masthead.appendChild(profile);
    } else {
      masthead.appendChild(element('h1', '', text.heading || text.title));
    }
    article.appendChild(masthead);
  } else {
    article.appendChild(element('h1', '', text.heading || text.title));
  }

  if (text.summary && !photographerMasthead) {
    const summaryClass = item.type === 'historical-moment' ? 'dossier-item__period' : 'dossier-item__summary';
    article.appendChild(element('p', summaryClass, text.summary));
  }
  if (!photographerMasthead) {
    text.blocks.filter(block => block !== imageBlock).forEach(block => article.appendChild(renderBlock(block)));
  } else if (photographerBodyBlocks.length) {
    const body = element('div', 'dossier-photographer__body');
    photographerBodyBlocks.forEach(block => body.appendChild(renderBlock(block)));
    article.appendChild(body);
  }
  renderChildren(item, article);
  content.replaceChildren(article);
  document.title = `${itemTitle(item)} — ${config.title} | nak.studio`;
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const currentSlug = params.get('item') || config.defaultItem || items[0]?.slug;
  renderIndex(currentSlug);
  const path = findItemPath(items, currentSlug);
  if (path) renderSelectedItem(path);
  else content.replaceChildren(element('p', '', config.notFoundMessage || 'This item is not available.'));
}

async function initNavigation() {
  const host = document.getElementById('site-nav');
  const response = await fetch('../../partials/nav.html');
  if (!response.ok) return;
  host.innerHTML = await response.text();
  const links = [
    ['.nav-home', '../../index.html'],
    ['.nav-work', '../index.html'],
    ['.nav-collectors', '../../collectors/index.html'],
    ['.nav-agenda', '../../agenda/index.html'],
    ['.nav-about', '../../about/index.html']
  ];
  links.forEach(([selector, href]) => {
    const link = host.querySelector(selector);
    if (link) link.href = href;
  });
  host.querySelector('.nav-work')?.classList.add('active');
}

async function init() {
  try {
    if (!root) throw new Error('Missing dossier root element.');
    const configUrl = new URL(root.dataset.dossierConfig, window.location.href);
    const configResponse = await fetch(configUrl);
    if (!configResponse.ok) throw new Error(`Could not load dossier config (${configResponse.status}).`);
    config = await configResponse.json();

    document.getElementById('dossier-project-title').textContent = config.title;
    document.getElementById('dossier-project-subtitle').textContent = config.subtitle;
    document.title = `${config.title} — nak.studio`;
    previewNotice.hidden = !isLocalPreview;

    await initNavigation();
    await initI18n();
    renderProjectLinks();

    const itemsPath = isLocalPreview ? config.draftItemsPath : config.itemsPath;
    const itemsResponse = await fetch(new URL(itemsPath, configUrl), {
      cache: isLocalPreview ? 'no-store' : 'default'
    });
    if (!itemsResponse.ok) throw new Error(`Could not load dossier items (${itemsResponse.status}).`);
    const data = await itemsResponse.json();
    items = visibleTree(data.items || []);
    document.addEventListener('languageChanged', render);
    document.addEventListener('languageChanged', renderProjectLinks);
    window.addEventListener('popstate', render);
    render();
  } catch (error) {
    console.error(error);
    content.replaceChildren(element('p', '', 'Dossier content could not be loaded.'));
  }
}

init();
