/**
 * Regenerates the profile README links section from shared dir/links.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINKS_JSON_URL =
  "https://raw.githubusercontent.com/filcuk/shared/main/dir/links.json";

const START = "<!-- links:start -->";
const END = "<!-- links:end -->";

const TYPE_BADGE = {
  "static-web-app": { label: "app", color: "blue" },
  cli: { label: "CLI", color: "teal" },
  tui: { label: "TUI", color: "teal" },
  repository: { label: "repo", color: "green" },
  package: { label: "npm", color: "red" },
  extension: { label: "addon", color: "purple" },
  profile: { label: "profile", color: "lightgrey" },
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = join(root, "README.md");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

/** Resolve icon against item url; absolute URIs pass through. */
function resolveAsset(asset, baseUrl) {
  if (!asset) return null;
  try {
    const base =
      baseUrl.endsWith("/") || baseUrl.includes("?") || baseUrl.includes("#")
        ? baseUrl
        : `${baseUrl}/`;
    return new URL(asset, base).href;
  } catch {
    return asset;
  }
}

function renderIcon(item) {
  const title = item.subtitle || item.label;
  const light = resolveAsset(item.icon, item.url);
  if (!light) return "";

  const dark = item.iconDark ? resolveAsset(item.iconDark, item.url) : null;
  const alt = escapeAttr(item.label);
  const titleAttr = escapeAttr(title);
  const href = escapeAttr(item.url);

  if (dark) {
    return (
      `<a href="${href}" title="${titleAttr}">` +
      `<picture>` +
      `<source media="(prefers-color-scheme: dark)" srcset="${escapeAttr(dark)}">` +
      `<img src="${escapeAttr(light)}" alt="${alt}" width="20" height="20" align="absmiddle">` +
      `</picture>` +
      `</a>`
    );
  }

  return (
    `<a href="${href}" title="${titleAttr}">` +
    `<img src="${escapeAttr(light)}" alt="${alt}" width="20" height="20" align="absmiddle">` +
    `</a>`
  );
}

function renderBadge(type) {
  const meta = TYPE_BADGE[type] || { label: type, color: "lightgrey" };
  const label = encodeURIComponent(meta.label);
  const src = `https://img.shields.io/badge/${label}-${meta.color}`;
  return `<img src="${src}" alt="${escapeAttr(meta.label)}" align="absmiddle">`;
}

function renderRepoLink(item) {
  if (!item.repo) return "";
  const href = escapeAttr(item.repo);
  return (
    `<a href="${href}" title="Repository">` +
    `<picture>` +
    `<source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/github/f0f6fc">` +
    `<img src="https://cdn.simpleicons.org/github/181717" alt="GitHub" width="16" height="16" align="absmiddle">` +
    `</picture>` +
    `</a>`
  );
}

function renderLanguages(item) {
  const langs = Array.isArray(item.languages) ? item.languages : [];
  if (!langs.length) return "";

  return langs
    .map((slug) => {
      const id = String(slug).trim();
      if (!id) return "";
      const src = `https://cdn.simpleicons.org/${encodeURIComponent(id)}`;
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(id)}" title="${escapeAttr(id)}" width="16" height="16" align="absmiddle">`;
    })
    .filter(Boolean)
    .join(" ");
}

function renderRowContent(item) {
  const title = item.subtitle || item.label;
  const href = escapeAttr(item.url);
  const titleAttr = escapeAttr(title);
  const label = escapeHtml(item.label);
  const icon = renderIcon(item);
  const badge = renderBadge(item.type);
  const repo = renderRepoLink(item);
  const languages = renderLanguages(item);

  const parts = [];
  parts.push(`<a href="${href}" title="${titleAttr}">${badge}</a>`);
  if (icon) parts.push(icon);
  parts.push(`<a href="${href}" title="${titleAttr}"><strong>${label}</strong></a>`);
  if (repo) parts.push("·", repo);
  if (languages) parts.push("·", languages);
  if (item.subtitle) parts.push("·", escapeHtml(item.subtitle));
  return parts.join(" ");
}

function renderItem(item) {
  const row = renderRowContent(item);
  const description = typeof item.description === "string" ? item.description.trim() : "";

  // Every item is a <details> so rows align; placeholder until descriptions are filled in.
  if (!description) {
    return `<details>\n<summary>${row}</summary>\n\n🤔 nothing here yet...\n\n</details>`;
  }

  return `<details>\n<summary>${row}</summary>\n\n${description}\n\n</details>`;
}

function visibleTopics(catalog) {
  const out = [];
  for (const topic of catalog) {
    if (topic.hidden) continue;
    if (topic.topic === "Meta") continue;
    const items = (topic.items || []).filter(
      (item) => !item.hidden && item.type !== "profile",
    );
    if (!items.length) continue;
    out.push({ name: topic.topic, items });
  }
  return out;
}

function renderSection(topics) {
  const blocks = topics.map((topic) => {
    const rows = topic.items.map(renderItem).join("\n");
    return `### ${topic.name}\n\n${rows}`;
  });
  return `${blocks.join("\n\n")}\n`;
}

function replaceMarkedSection(readme, body) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md must contain ${START} and ${END} markers`);
  }
  const before = readme.slice(0, start + START.length);
  const after = readme.slice(end);
  return `${before}\n${body}${after}`;
}

const response = await fetch(LINKS_JSON_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch ${LINKS_JSON_URL}: ${response.status} ${response.statusText}`);
}
const catalog = await response.json();
const section = renderSection(visibleTopics(catalog));
const readme = readFileSync(readmePath, "utf8");
const next = replaceMarkedSection(readme, section);
writeFileSync(readmePath, next);
console.log(`Updated README.md links section from ${LINKS_JSON_URL}`);
