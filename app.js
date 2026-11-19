// Replace these examples with your real Merchant Portal release notes.
const updates = [
  {
    id: "orders-overview",
    date: "2026-11-18",
    category: "Orders",
    tags: ["ORDERS", "NEW"],
    title: "A clearer view of your orders",
    summary:
      "Find the details you need faster with a refreshed orders experience, designed to make everyday work feel a little simpler.",
    details:
      "This sample entry is here to show how a longer explanation can live behind a read-more control. Replace it with the customer-facing details for your release.",
  },
  {
    id: "payment-activity",
    date: "2026-11-04",
    category: "Payments",
    tags: ["PAYMENTS", "IMPROVEMENT"],
    title: "More context in payment activity",
    summary:
      "Payment activity now brings useful transaction information together, so you can understand what happened without extra steps.",
    details:
      "Add any supporting information here, such as which users this change affects, where to find it, or what action they need to take.",
  },
  {
    id: "account-overview",
    date: "2026-10-21",
    category: "Account",
    tags: ["ACCOUNT", "UPDATE"],
    title: "A more helpful account overview",
    summary:
      "We’ve made the account overview easier to scan, with important information organized where you expect to find it.",
    details:
      "This is placeholder content. Once you provide the real update title and description, we can refine this card and its category together.",
  },
];

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
  emptyState.hidden = filteredUpdates.length > 0;
}

const categories = [...new Set(updates.map((update) => update.category))].sort();
for (const category of categories) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categoryFilter.append(option);
}

searchInput.addEventListener("input", () => renderUpdates(true));
categoryFilter.addEventListener("change", () => renderUpdates(true));
renderUpdates();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePageComponents, {
    once: true,
  });
} else {
  initializePageComponents();
}
