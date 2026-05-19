const GA_ID = 'G-KZYSRVFYXH';
const STORAGE_KEY = 'cookie-consent';

function loadGA() {
  if (document.querySelector('script[data-ga]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s.setAttribute('data-ga', '1');
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

function hideBanner(banner) {
  banner.classList.add('consent-banner--hidden');
  setTimeout(() => banner.remove(), 400);
}

export function initConsent() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'accepted') { loadGA(); return; }
  if (stored === 'declined') return;

  const lang = localStorage.getItem('lang') || 'eu';
  const copy = lang === 'eu' ? {
    text: 'Webgune honek cookieak erabiltzen ditu bisitariek nola aritzen diren ulertzeko.',
    learn: 'Gehiago jakin',
    decline: 'Ukatu',
    accept: 'Onartu'
  } : {
    text: 'This site uses cookies to understand how visitors interact with the work.',
    learn: 'Learn more',
    decline: 'Decline',
    accept: 'Accept'
  };

  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.innerHTML = `
    <p class="consent-banner__text">
      ${copy.text}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">${copy.learn}</a>
    </p>
    <div class="consent-banner__actions">
      <button class="consent-banner__btn consent-banner__btn--decline">${copy.decline}</button>
      <button class="consent-banner__btn consent-banner__btn--accept">${copy.accept}</button>
    </div>
  `;

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('consent-banner--visible'));

  banner.querySelector('.consent-banner__btn--accept').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    loadGA();
    hideBanner(banner);
  });

  banner.querySelector('.consent-banner__btn--decline').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    hideBanner(banner);
  });
}
