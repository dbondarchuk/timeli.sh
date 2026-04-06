import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../..");
const enSource = path.join(
  root,
  "apps/admin/src/components/install/data/_catalog-en-source.json",
);
const installEn = path.join(root, "packages/i18n/src/locales/en/install.json");
const installUk = path.join(root, "packages/i18n/src/locales/uk/install.json");

function buildCatalogTree(en) {
  const categories = {};
  const tags = {};
  const tree = {};

  for (const [catId, professions] of Object.entries(en)) {
    categories[catId] = titleCase(catId.replace(/-/g, " "));
    tree[catId] = {};
    for (const [profId, prof] of Object.entries(professions)) {
      for (const tag of prof.tags || []) {
        const tid = String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "_");
        if (!tags[tid]) tags[tid] = titleCase(String(tag));
      }
      tree[catId][profId] = {
        label: prof.label,
        services: {},
      };
      for (const [svcId, svc] of Object.entries(prof.services || {})) {
        tree[catId][profId].services[svcId] = {
          name: svc.name,
          description: svc.description,
          ...(svc.addons ? { addons: svc.addons } : {}),
        };
      }
    }
  }

  return { categories, tags, professions: tree };
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deepMergeInstallCatalog(installRoot, catalogBlock) {
  const out = { ...installRoot };
  out.catalog = catalogBlock;
  return out;
}

const en = JSON.parse(fs.readFileSync(enSource, "utf8"));
const { categories, tags, professions } = buildCatalogTree(en);
const catalogBlock = {
  categories,
  tags,
  ...professions,
};

const installEnObj = JSON.parse(fs.readFileSync(installEn, "utf8"));
const mergedEn = deepMergeInstallCatalog(installEnObj, catalogBlock);
fs.writeFileSync(installEn, JSON.stringify(mergedEn, null, 2) + "\n");

const installUkObj = JSON.parse(fs.readFileSync(installUk, "utf8"));
const mergedUk = deepMergeInstallCatalog(installUkObj, catalogBlock);
fs.writeFileSync(installUk, JSON.stringify(mergedUk, null, 2) + "\n");

console.log("Merged catalog into en and uk install.json");
