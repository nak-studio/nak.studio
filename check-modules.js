globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {}
};

globalThis.window = {
  location: {
    pathname: '/docs/index.html'
  }
};

const modules = [
  './docs/modules/state.js',
  './docs/modules/dataService.js',
  './docs/modules/i18n.js',
  './docs/modules/artworkRenderer.js',
  './docs/modules/drawer.js',
  './docs/modules/filters.js',
  './docs/utils/dom.js'
];

async function checkModules() {
  for (const modulePath of modules) {
    await import(modulePath);
  }

  console.log('ES modules import cleanly');
}

checkModules().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
