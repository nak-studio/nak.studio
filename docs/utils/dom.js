/**
 * DOM Utilities
 */

export function getElement(id) {
  return document.getElementById(id);
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

export function createEl(tag, text) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  return el;
}

export function createMediaElement(media) {
  if (media.mediaType === 'video') {
    const video = document.createElement('video');
    video.src = media.url;
    video.alt = media.alt || '';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    return video;
  }
  const img = document.createElement('img');
  img.src = media.url;
  img.alt = media.alt || '';
  img.loading = 'lazy';
  return img;
}
