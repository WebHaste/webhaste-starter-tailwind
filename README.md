# WebHaste Starter — Tailwind CSS

A clean starter template for building a website with the
[WebHaste](https://github.com/) browser extension. Clone this repo, open
the folder in the extension, and start editing — or fork it as the base for
your own reusable template.

You can preview this starter template online at
[CloudFlare Pages](https://wh-startersite-tailwind.pages.dev/)

This repo is content + config, not a buildable app in the usual sense — but
unlike WebHaste's plain starters, it **does** need Node/npm, because Tailwind
CSS has to be compiled ahead of time (see
["Building the CSS"](#building-the-css-tailwind) below for why). Besides
that one build step, there's still no bundler and no framework of its own:
the only other tooling is a small Node script (`.webhaste/compose.js`) that
lets you preview pages headlessly, matching exactly what the extension's
Publish / Render to Local Folder produces.

> **Read [CLAUDE.md](CLAUDE.md) first if you're using an AI coding
> assistant on this repo.** It documents the conventions below in more
> detail and is written specifically to brief an agent that hasn't seen a
> WebHaste project before.

## Quick start

1. Clone the repo, open a Command Prompt or Terminal window,
   navigate to your project folder and run `npm install` once (see
   [Building the CSS](#building-the-css-tailwind) — this is the one
   Tailwind-specific step a plain WebHaste starter wouldn't need).
2. In your browser in the WebHaste extension, open your project folder
3. Click "Site Settings" in the extension to set your URL and deployment
   settings. You also can edit `.webhaste/site.config.json` manually — 
   set `siteName`, `domain`, and
   confirm `cssFramework` (this starter ships configured for `tailwind`).
4. Replace `assets/logo.png` and `assets/logo-footer.png` with your own
   logo, and swap the favicon set in `elements/` if you want your own
   branding there too (see [Favicons](#favicons)).
5. In the WebHaste Extension, begin editing `index.html` to your own content.
   Run `npm run watch:css` in a terminal alongside the extension so any new
   Tailwind classes you type get compiled as you go.
6. Once you have several pages built, click "Edit Menus" to set up your own
   menu structure. You also can update `.webhaste/nav.json` manually.
7. Preview the site in WebHaste, or deploy locally (see below) to preview 
   directly in your browser. When ready, use the extension to Publish or Render
   to Local Folder when you're ready to ship.

## Previewing locally

Page files in this repo are HTML **fragments**, not full documents (more on
this below), so opening `index.html` directly in a browser won't look
right. Use the compose script instead — it applies the same
template/nav/CSS-framework substitution the extension itself does. It
copies `scripts/styles.css` as-is rather than compiling it, though, so run
`npm run build:css` first if you've changed any Tailwind classes (see
[Building the CSS](#building-the-css-tailwind)):

```
node .webhaste/compose.js --out .agent-preview
```

This writes fully-composed pages plus copies of `assets/`, `scripts/`, and
`elements/` into `.agent-preview/`. Serve that folder with any static file
server and open it in a browser. Use a scratch output folder like this
rather than `dist/` (the real deploy output) so you don't clobber a real
build. Run `node .webhaste/compose.js --help` for all options.

## Building the CSS (Tailwind)

Tailwind ships an official "browser build" you can load straight from a CDN
with one `<script>` tag and no build step at all
(`<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4">`). It's
tempting for a starter like this, but **it doesn't work inside WebHaste's
preview** — the extension's own Content-Security-Policy blocks any
`<script src>` that isn't bundled inside the extension itself (this applies
to *any* third-party CDN script, not just Tailwind's — see `scripts/main.js`
below for the same restriction). The script gets silently blocked, so
Tailwind's runtime class-scanner never runs and nothing gets styled — no
error, just a blank-looking preview.

So instead, this starter precompiles Tailwind into a real CSS file,
`scripts/styles.css`, and the template links to that with a normal
`<link rel="stylesheet">` — exactly like it would for any hand-written CSS.
That means:

- `scripts/styles.css` is **generated** — don't hand-edit it, your changes
  will be overwritten by the next build. Edit `tailwind-input.css` (project
  root) instead if you need to modify base colors or tailwind behavior — 
  that's the real source: `@import "tailwindcss";`, this site's brand color 
  theme (`@theme`), a couple of reusable button classes (`@layer components`),
  and any plain hand-written CSS.
- `scripts/custom.css` is where any new hand-written CSS classes should go
  instead — a plain, non-generated stylesheet that survives every Tailwind
  rebuild untouched. If used, `template.html` links it right after `styles.css`, 
  so it loads second and can override a generated utility class if you need
  it to.
- After `npm install`, in your terminal run one of:
  ```
  npm run build:css     # one-off compile
  npm run watch:css     # recompiles on every save while you work
  ```
  Reload the WebHaste preview after each build — nothing triggers it
  automatically.
- Tailwind's default content scanner skips dot-directories like
  `.webhaste/`, which is exactly where this project's templates and blocks
  live. `tailwind-input.css` explicitly lists `.webhaste/templates` and
  `.webhaste/blocks` via `@source` so classes used there still get compiled
  — if you add markup in a new dot-prefixed location, add an `@source` line
  for it too, or its classes will silently never make it into the output.
- Careful with `/* ... */` comments in `tailwind-input.css`: a literal `*/`
  inside comment *text* (e.g. describing several utility prefixes like
  `bg-*/text-*/border-*`) closes the comment early. Everything after gets
  parsed as real CSS, which can corrupt parsing badly enough that valid
  rules later in the file — like `@theme` — silently fail, surfacing as a
  confusing "Cannot apply unknown utility class" error nowhere near the
  actual mistake.

## How a WebHaste project is put together

```
├── index.html ...              ← page content (fragments — see below)
├── 404.html (don't edit)       ← default 404 page needed for Cloudflare and Netlify
├── package.json                ← Tailwind CLI + build:css/watch:css scripts
├── tailwind-input.css          ← real source for scripts/styles.css — edit this,
│                                  not the compiled file (see "Building the CSS")
├── assets/                     ← images and files referenced by pages
├── elements/                   ← favicons, template backgrounds, shims
├── scripts/
│   ├── styles.css              ← generated — compiled from tailwind-input.css,
│   │                              don't hand-edit
│   ├── custom.css              ← hand-written CSS goes here, not styles.css
│   └── scripts.js              ← site-wide custom JS
├── dist/                       ← build output — generated, don't hand-edit
└── .webhaste/
    ├── site.config.json        ← framework, paragraph mode, deploy target
    ├── nav.json                ← header/footer menu structure
    ├── pages.json              ← optional per-page <title>/meta overrides
    ├── block-library.md        ← generated list of available blocks
    ├── blocks/                 ← this site's reusable custom blocks
    ├── templates/              ← page layout(s); active one set in config
    ├── compose.js              ← generated — headless preview renderer
    └── compose-core.js         ← generated — shared substitution logic
```

### Page files are fragments, not full documents

Every `*.html` file at the project root is just the **body content** for
that page. Don't add `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags —
the active layout template supplies all of that by substituting
`{{CONTENT}}` with the page file's contents at publish/preview time.

### The template controls everything around the content

`.webhaste/site.config.json` → `activeTemplate` names which file in
`.webhaste/templates/` wraps every page. This starter includes two:

- **`template.html`** — the active one. A fuller Tailwind layout with a
  fixed navbar, a two-column footer, and a post-footer bar. Good
  reference for a marketing-style site.
- **`simple-layout.html`** — a minimal alternative (bare header/main/footer,
  no framework assumptions baked in) — a lighter starting point if you're
  building something plainer, or want to see the minimum a template needs
  to implement.

Whichever template is active, it defines where these placeholders go:

| Placeholder            | Filled with                                   |
| ----------------------- | ---------------------------------------------- |
| `{{CONTENT}}`           | The current page's fragment                    |
| `{{TITLE}}`              | From `pages.json`, or a default built from the filename + site name |
| `{{META_DESCRIPTION}}`  | From `pages.json`, or blank                    |
| `{{NAV:header}}` / `{{NAV:footer}}` | Rendered menu markup from `nav.json`, per the framework in use |
| `{{SITE_NAME}}`         | From `site.config.json`                        |
| `{{YEAR}}`              | Current year                                   |
| `{{LANG}}`              | Used in the page language declaration          |

There's no placeholder for CSS framework assets — WebHaste doesn't inject
or manage those. `template.html`'s `<link href="/scripts/styles.css">` is
literal markup, same as any other tag in the `<head>` (see
[Building the CSS](#building-the-css-tailwind) for what that file actually
contains).

To build your own template variant, copy one of the existing files in
`.webhaste/templates/`, adjust markup, and point `activeTemplate` at it.

### `site.config.json` drives what markup is "correct"

- **`cssFramework`** — `bootstrap5`, `tailwind`, or `none`. This starter is
  set to `tailwind`; class names throughout the template, blocks, and pages
  assume that, and it's what the `nav.json` menu renderer uses to pick
  markup (plain `<ul>`, Bootstrap's `navbar-nav`, or Tailwind's hover
  dropdown). If you change this, existing markup needs to be updated to
  match — classes for the wrong framework are dead weight (or actively
  broken) in published output. This setting alone doesn't load Tailwind's
  CSS, though — see [Building the CSS](#building-the-css-tailwind).
- **`paragraphMode`** — `p` or `div`. Matches how the visual editor's Enter
  key behaves; keep hand-written content consistent with it.
- **`activeTemplate`** — see above.
- **`deploymentTarget`** / **`deployDirectory`** — where "Publish" sends
  the site (this starter uses local / `dist`).

### Making a page reachable

Dropping a new `*.html` file at the project root is not enough by itself —
nothing links to it yet. Two more files, both in `.webhaste/`:

- **`nav.json`** — add an entry to the `header` and/or `footer` menu.
  Supports nested `children` for dropdowns:
  ```json
  { "label": "New Page", "href": "/some-page.html" }
  ```
- **`pages.json`** *(optional)* — per-page `<title>`/meta description
  override, keyed by filename. Worth setting for anything meant to be
  found via search or shared as a link; minor pages can skip it and fall
  back to the default title.

### Blocks — reusable content sections

Blocks are HTML snippets (heroes, CTAs, pricing tables, etc.) insertable
from the editor's 🧩 Blocks dialog. This starter ships several
site-specific ones in `.webhaste/blocks/`:

- `header-hero.html`, `about.html`, `cta.html`, `pricing-block.html`,
  `contact-us.html`, `articles.html`

Anything dropped into `.webhaste/blocks/<name>.html` shows up
automatically as an insertable tile labeled from the filename — use this
for any section likely to be reused across pages, instead of duplicating
markup by hand across pages.

The extension also ships built-in blocks (Hero, CTA, Testimonial,
Container, Contact, 3-Column Features, Table, Video/Misc Embed) already
adapted to this site's `cssFramework`. **See
[`.webhaste/block-library.md`](.webhaste/block-library.md)** for the
full current list with real markup — it's regenerated every time the
project is opened in the editor, so check it rather than this README for
the up-to-date inventory.

### Template Elements and Favicons

`elements/` is intended to hold template pieces you don't want WebHaste
to make available to admin users (i.e. favicons, backgrounds, shims, etc.)

`elements/` can hold a full favicon/touch-icon set (Apple, Android, MS tile
icons) plus `manifest.json` and `browserconfig.xml`, already wired up from
`.webhaste/templates/template.html` in this case. Regenerate this set 
for your own brand and drop the files in with the same names, or edit the 
template's `<link>` tags if you change the set's naming/sizes.

The starter template uses the format from the 
[Favicon Generator](https://www.favicon-generator.org/), but any will work. 
WebHaste doesn't deploy a favicon.ico at the site root, so you will need 
to specify favicon links in your template.

## Do not hand-edit

These are regenerated and any manual changes will be overwritten:

- **`dist/`** (or whatever `deployDirectory` points at) — build output from
  "Render to Local Folder."
- **`scripts/styles.css`** — compiled from `tailwind-input.css` by
  `npm run build:css`/`watch:css`. Edit `tailwind-input.css` instead (see
  [Building the CSS](#building-the-css-tailwind)).
- **`.webhaste/compose.js`**, **`.webhaste/compose-core.js`**,
  **`.webhaste/block-library.md`** — regenerated every time the project
  folder is opened in the editor.

Everything else — `CLAUDE.md`, `tailwind-input.css`, `scripts/custom.css`,
`package.json`, `.webhaste/templates/`, `.webhaste/site.config.json`,
`.webhaste/nav.json`, `.webhaste/pages.json` — is copied in once (or
hand-authored) and safe to edit freely. JSON config files aren't validated
on load, so double-check they stay valid; a broken file falls back to
defaults silently.

## License

MIT — see [LICENSE](LICENSE).
