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
  "summary": "A one- or two-sentence overview shown on the update card.",
  "details": "Optional extra context shown when the reader selects Read more."
}
```

The feed is a JSON array. Each entry requires a unique lowercase-hyphenated `id`, a `date` in `YYYY-MM-DD` format, `category`, `title`, `summary`, and a `tags` array of strings. `details` is optional. The page validates the feed before rendering it and displays an error if the feed cannot be fetched or is malformed.

The page automatically builds the category filter from the categories in the feed. Search checks the title, summary, details, category, and tags. The search field and category select use Design Guide form-control styles; update labels use Design Guide badges; and the read-more disclosure uses the Design Guide expandable component.

The page's editorial layout and header remain custom, while typography, colors, buttons, form controls, badges, and expandable behavior come from Design Guide 10.15.0. The expandable JavaScript is re-initialized when search or category filtering renders new update cards.
