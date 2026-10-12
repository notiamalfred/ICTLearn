/* build-search-index.js — run with: node build-search-index.js */
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const PAGES = [
  { file: "index.html",                label: "Home" },
  { file: "information-systems.html",  label: "Information Systems" },
  { file: "data-control.html",         label: "Data Control" },
  { file: "number-systems.html",       label: "Number Systems" },
  { file: "barcodes-qr.html",          label: "Barcodes & QR Codes" },
  { file: "digitalisation.html",       label: "Digitalisation" },
  { file: "multimedia.html",           label: "Multimedia & Compression" },
  { file: "glossary.html",             label: "Glossary" }
];

const index = [];

for (const page of PAGES) {
  const filePath = path.join(__dirname, page.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip (missing): ${page.file}`);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  $("script, style, noscript, template, .site-header, .site-footer").remove();

  const seen = new Set();

  $("h1, h2, h3, h4, h5, h6, p, li, td, th").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();

    if (text.length < 2) return;
    if (seen.has(text)) return;
    seen.add(text);

    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);

    index.push({
      page: page.file,
      label: page.label,
      tag,
      text,
      slug
    });
  });

  console.log(`  indexed ${page.file} (${index.length} entries so far)`);
}

fs.writeFileSync(
  path.join(__dirname, "search-index.json"),
  JSON.stringify(index, null, 0)
);

console.log(`\nWrote search-index.json — ${index.length} entries.`);
