/**
 * Sets or reverts public-read ACL on existing asset objects in S3.
 *
 * Reads asset records from MongoDB (`assets` collection) and updates matching
 * S3 keys `{organizationId}/{filename}`.
 *
 * Default mode (public): ACL public-read, ContentType, CacheControl, ContentDisposition.
 * Private mode (--private): ACL private, ContentType, ContentDisposition (no public cache).
 *
 * Usage (from repo root):
 *   node apps/admin/scripts/make-assets-public.mjs [--dry-run] [--yes]
 *   node apps/admin/scripts/make-assets-public.mjs --private [--dry-run] [--yes]
 *   node apps/admin/scripts/make-assets-public.mjs --organization-id=<id> [--private] [--dry-run] [--yes]
 *
 * Or from apps/admin:
 *   node scripts/make-assets-public.mjs [--private] [--dry-run] [--yes]
 *
 * Requires MONGODB_URI, MONGODB_DB, S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY.
 * Optional: S3_ENDPOINT, S3_FORCE_PATH_STYLE=true
 *
 * @typedef {{ organizationId: string | null, dryRun: boolean, yes: boolean, concurrency: number, private: boolean }} CliOpts
 */

import {
  CopyObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_COLLECTION_NAME = "assets";
const DEFAULT_BUCKET_NAME = "assets";
const DEFAULT_CONCURRENCY = 10;

/** @param {string} dir */
function loadEnvIfPresent(dir) {
  for (const name of [".env", ".env.local"]) {
    const envPath = path.join(dir, name);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

loadEnvIfPresent(path.resolve(__dirname, "../../.."));
loadEnvIfPresent(path.resolve(__dirname, ".."));

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {CliOpts} */
  const out = {
    organizationId: null,
    dryRun: false,
    yes: false,
    concurrency: DEFAULT_CONCURRENCY,
    private: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (arg === "--yes" || arg === "-y") {
      out.yes = true;
      continue;
    }
    if (arg === "--private") {
      out.private = true;
      continue;
    }
    if (arg.startsWith("--organization-id=") || arg.startsWith("--id=")) {
      const prefix = arg.startsWith("--organization-id=")
        ? "--organization-id="
        : "--id=";
      out.organizationId = arg.slice(prefix.length);
      continue;
    }
    if (arg === "--organization-id" || arg === "--id") {
      out.organizationId = argv[++i] ?? null;
      continue;
    }
    if (arg.startsWith("--concurrency=")) {
      out.concurrency = Number.parseInt(arg.slice("--concurrency=".length), 10);
      continue;
    }
    if (arg === "--concurrency") {
      out.concurrency = Number.parseInt(argv[++i] ?? "", 10);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (
    !Number.isFinite(out.concurrency) ||
    out.concurrency < 1 ||
    out.concurrency > 100
  ) {
    throw new Error("--concurrency must be a number between 1 and 100");
  }

  return out;
}

/** @param {string | undefined} contentType @param {string} fileName */
function getUploadContentDisposition(contentType, fileName) {
  if (
    contentType?.startsWith("image/") ||
    contentType?.startsWith("video/") ||
    contentType?.startsWith("audio/") ||
    contentType === "application/pdf"
  ) {
    return "inline";
  }

  return `attachment; filename="${fileName}"`;
}

/** @param {string} bucket @param {string} key */
function toCopySource(bucket, key) {
  return `${bucket}/${key}`;
}

function createS3Client() {
  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim();

  if (!region) {
    throw new Error("S3_REGION, S3_ACCESS_KEY, and S3_SECRET_KEY must be set");
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

function getBucketName() {
  return process.env.S3_BUCKET?.trim() || DEFAULT_BUCKET_NAME;
}

/** @param {CliOpts} opts */
async function confirmOrExit(opts) {
  if (opts.yes || opts.dryRun) {
    return;
  }

  const rl = readline.createInterface({ input, output });
  try {
    const message = opts.private
      ? "This will set private ACL on all matching S3 asset objects. Type yes to continue: "
      : "This will set public-read ACL on all matching S3 asset objects. Type yes to continue: ";
    const answer = await rl.question(message);
    if (answer.trim() !== "yes") {
      console.log("Aborted.");
      process.exit(1);
    }
  } finally {
    rl.close();
  }
}

/**
 * @param {S3Client} client
 * @param {string} bucket
 * @param {string} key
 * @param {string} contentType
 * @param {string} fileName
 */
async function makeObjectPublic(client, bucket, key, contentType, fileName) {
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: key,
      CopySource: toCopySource(bucket, key),
      ACL: "public-read",
      MetadataDirective: "REPLACE",
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
      ContentDisposition: getUploadContentDisposition(contentType, fileName),
    }),
  );
}

/**
 * @param {S3Client} client
 * @param {string} bucket
 * @param {string} key
 * @param {string} contentType
 * @param {string} fileName
 */
async function makeObjectPrivate(client, bucket, key, contentType, fileName) {
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: key,
      CopySource: toCopySource(bucket, key),
      ACL: "private",
      MetadataDirective: "REPLACE",
      ContentType: contentType || "application/octet-stream",
      ContentDisposition: getUploadContentDisposition(contentType, fileName),
    }),
  );
}

/** @param {S3Client} client @param {string} bucket @param {string} key */
async function objectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error?.name === "NotFound" || error?.name === "NoSuchKey") {
      return false;
    }
    throw error;
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  await confirmOrExit(opts);

  const mongoUri = process.env.MONGODB_URI?.trim();
  const mongoDb = process.env.MONGODB_DB?.trim();
  if (!mongoUri || !mongoDb) {
    throw new Error("MONGODB_URI and MONGODB_DB must be set");
  }

  const bucket = getBucketName();
  const client = createS3Client();
  const mongo = new MongoClient(mongoUri);

  /** @type {{ updated: number, missing: number, failed: number, skipped: number }} */
  const stats = { updated: 0, missing: 0, failed: 0, skipped: 0 };

  try {
    await mongo.connect();
    const db = mongo.db(mongoDb);
    const assets = db.collection(ASSETS_COLLECTION_NAME);

    const filter = opts.organizationId
      ? { organizationId: opts.organizationId }
      : {};

    const cursor = assets.find(filter, {
      projection: {
        _id: 1,
        organizationId: 1,
        filename: 1,
        mimeType: 1,
      },
    });

    const total = await assets.countDocuments(filter);
    const modeLabel = opts.private ? "private" : "public-read";
    console.log(
      `Found ${total} asset record(s) in MongoDB${opts.organizationId ? ` for organization ${opts.organizationId}` : ""}.`,
    );
    console.log(`Mode: ${modeLabel}`);
    if (opts.dryRun) {
      console.log("Dry run — no S3 changes will be made.\n");
    }

    const limit = pLimit(opts.concurrency);
    /** @type {Promise<void>[]} */
    const tasks = [];

    for await (const asset of cursor) {
      const organizationId = asset.organizationId;
      const filename = asset.filename;
      if (!organizationId || !filename) {
        stats.skipped++;
        console.warn(
          `Skipping asset ${asset._id}: missing organizationId or filename`,
        );
        continue;
      }

      const key = `${organizationId}/${filename}`;
      const contentType = asset.mimeType || "application/octet-stream";
      const fileName = path.basename(filename);

      tasks.push(
        limit(async () => {
          try {
            const exists = await objectExists(client, bucket, key);
            if (!exists) {
              stats.missing++;
              console.warn(`Missing in S3: ${key}`);
              return;
            }

            if (opts.dryRun) {
              stats.updated++;
              console.log(`Would update: ${key}`);
              return;
            }

            if (opts.private) {
              await makeObjectPrivate(
                client,
                bucket,
                key,
                contentType,
                fileName,
              );
            } else {
              await makeObjectPublic(
                client,
                bucket,
                key,
                contentType,
                fileName,
              );
            }
            stats.updated++;
            console.log(`Updated: ${key}`);
          } catch (error) {
            stats.failed++;
            console.error(
              `Failed: ${key} — ${error?.message || String(error)}`,
            );
          }
        }),
      );
    }

    await Promise.all(tasks);
  } finally {
    await mongo.close();
  }

  console.log("\nSummary:");
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Missing in S3: ${stats.missing}`);
  console.log(`  Skipped (invalid records): ${stats.skipped}`);
  console.log(`  Failed: ${stats.failed}`);

  if (stats.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
