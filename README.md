# Merchant Portal product updates

A lightweight, static release-notes page built with HTML, CSS, and vanilla JavaScript. It uses Swedbank Pay Design Guide 10.15.0 styling and components, with a custom editorial layout inspired by the spacious format of the Figma release-notes page.

## Preview

Open `index.html` in a browser with an internet connection to load the pinned Design Guide 10.15.0 CSS and JavaScript from its CDN. There is no build step. The `@swedbankpay/design-guide` NPM dependency is installed in this project, but the static HTML page uses the CDN entry points because it does not have a bundler.

## Add or edit release notes

Update the `updates` array near the top of `app.js`. Each entry has this shape:

```js
{
  id: "orders-overview", // Unique slug
  date: "2026-11-18", // YYYY-MM-DD
  category: "Orders",
  tags: ["ORDERS", "NEW"],
  title: "A short, customer-friendly title",
  summary: "A one- or two-sentence overview shown on the update card.",
  details: "Optional extra context shown when the reader selects Read more.",
}
```

Each update also needs a unique `id` slug, such as `orders-overview`. The page automatically builds the category filter from the categories in the array. Search checks the title, summary, details, category, and tags. The search field and category select use Design Guide form-control styles; update labels use Design Guide badges; and the read-more disclosure uses the Design Guide expandable component.

The page's editorial layout and header remain custom, while typography, colors, buttons, form controls, badges, and expandable behavior come from Design Guide 10.15.0. The expandable JavaScript is re-initialized when search or category filtering renders new update cards.
