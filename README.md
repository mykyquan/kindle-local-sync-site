# Kindle Local Sync — landing page

The marketing site for [Kindle Local Sync](https://github.com/mykyquan/kindle-local-sync), an
Obsidian plugin that reads `My Clippings.txt` off a USB-connected Kindle and writes one tidy
Markdown note per book — no account, no cloud, no telemetry.

**This repository is the website only.** The plugin itself lives in
[mykyquan/kindle-local-sync](https://github.com/mykyquan/kindle-local-sync).

## What it is

A single static page. No build step, no framework, no dependencies — three files and a folder of
images. Open `index.html` in a browser and that is the whole thing.

The page ships in English, Simplified Chinese and Traditional Chinese. All three translations are
in the HTML at once, tagged with `data-i18n`, and the language toggle in the header swaps which set
is visible by flipping the `lang` attribute on `<html>`; CSS does the hiding. That keeps the whole
site to one request and no translation files, at the cost of a slightly heavier page.

## Layout

```
index.html        the page, all three languages inline
style.css         all styles, including the data-i18n visibility rules
script.js         language toggle, mobile menu, scroll reveal
assets/           the .webp images the page actually loads
assets/_source/   original PNG/GIF exports, kept for re-encoding later
```

`assets/_source/` is not referenced by the page. It is there so the `.webp` files can be
regenerated at a different size or quality without re-taking the screenshots.

## Running it locally

Any static file server works. Opening `index.html` directly with `file://` works too, though a
server matches production more closely:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Regenerating the images

The `.webp` files were produced from `assets/_source/` with Pillow. Recreate the environment with:

```bash
python3 -m venv venv && ./venv/bin/pip install pillow
```

`venv/` is gitignored.

## Deploying

The production target is the GitHub Pages project URL:
`https://mykyquan.github.io/kindle-local-sync-site/`.

The site is designed to deploy directly from the repository root. In the repository's GitHub
Pages settings, choose **Deploy from a branch**, select `main`, and select `/(root)`. `.nojekyll`
keeps GitHub Pages from running the files through Jekyll. All local asset paths are relative so
they continue to work under the `/kindle-local-sync-site/` project subpath.

The canonical and social preview URLs in `index.html` use that project URL. If the repository is
renamed or the Pages source changes, update those absolute URLs at the same time.

**Known multilingual SEO limitation:** `hreflang` cannot be declared as things stand. The three
languages share one URL and are switched client-side, so search engines will primarily index the
English metadata. Fixing it means giving each language its own URL (`/`, `/zh-cn/`, `/zh-tw/`),
which is a restructure rather than a metadata-only change.

## License

MIT — see [LICENSE](LICENSE).
