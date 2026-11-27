const RELEASE_NOTES_URL =
  "https://filipposkargiotidis.github.io/OMNI-Customer-Model-Doc/release-notes.json";
const showLayoutPreview = new URLSearchParams(window.location.search).has(
  "layout-preview"
);
const layoutPreviewUpdate = {
  id: "layout-preview-example",
  date: "2026-11-27",
  category: "Preview",
  tags: ["NEW"],
  title: "A clearer view of your payment activity",
  subtitle: "Understand what happened at a glance",
  summary:
    "The redesigned payment activity view brings important transaction details together, making it easier to follow a payment from start to finish.",
  details:
    "This is a local design preview only. It is not part of the published release-notes feed.",
  media: {
    type: "image",
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
        <rect width="1200" height="640" fill="#f3f5f5"/>
        <rect x="76" y="58" width="1048" height="524" rx="18" fill="#fff" stroke="#d7dddd" stroke-width="2"/>
        <rect x="76" y="58" width="1048" height="72" rx="18" fill="#f9faf9"/>
        <path d="M76 112h1048" stroke="#d7dddd" stroke-width="2"/>
        <circle cx="119" cy="94" r="10" fill="#f06400"/>
        <rect x="151" y="84" width="170" height="20" rx="10" fill="#dfe4e3"/>
        <rect x="112" y="169" width="280" height="26" rx="8" fill="#303a3a"/>
        <rect x="112" y="212" width="460" height="14" rx="7" fill="#e4e9e8"/>
        <rect x="112" y="250" width="976" height="1" fill="#e4e9e8"/>
        <rect x="112" y="280" width="220" height="16" rx="8" fill="#aab4b3"/>
        <rect x="708" y="273" width="120" height="30" rx="15" fill="#e2f4eb"/>
        <rect x="859" y="280" width="170" height="16" rx="8" fill="#aab4b3"/>
        <rect x="112" y="331" width="976" height="1" fill="#e4e9e8"/>
        <rect x="112" y="361" width="250" height="16" rx="8" fill="#aab4b3"/>
        <rect x="708" y="354" width="120" height="30" rx="15" fill="#fff0e5"/>
        <rect x="859" y="361" width="170" height="16" rx="8" fill="#aab4b3"/>
        <rect x="112" y="412" width="976" height="1" fill="#e4e9e8"/>
        <rect x="112" y="442" width="200" height="16" rx="8" fill="#aab4b3"/>
        <rect x="708" y="435" width="120" height="30" rx="15" fill="#e2f4eb"/>
        <rect x="859" y="442" width="170" height="16" rx="8" fill="#aab4b3"/>
      </svg>
    `)}`,
    alt: "Mock preview of a payment activity list in Merchant Portal",
  },
};
let updates = [];

const list = document.querySelector("#updates-list");
const searchInput = document.querySelector("#search");
const categoryFilter = document.querySelector("#category-filter");
const updateCount = document.querySelector("#update-count");
const emptyState = document.querySelector("#empty-state");

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

function renderUpdate(update) {
  const article = document.createElement("article");
  article.className = "update";

  const meta = document.createElement("div");
  meta.className = "update-meta";

  const date = document.createElement("time");
  date.className = "update-date";
  date.dateTime = update.date;
  date.textContent = dateFormatter.format(new Date(`${update.date}T12:00:00`)).toUpperCase();
  meta.append(date);

  const tags = document.createElement("div");
  tags.className = "tags";
  tags.setAttribute("aria-label", "Update tags");
  for (const tagText of update.tags) {
    if (tagText.toLocaleLowerCase() === update.category.toLocaleLowerCase()) {
      continue;
    }

    const tag = document.createElement("span");
    tag.className = "badge badge-yellow-light";
    tag.textContent = tagText;
    tags.append(tag);
  }

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge badge-gray-light";
  categoryBadge.textContent = update.category;
  tags.prepend(categoryBadge);
  meta.append(tags);

  const title = document.createElement("h3");
  title.className = "update-title";
  title.textContent = update.title;
  meta.append(title);

  const content = document.createElement("div");
  content.className = "update-content";

  if (update.media) {
    const media = document.createElement("div");
    media.className = "update-media";

    if (update.media.type === "image") {
      const image = document.createElement("img");
      image.src = update.media.url;
      image.alt = update.media.alt;
      image.loading = "lazy";
      media.append(image);
    } else {
      const video = document.createElement("video");
      video.src = update.media.url;
      video.controls = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", update.media.alt || update.title);
      media.append(video);
    }
    content.append(media);
  }

  if (update.subtitle) {
    const subtitle = document.createElement("h4");
    subtitle.className = "update-subtitle";
    subtitle.textContent = update.subtitle;
    content.append(subtitle);
  }

  const summary = document.createElement("p");
  summary.className = "update-summary";
  summary.textContent = update.summary;
  content.append(summary);

  if (update.details) {
    const details = document.createElement("p");
    details.className = "update-details-copy";
    details.textContent = update.details;
    content.append(details);
  }

  article.append(meta, content);
  return article;
}

function validateUpdates(data) {
  if (!Array.isArray(data)) {
    throw new Error("The release-notes feed must contain a JSON array.");
  }

  const ids = new Set();
  return data.map((update, index) => {
    if (!update || typeof update !== "object" || Array.isArray(update)) {
      throw new Error(`Release note ${index + 1} must be an object.`);
    }

    const requiredTextFields = ["id", "date", "category", "title", "summary"];
    for (const field of requiredTextFields) {
      if (typeof update[field] !== "string" || !update[field].trim()) {
        throw new Error(`Release note ${index + 1} is missing "${field}".`);
      }
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(update.id)) {
      throw new Error(`Release note ${index + 1} has an invalid id.`);
    }
    if (ids.has(update.id)) {
      throw new Error(`The release-notes feed has a duplicate id "${update.id}".`);
    }
    ids.add(update.id);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(update.date) ||
      new Date(`${update.date}T12:00:00Z`).toISOString().slice(0, 10) !==
        update.date
    ) {
      throw new Error(`Release note "${update.id}" has an invalid date.`);
    }

    if (
      !Array.isArray(update.tags) ||
      update.tags.some((tag) => typeof tag !== "string")
    ) {
      throw new Error(`Release note "${update.id}" must have a string tags array.`);
    }
    if (update.details !== undefined && typeof update.details !== "string") {
      throw new Error(`Release note "${update.id}" has invalid details.`);
    }
    if (
      update.subtitle !== undefined &&
      (typeof update.subtitle !== "string" || !update.subtitle.trim())
    ) {
      throw new Error(`Release note "${update.id}" has an invalid subtitle.`);
    }
    if (update.media !== undefined) {
      if (!update.media || typeof update.media !== "object") {
        throw new Error(`Release note "${update.id}" has invalid media.`);
      }
      if (!["image", "video"].includes(update.media.type)) {
        throw new Error(`Release note "${update.id}" has an unsupported media type.`);
      }
      if (typeof update.media.url !== "string" || !update.media.url.trim()) {
        throw new Error(`Release note "${update.id}" has an invalid media URL.`);
      }
      let mediaUrl;
      try {
        mediaUrl = new URL(update.media.url);
      } catch {
        throw new Error(`Release note "${update.id}" has an invalid media URL.`);
      }
      if (!["http:", "https:"].includes(mediaUrl.protocol)) {
        throw new Error(`Release note "${update.id}" media URL must use HTTP or HTTPS.`);
      }
      if (update.media.alt !== undefined && typeof update.media.alt !== "string") {
        throw new Error(`Release note "${update.id}" has invalid media alt text.`);
      }
      if (update.media.type === "image" && !update.media.alt?.trim()) {
        throw new Error(`Release note "${update.id}" image must have alt text.`);
      }
    }

    return {
      ...update,
      details: update.details ?? "",
    };
  });
}

function renderCategoryOptions() {
  const selectedCategory = categoryFilter.value;
  const displayUpdates = showLayoutPreview
    ? [...updates, layoutPreviewUpdate]
    : updates;
  const categories = [...new Set(displayUpdates.map((update) => update.category))].sort();
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All updates";

  const options = categories.map((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    return option;
  });
  categoryFilter.replaceChildren(allOption, ...options);
  categoryFilter.value = categories.includes(selectedCategory)
    ? selectedCategory
    : "all";
}

function renderUpdates() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const category = categoryFilter.value;
  const displayUpdates = showLayoutPreview
    ? [...updates, layoutPreviewUpdate]
    : updates;
  const filteredUpdates = displayUpdates.filter((update) => {
    const matchesCategory = category === "all" || update.category === category;
    const searchableText = [
      update.title,
      update.subtitle ?? "",
      update.summary,
      update.details,
      update.category,
      ...update.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory && searchableText.includes(query);
  });

  list.replaceChildren(...filteredUpdates.map(renderUpdate));
  updateCount.textContent = `${filteredUpdates.length} ${
    filteredUpdates.length === 1 ? "UPDATE" : "UPDATES"
  }`;
  emptyState.textContent =
    displayUpdates.length === 0
      ? "No product updates have been published yet."
      : "No updates match your search. Try another term or category.";
  emptyState.hidden = filteredUpdates.length > 0;
}

async function loadUpdates() {
  emptyState.textContent = "Loading product updates…";
  emptyState.hidden = false;

  try {
    const feedUrl = new URL(RELEASE_NOTES_URL);
    feedUrl.searchParams.set("v", Date.now().toString());
    const response = await fetch(feedUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Release-notes feed request failed (${response.status}).`);
    }

    updates = validateUpdates(await response.json());
    renderCategoryOptions();
    renderUpdates(true);
  } catch (error) {
    console.error("Unable to load product updates.", error);
    updateCount.textContent = "UPDATES UNAVAILABLE";
    emptyState.textContent =
      "Product updates couldn’t be loaded right now. Please try again later.";
    emptyState.hidden = false;
  }
}

searchInput.addEventListener("input", renderUpdates);
categoryFilter.addEventListener("change", renderUpdates);
renderCategoryOptions();
renderUpdates();
loadUpdates();
