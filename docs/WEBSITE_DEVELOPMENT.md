# Website development

This document covers development and release maintenance for the public Kindle Local Sync landing
page. The Obsidian plugin is a separate project maintained in
[`mykyquan/kindle-local-sync`](https://github.com/mykyquan/kindle-local-sync).

## 1. Architecture and technology stack

The website is a static, no-build project composed of HTML, CSS, JavaScript, and optimized media.
It intentionally has no framework, package manager, runtime dependency, analytics service, or
tracking script.

- `index.html` contains the document structure, production metadata, and all three languages.
- `style.css` contains the dark visual theme, responsive layouts, focus states, reduced-motion
  rules, scroll-reveal states, and language visibility rules.
- `script.js` controls language switching, the mobile navigation, demo video playback, and scroll
  reveal behavior.
- GitHub Pages serves these files directly; there is no compilation or generated output directory.

Local assets use relative paths so the page works at the GitHub Pages project subpath
`/kindle-local-sync-site/`.

## 2. Project directory structure

```text
.
├── .nojekyll                 disables Jekyll processing on GitHub Pages
├── README.md                 short public project introduction
├── index.html                page content, metadata, and translations
├── script.js                 language, navigation, video, and reveal behavior
├── style.css                 theme and responsive presentation
├── assets/
│   ├── hero-demo.webm        VP9 hero demo
│   ├── hero-demo.mp4         H.264 hero demo fallback
│   ├── hero-demo-poster.webp static demo poster
│   ├── shot-*.webp           localized product screenshots
│   └── _source/              original legacy image and GIF exports
└── docs/
    └── WEBSITE_DEVELOPMENT.md
```

The high-quality MOV used to encode the HD demo is deliberately retained outside the repository
and production asset directory.

## 3. Local development

The files can be opened directly, but a local HTTP server better represents GitHub Pages behavior:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>. No dependency installation or build step is required.

When testing project-subpath behavior, remember that production is hosted at
`https://mykyquan.github.io/kindle-local-sync-site/`, not at the domain root. Keep local asset and
stylesheet references relative unless a production metadata field specifically requires an
absolute URL.

## 4. Language implementation

The page supports:

- English (`en`)
- Simplified Chinese (`zh-CN`)
- Traditional Chinese (`zh-TW`)

Translations are stored inline in `index.html` using `data-i18n="en"`, `data-i18n="zh-CN"`, and
`data-i18n="zh-TW"`. The language button in `script.js` cycles through the three language codes,
updates the root `<html lang>` attribute, and updates its own accessible name. CSS selectors based
on `:root:lang(...)` display only the matching content.

The demo video's accessible label is stored in localized `data-label-*` attributes and is updated
by the same language control. Any new visible or assistive text must be supplied in all three
languages, and longer Chinese strings must be checked at desktop and narrow mobile widths.

All languages currently share one URL. Search engines therefore primarily receive the English
document metadata. Proper `hreflang` support would require stable language-specific URLs rather
than metadata tags pointing multiple languages at the same page.

## 5. HD demo asset generation and optimization

The published hero demo consists of:

- `assets/hero-demo.webm`: VP9 Profile 0, 1920×962, 30 fps, no audio.
- `assets/hero-demo.mp4`: H.264 High, `yuv420p`, 1920×962, 30 fps, no audio, with the MP4 metadata
  moved to the start for progressive playback.
- `assets/hero-demo-poster.webp`: a compressed 1920×962 representative frame.

These files were encoded from a sharp 3812×1910 MOV master, not from the legacy 732×366 GIF in
`assets/_source/`. Re-encoding or enlarging the legacy GIF cannot restore missing UI detail.

When replacing the demo:

1. Capture a privacy-safe source at its native resolution and at least 30 fps. Verify that important
   interface text and cursor actions are readable.
2. Keep the master recording outside `assets/` and Git history.
3. Preserve the native aspect ratio. Do not crop meaningful interface content, upscale, or add
   interpolated frames.
4. Export WebM/VP9 and MP4/H.264 versions. Use a browser-compatible pixel format such as
   `yuv420p`, remove unnecessary audio, and enable MP4 fast start.
5. Generate a WebP poster at the same aspect ratio and keep the video's HTML `width` and `height`
   synchronized with the published dimensions.
6. Compare representative output frames with the master. Readable UI text takes precedence over an
   arbitrary file-size target.
7. Validate both outputs with `ffprobe` or an equivalent media inspection tool before publishing.

The current files are approximately 1.0 MB for WebM, 1.1 MB for MP4, and 41 KB for the poster.
Only the first video format supported by the browser should be downloaded for playback.

The older `assets/hero-demo.webp` and source GIF may remain useful for historical comparison, but
the production page uses the HTML5 video sources and poster listed above.

## 6. Video accessibility and motion behavior

The `<video>` element is muted, inline, and uses `preload="metadata"`. WebM is listed first and MP4
provides the compatibility fallback. Intrinsic dimensions and the poster reserve the media area to
avoid a significant layout shift.

JavaScript starts playback only when `prefers-reduced-motion` does not request reduced motion. With
reduced motion enabled, the poster remains still until the visitor explicitly selects Play.

The custom button is keyboard operable and reflects the media element's actual state:

- **Pause demo** while the video is playing.
- **Play demo** when playback is paused or autoplay is rejected.
- **Replay demo** after the video reaches the end.

The script listens for `play`, `pause`, `ended`, and `error` events rather than assuming that a
`play()` request succeeded. A playback failure leaves the poster available, and a media error
disables the nonfunctional control. If the motion preference changes to reduced motion during
playback, the video pauses. The demo does not loop automatically.

Do not add an HTML `autoplay` attribute: JavaScript must check the motion preference before starting
the video. Preserve the localized accessible label and all three localized control labels whenever
the component changes.

## 7. GitHub Pages deployment

Production uses GitHub Pages with the following repository configuration:

- Source: **Deploy from a branch**
- Branch: `main`
- Folder: `/(root)`
- URL: <https://mykyquan.github.io/kindle-local-sync-site/>

`.nojekyll` prevents GitHub Pages from applying Jekyll processing. Merging or pushing a commit to
the configured publishing branch makes that revision eligible for deployment; deployment status
must still be confirmed in GitHub after the change lands.

`index.html` contains absolute canonical, Open Graph, and Twitter/X URLs for the production project
URL. If the repository name or Pages configuration changes, update those URLs together. Do not add
a custom domain unless the project owner has selected and configured one.

## 8. Production maintenance workflow

1. Confirm the current branch and inspect `git status` before editing.
2. Preserve unrelated and uncommitted work.
3. Verify product claims, version numbers, installation instructions, and release links against the
   plugin repository before changing them.
4. Keep the static architecture and avoid dependencies unless there is a demonstrated requirement.
5. Update English, Simplified Chinese, and Traditional Chinese content together.
6. Run syntax and whitespace checks, then serve the site locally.
7. Test representative desktop, tablet, narrow mobile, keyboard, and reduced-motion scenarios.
8. Review the complete diff and working-tree status before requesting review.
9. After an authorized deployment, load the production URL and repeat a short smoke test.

Useful checks before opening a pull request:

```bash
node --check script.js
git diff --check
python3 -m http.server 8000
```

Do not update releases, push, merge, deploy, or change GitHub Pages settings as an incidental part
of website maintenance.

## 9. Release verification checklist

- [ ] English, Simplified Chinese, and Traditional Chinese switch correctly.
- [ ] `<html lang>` and localized demo accessibility text match the selected language.
- [ ] Desktop navigation and all internal anchors work.
- [ ] The mobile menu manages focus, locks background scrolling, closes with Escape, and restores
      focus to its toggle.
- [ ] The official installation, plugin repository, release, issues, and architecture links resolve.
- [ ] The hero video preserves its aspect ratio and loads a supported source without layout shift.
- [ ] Pause, Play, end-state Replay, autoplay rejection, and playback failure states are sensible.
- [ ] Reduced-motion mode does not autoplay; explicit playback remains available.
- [ ] All referenced local images, video files, stylesheets, and scripts exist.
- [ ] No horizontal page overflow occurs at representative desktop, tablet, 390 px, 375 px, and
      320 px widths.
- [ ] Images scale without distortion and lazy-loaded screenshots appear when scrolled into view.
- [ ] Keyboard focus remains visible on links, buttons, and menu controls.
- [ ] The browser console contains no critical JavaScript or resource errors.
- [ ] Relative asset paths work under the `/kindle-local-sync-site/` project subpath.
- [ ] Canonical, Open Graph, Twitter/X, title, and description metadata remain accurate.
- [ ] The page still works as static files with no build step.
- [ ] After deployment, the production URL loads and the core installation journey is smoke-tested.

Only claim browser or device compatibility that was actually tested. Media metadata inspection is
not a substitute for playback testing in a specific browser.

## 10. Known limitations and deferred improvements

- All translations share one URL, so language-specific `hreflang` metadata is not currently valid.
  Fixing this requires separate language URLs and is an architectural decision.
- Browser playback should be spot-checked in Safari and Firefox before making broad compatibility
  claims. Automated Chrome verification alone does not prove support in those browsers.
- The current social preview uses the English product screenshot rather than a purpose-built social
  card. A dedicated preview image is optional future polish.
- The repository has no automated end-to-end test suite. Current release checks combine static
  validation with focused browser smoke tests; avoid introducing a complex test stack without a
  demonstrated maintenance benefit.
- External Google Fonts are render-blocking network resources. Replacing or self-hosting them would
  require a deliberate performance and licensing review.
- Video playback depends on browser media support and autoplay policy. The poster and explicit Play
  control provide the intended fallback.
