# Merchant Portal product updates

A lightweight, static release-notes page built with HTML, CSS, and vanilla JavaScript. It uses Swedbank Pay Design Guide 10.15.0 styling and components, with a custom editorial layout inspired by the spacious format of the Figma release-notes page.

## Preview

Open `index.html` in a browser with an internet connection to load the pinned Design Guide 10.15.0 CSS and JavaScript from its CDN. There is no build step. The `@swedbankpay/design-guide` NPM dependency is installed in this project, but the static HTML page uses the CDN entry points because it does not have a bundler.

## Publish release notes

Release notes are read from the published JSON feed in the
[OMNI Customer Model Doc repository](https://github.com/FilipposKargiotidis/OMNI-Customer-Model-Doc/blob/main/release-notes.json).
Add or edit entries in that repository's `release-notes.json`, then merge the
change to `main`. Its existing GitHub Pages workflow deploys on each push to
`main`. After that deployment succeeds, this page reads the updated feed on
the next visit or refresh; no release-note copy needs to be committed here.

Each feed entry has this shape:

```json
{
  "id": "orders-overview",
  "date": "2026-11-18",
  "category": "Orders",
  "tags": ["NEW"],
  "title": "A short, customer-friendly title",
  "subtitle": "An optional smaller heading",
  "summary": "A one- or two-sentence overview shown on the update card.",
  "details": "Optional extra context shown inline below the summary.",
  "media": {
    "type": "image",
    "url": "https://example.com/orders-overview.png",
    "alt": "Preview of the orders overview"
  }
}
```

The feed is a JSON array. Each entry requires a unique lowercase-hyphenated `id`, a `date` in `YYYY-MM-DD` format, `category`, `title`, `summary`, and a `tags` array of strings. `subtitle`, `details`, and `media` are optional. When present, `media.type` can be `image` or `video`, `media.url` must use HTTP or HTTPS, and images require descriptive `media.alt` text. Video files are rendered with browser controls.

The page automatically builds the category filter from the categories in the feed. Search checks the title, subtitle, summary, details, category, and tags. Update cards show the date, tags, and title in the left column; optional media, subtitle, summary, and details appear in the right column.

To preview the revised card layout and a mock image without changing the release-notes feed, open the local page with `?layout-preview` at the end of its URL (for example, `index.html?layout-preview`). The preview note is added only in that mode.

The page's editorial layout and header remain custom, while typography, colors, buttons, form controls, and badges use Design Guide 10.15.0.
