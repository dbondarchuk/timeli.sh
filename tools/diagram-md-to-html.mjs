#!/usr/bin/env node
/**
 * Render Markdown to self-contained HTML (CDN: marked + mermaid).
 * Fenced ```mermaid blocks are converted client-side before Mermaid runs.
 *
 * Single file:
 *   node tools/diagram-md-to-html.mjs <input.md> [output.html]
 *
 * Directory (recursive .md under the given folder):
 *   node tools/diagram-md-to-html.mjs <dir>
 *   Writes <path>.html next to each <path>.md and <dir>/index.html with links.
 *
 * If output is omitted (file mode): input path ending in `.md` → `.html`; else append `.html`.
 *
 * Options:
 *   --title "Text"      Document <title> (file mode only; ignored in directory mode)
 *   --no-index          Directory mode: do not write index.html
 *   --index-name NAME   Directory mode: index filename (default: index.html)
 *   -h, --help          Show help
 */
import { readFile, writeFile, stat, readdir } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);

const IGNORE_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  ".turbo",
  ".next",
  "coverage",
]);

function printHelp() {
  console.log(`Usage:
  node ${scriptPath} <input.md> [output.html]
  node ${scriptPath} <directory>

  File mode: optional second argument is output HTML path.
  Directory mode: scans recursively for *.md, writes .html beside each, then index.html.

Options:
  --title "Text"       <title> for single-file mode (default: first # heading or filename)
  --no-index           Skip writing index.html in directory mode
  --index-name NAME    Index file name (default: index.html)
  -h, --help           This message
`);
}

function defaultOutputPath(inputPath) {
  if (/\.md$/i.test(inputPath)) {
    return inputPath.replace(/\.md$/i, ".html");
  }
  return `${inputPath}.html`;
}

function parseArgs(argv) {
  const options = {
    title: null,
    help: false,
    noIndex: false,
    indexName: "index.html",
  };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      options.help = true;
      continue;
    }
    if (a === "--no-index") {
      options.noIndex = true;
      continue;
    }
    if (a === "--index-name") {
      const next = argv[++i];
      if (!next) {
        throw new Error("--index-name requires a value");
      }
      options.indexName = next;
      continue;
    }
    if (a.startsWith("--index-name=")) {
      options.indexName = a.slice("--index-name=".length);
      continue;
    }
    if (a === "--title") {
      const next = argv[++i];
      if (!next) {
        throw new Error("--title requires a value");
      }
      options.title = next;
      continue;
    }
    if (a.startsWith("--title=")) {
      options.title = a.slice("--title=".length);
      continue;
    }
    positional.push(a);
  }

  return { positional, options };
}

function titleFromMarkdown(markdown, fallbackStem) {
  const m = markdown.match(/^#\s+(.+)$/m);
  if (m?.[1]) {
    return m[1].trim();
  }
  return fallbackStem;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toWebPath(filePath) {
  return filePath.split("\\").join("/");
}

function buildDocumentHtml(markdown, titleText) {
  const docTitleEscaped = escapeHtml(titleText);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="diagram-md-to-html.mjs (markdown + mermaid)" />
    <title>${docTitleEscaped}</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        background: #fff;
        color: #111;
      }
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      @media print {
        h2 {
          break-before: page;
          page-break-before: always;
        }
        h2:first-of-type {
          break-before: auto;
          page-break-before: auto;
        }
      }
      p, li {
        line-height: 1.5;
      }
      pre {
        background: #f7f7f7;
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
      }
      code {
        font-family: Consolas, Monaco, monospace;
      }
      .mermaid {
        page-break-inside: avoid;
        margin: 16px 0 28px;
        text-align: center;
      }
      .mermaid svg {
        max-width: 100% !important;
        max-height: 600px !important;
        height: auto !important;
      }
      hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 28px 0;
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        flowchart: { useMaxWidth: true, htmlLabels: true },
      });

      const raw = JSON.parse(document.getElementById("source").textContent);
      const parsed = marked.parse(raw, { gfm: true, breaks: false });
      const output = document.getElementById("output");
      output.innerHTML = parsed;

      const mermaidCodeBlocks = output.querySelectorAll("pre > code.language-mermaid");
      mermaidCodeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        if (!pre?.parentElement) return;
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid";
        wrapper.textContent = codeBlock.textContent || "";
        pre.parentElement.replaceChild(wrapper, pre);
      });

      await mermaid.run({ querySelector: ".mermaid" });
    </script>
  </head>
  <body>
    <div class="container" id="output"></div>
    <script id="source" type="application/json">${JSON.stringify(markdown)}</script>
  </body>
</html>
`;
}

function buildIndexHtml(rootDir, entries) {
  const rootName = basename(rootDir);
  const title = `Diagrams — ${rootName}`;
  const items = entries
    .map((e) => {
      const hrefEsc = escapeHtml(e.href);
      const labelEsc = escapeHtml(e.label);
      return `        <li><a href="${hrefEsc}">${labelEsc}</a> <code>${escapeHtml(e.href)}</code></li>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="diagram-md-to-html.mjs (index)" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
      .container { max-width: 900px; margin: 0 auto; padding: 32px; }
      h1 { margin-top: 0; }
      ul { line-height: 1.8; padding-left: 1.25rem; }
      code { font-size: 0.85em; color: #444; }
      p.meta { color: #555; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${escapeHtml(title)}</h1>
      <p class="meta">Generated pages (${entries.length}):</p>
      <ul>
${items}
      </ul>
    </div>
  </body>
</html>
`;
}

async function collectMarkdownFiles(rootDir) {
  const results = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = join(current, ent.name);
      if (ent.isDirectory()) {
        if (IGNORE_DIR_NAMES.has(ent.name)) {
          continue;
        }
        await walk(full);
      } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
        results.push(full);
      }
    }
  }

  await walk(rootDir);
  return results.sort();
}

async function processDirectory(rootDir, options) {
  const mdFiles = await collectMarkdownFiles(rootDir);
  if (mdFiles.length === 0) {
    console.warn(`No .md files under ${rootDir}`);
    if (!options.noIndex) {
      const indexPath = join(rootDir, options.indexName);
      await writeFile(
        indexPath,
        buildIndexHtml(rootDir, []),
        "utf8",
      );
      console.log(`Wrote ${indexPath} (empty)`);
    }
    return;
  }

  const indexEntries = [];

  for (const mdPath of mdFiles) {
    const markdown = await readFile(mdPath, "utf8");
    const fallbackStem =
      basename(mdPath).replace(/\.md$/i, "") || "Document";
    const docTitle = titleFromMarkdown(markdown, fallbackStem);
    const htmlPath = defaultOutputPath(mdPath);
    const html = buildDocumentHtml(markdown, docTitle);
    await writeFile(htmlPath, html, "utf8");
    console.log(`Wrote ${htmlPath}`);

    const indexPath = join(rootDir, options.indexName);
    const href = toWebPath(relative(dirname(indexPath), htmlPath));
    indexEntries.push({ href, label: docTitle });
  }

  if (!options.noIndex) {
    const indexPath = join(rootDir, options.indexName);
    indexEntries.sort((a, b) => a.href.localeCompare(b.href));
    await writeFile(indexPath, buildIndexHtml(rootDir, indexEntries), "utf8");
    console.log(`Wrote ${indexPath}`);
  }
}

const { positional, options } = parseArgs(process.argv.slice(2));

if (options.help || positional.length === 0) {
  printHelp();
  process.exit(options.help ? 0 : 1);
}

const inputRaw = positional[0];
const outputRaw = positional[1] ?? null;
const inputPath = resolve(process.cwd(), inputRaw);

try {
  const st = await stat(inputPath);

  if (st.isDirectory()) {
    if (outputRaw) {
      console.error(
        "Directory mode does not accept an output path. HTML is written next to each .md file.",
      );
      process.exit(1);
    }
    if (options.title) {
      console.warn("Warning: --title is ignored in directory mode.");
    }
    await processDirectory(inputPath, options);
  } else if (st.isFile()) {
    const outputPath = resolve(
      process.cwd(),
      outputRaw ?? defaultOutputPath(inputPath),
    );
    const markdown = await readFile(inputPath, "utf8");
    const fallbackStem =
      basename(inputPath).replace(/\.md$/i, "") || "Document";
    const docTitle = options.title ?? titleFromMarkdown(markdown, fallbackStem);
    const html = buildDocumentHtml(markdown, docTitle);
    await writeFile(outputPath, html, "utf8");
    console.log(`Wrote ${outputPath}`);
  } else {
    console.error(`Not a file or directory: ${inputPath}`);
    process.exit(1);
  }
} catch (e) {
  if (e && typeof e === "object" && "code" in e && e.code === "ENOENT") {
    console.error(`Path not found: ${inputPath}`);
    process.exit(1);
  }
  throw e;
}
