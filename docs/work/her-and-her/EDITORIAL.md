# Reusable Dossier Microsites

Her & Her is the first site using the shared renderer at `docs/modules/dossier.js` and layout at `docs/css/dossier.css`. To start another dossier under `docs/work/<project>/`, reuse this page shell, add a project `dossier.json`, and provide matching public/private `items.json` files. Point the page's `data-dossier-config` at its config and keep the shared module and stylesheet links.

The config supplies the project identity and data paths. Set `artworksUrl` when a regular artwork gallery exists; the dossier then shows a **View artworks** link in its header. Leave it empty while the dossier is the project's first page.

```json
{
  "title": "Project name",
  "subtitle": "Project subtitle",
  "defaultItem": "introduction",
  "artworksUrl": "../project/artworks/",
  "itemsPath": "items.json",
  "draftItemsPath": "../../../private-content/project/items.json"
}
```

Drafts live in git-ignored `private-content/<project>/items.json`. The matching `docs/work/<project>/items.json` contains only content manually released to the public site.

Every item uses the same fields, whether it is a section, historical moment, photographer, artwork, or another dossier item:

```json
{
  "id": "unique-id",
  "slug": "url-safe-id",
  "type": "historical-moment",
  "order": 1,
  "hide_publish": true,
  "publishedAt": "",
  "topics": [],
  "translations": {
    "eu": {
      "title": "Izenburua",
      "heading": "Orrialdeko izenburua",
      "summary": "",
      "blocks": []
    },
    "en": {
      "title": "Title",
      "heading": "Page heading",
      "summary": "",
      "blocks": []
    }
  },
  "children": []
}
```

`children` can contain any item type, allowing arbitrary nesting such as Core → historical moment → photographer → selected photograph. Keep IDs and slugs unique within the dossier. Text blocks use `paragraph` or `heading`; image blocks use `image` with a path relative to the dossier page, plus `alt` and optional `caption`.

## Preview and Release

To review the complete private tree locally, serve the repository root on loopback and open `/docs/work/<project>/?preview=1`. The preview reads the private source only on `localhost` or `127.0.0.1` and shows items marked hidden.

To release an item manually, copy it and the descendants being released into the public `items.json` under the same parent. Set `hide_publish` to `false` on included items and add a publication date where appropriate. Copy referenced assets into the public assets folder. Do not put unreleased text or assets under `docs`; static files can be fetched even when the page hides them.

When a project has a regular artwork page, add a **Dossier** link in that page's header pointing to the dossier URL. Keep the artwork page as the Works-card destination once paintings exist; while there are no artworks, point the Works card directly to the dossier.

```html
<a class="project-dossier-link" href="../project/">Project dossier</a>
```

Drafts are git-ignored and local to this checkout, so keep a separate backup. Weekly publishing is a manual copy; no publishing script is required.
