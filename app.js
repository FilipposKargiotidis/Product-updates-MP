const RELEASE_NOTES_URL =
  "https://filipposkargiotidis.github.io/OMNI-Customer-Model-Doc/release-notes.json";
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

  const content = document.createElement("div");
  content.className = "update-content";

  const title = document.createElement("h3");
  title.textContent = update.title;

  const summary = document.createElement("p");
  summary.className = "update-summary";
  summary.textContent = update.summary;

  const details = document.createElement("div");
  details.className = "expandable update-details";
  const summaryToggle = document.createElement("button");
  summaryToggle.className = "expandable-header";
  summaryToggle.type = "button";
  summaryToggle.setAttribute(
    "aria-controls",
    `update-details-content-${update.id}`
  );
  const expandableHeadline = document.createElement("span");
  expandableHeadline.className = "expandable-headline";
  expandableHeadline.textContent = `Read more about ${update.title}`;
  summaryToggle.append(expandableHeadline);

  const detailsBody = document.createElement("div");
  detailsBody.className = "expandable-body";
  detailsBody.id = `update-details-content-${update.id}`;
  const detailsText = document.createElement("p");
  detailsText.className = "update-details-copy";
  detailsText.textContent = update.details;
  detailsBody.append(detailsText);
  details.append(summaryToggle, detailsBody);

  content.append(title, summary, details);
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

    return {
      ...update,
      details: update.details ?? "",
    };
  });
}

function renderCategoryOptions() {
  const selectedCategory = categoryFilter.value;
  const categories = [...new Set(updates.map((update) => update.category))].sort();
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

function initializeExpandables() {
  if (!list.querySelector(".expandable")) {
    return;
  }

  if (window.dg?.expandable) {
    window.dg.expandable.init();
  } else {
    console.error(
      "Swedbank Pay Design Guide expandable component is unavailable. Check that the Design Guide script loaded."
    );
  }
}

function initializePageComponents() {
  initializeExpandables();
}

function renderUpdates(refreshExpandables = false) {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const category = categoryFilter.value;
  const filteredUpdates = updates.filter((update) => {
    const matchesCategory = category === "all" || update.category === category;
    const searchableText = [
      update.title,
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
  if (refreshExpandables) {
    initializeExpandables();
  }
  updateCount.textContent = `${filteredUpdates.length} ${
    filteredUpdates.length === 1 ? "UPDATE" : "UPDATES"
  }`;
  emptyState.textContent =
    updates.length === 0
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

searchInput.addEventListener("input", () => renderUpdates(true));
categoryFilter.addEventListener("change", () => renderUpdates(true));
renderCategoryOptions();
renderUpdates();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePageComponents, {
    once: true,
  });
} else {
  initializePageComponents();
}
loadUpdates();
