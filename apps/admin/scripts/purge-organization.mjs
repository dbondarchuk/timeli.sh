/**
 * Irreversibly deletes an organization and related data from MongoDB.
 *
 * Usage (from repo root):
 *   node apps/admin/scripts/purge-organization.mjs <organizationId> [--yes] [--slug=<slug>]
 *
 * Or from apps/admin:
 *   node scripts/purge-organization.mjs <organizationId> [--yes] [--slug=<slug>]
 *
 * Without --yes / --slug you will be prompted:
 *   1) Type exactly: yes
 *   2) Type the organization's slug (must match DB)
 *
 * Requires MONGODB_URI and MONGODB_DB (loads .env from repo root and apps/admin).
 *
 * Optional S3 cleanup (same vars as S3AssetsStorageService): S3_BUCKET, S3_REGION,
 * S3_ACCESS_KEY, S3_SECRET_KEY, plus optional S3_ENDPOINT and S3_FORCE_PATH_STYLE=true.
 * Deletes all objects under prefix `{organizationId}/` after MongoDB purge succeeds.
 *
 * @typedef {{ organizationId: string | null, yes: boolean, slug: string | null }} CliOpts
 */

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} dir */
function loadEnvIfPresent(dir) {
  for (const name of [".env", ".env.local"]) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, override: true });
    }
  }
}

loadEnvIfPresent(path.resolve(__dirname, "../../.."));
loadEnvIfPresent(path.resolve(__dirname, ".."));

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {CliOpts} */
  const out = { organizationId: null, yes: false, slug: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--yes" || a === "-y") {
      out.yes = true;
      continue;
    }
    if (a.startsWith("--organization-id=")) {
      out.organizationId = a.slice("--organization-id=".length);
      continue;
    }
    if (a.startsWith("--slug=")) {
      out.slug = a.slice("--slug=".length);
      continue;
    }
    if (a === "--slug") {
      out.slug = argv[++i] ?? null;
      continue;
    }
    if (!a.startsWith("-") && !out.organizationId) {
      out.organizationId = a;
    }
  }
  return out;
}

/**
 * @param {import('mongodb').Db} db
 * @returns {Promise<string[]>}
 */
async function listUserCollectionNames(db) {
  const cols = await db.listCollections().toArray();
  return cols.map((c) => c.name).filter((n) => n && !n.startsWith("system."));
}

/**
 * Match filter for organization _id (string or ObjectId in DB).
 * @param {string} id
 */
function orgIdFilter(id) {
  if (ObjectId.isValid(id)) {
    return { $in: [id, new ObjectId(id)] };
  }
  return id;
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} organizationId
 */
async function purgeOrganization(db, organizationId) {
  const orgColl = db.collection("organizations");

  const userDocs = await db
    .collection("users")
    .find({
      $or: [
        { organizationId: organizationId },
        ...(ObjectId.isValid(organizationId)
          ? [{ organizationId: new ObjectId(organizationId) }]
          : []),
      ],
    })
    .project({ _id: 1 })
    .toArray();

  const userIdStrings = userDocs.map((u) => u._id.toString());

  const collectionNames = await listUserCollectionNames(db);
  console.log(`Collections to scan: ${collectionNames.length}`);

  /** @type {Record<string, number>} */
  const summary = {};

  for (const name of collectionNames) {
    if (name === "organizations" || name === "users") {
      continue;
    }

    const coll = db.collection(name);
    const r1 = await coll.deleteMany({ organizationId: organizationId });
    if (r1.deletedCount > 0) {
      summary[`${name} (organizationId)`] = r1.deletedCount;
    }

    const r2 = await coll.deleteMany({
      $or: [
        { organizationId: organizationId },
        ...(ObjectId.isValid(organizationId)
          ? [{ organizationId: new ObjectId(organizationId) }]
          : []),
      ],
    });
    if (r2.deletedCount > 0) {
      summary[`${name} (organizationId)`] = r2.deletedCount;
    }
  }

  if (userIdStrings.length > 0) {
    const userIdClause = {
      $in: [
        ...userIdStrings,
        ...userIdStrings
          .filter((id) => ObjectId.isValid(id))
          .map((id) => new ObjectId(id)),
      ],
    };

    for (const name of ["sessions", "accounts", "verifications"]) {
      if (!collectionNames.includes(name)) {
        continue;
      }
      const coll = db.collection(name);
      const r = await coll.deleteMany({ userId: userIdClause });
      if (r.deletedCount > 0) {
        summary[`${name} (userId)`] = r.deletedCount;
      }
    }
  }

  const usersDel = await db.collection("users").deleteMany({
    $or: [
      { organizationId: organizationId },
      ...(ObjectId.isValid(organizationId)
        ? [{ organizationId: new ObjectId(organizationId) }]
        : []),
    ],
  });
  summary["users (organizationId)"] = usersDel.deletedCount;

  const orgFilter = { _id: orgIdFilter(organizationId) };
  const orgDel = await orgColl.deleteOne(orgFilter);
  summary["organizations (_id)"] = orgDel.deletedCount;

  console.log("\nMongoDB delete summary:");
  for (const [k, v] of Object.entries(summary)) {
    if (v > 0) {
      console.log(`  ${k}: ${v}`);
    }
  }
}

/**
 * Remove all S3 assets for the org (keys: `{organizationId}/...` per S3AssetsStorageService).
 * @param {string} organizationId
 */
async function purgeOrganizationS3Prefix(organizationId) {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    console.log("\nS3_BUCKET not set — skipping S3 object deletion.");
    return;
  }

  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim();
  if (!region) {
    console.log("\nS3_REGION not set — skipping S3 object deletion.");
    return;
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });

  const prefix = `${organizationId}/`;
  let totalDeleted = 0;
  let continuationToken = undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    const keys = (list.Contents ?? [])
      .map((o) => o.Key)
      .filter((k) => Boolean(k));
    continuationToken = list.IsTruncated
      ? list.NextContinuationToken
      : undefined;

    console.log(`Deleting ${keys} objects from S3`);

    for (let i = 0; i < keys.length; i += 1000) {
      const batch = keys.slice(i, i + 1000);
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: batch.map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );
      totalDeleted += batch.length;
    }
  } while (continuationToken);

  console.log(
    `\nS3: deleted ${totalDeleted} object(s) under s3://${bucket}/${prefix}*`,
  );
}

async function main() {
  const opts = parseArgs(process.argv);
  const organizationIdArg = opts.organizationId?.trim();
  if (!organizationIdArg) {
    console.error(
      "Usage: node purge-organization.mjs <organizationId> [--yes] [--slug=<slug>]",
    );
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error(
      "Missing MONGODB_URI or MONGODB_DB. Set them in .env and run again.",
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  try {
    let orgDoc = await db
      .collection("organizations")
      .findOne({ _id: organizationIdArg });
    if (!orgDoc && ObjectId.isValid(organizationIdArg)) {
      orgDoc = await db
        .collection("organizations")
        .findOne({ _id: new ObjectId(organizationIdArg) });
    }
    if (!orgDoc) {
      console.error(`No organization with _id matching: ${organizationIdArg}`);
      process.exit(1);
    }

    const organizationId =
      orgDoc._id instanceof ObjectId
        ? orgDoc._id.toString()
        : String(orgDoc._id);

    const slug = orgDoc.slug;
    console.log(
      `Found organization: _id=${organizationId}, slug=${slug ?? "(none)"}`,
    );

    const rl = readline.createInterface({ input, output });
    try {
      if (!opts.yes) {
        const confirmYes = await rl.question(
          'Type "yes" to confirm permanent deletion of this org and its users: ',
        );
        if (confirmYes.trim() !== "yes") {
          console.log("Aborted.");
          process.exit(0);
        }
      }

      const expectedSlug = typeof slug === "string" ? slug : "";
      if (!opts.slug) {
        const typedSlug = await rl.question(
          `Type the organization slug to confirm (db: "${expectedSlug}"): `,
        );
        if (typedSlug.trim() !== expectedSlug) {
          console.error("Slug does not match. Aborted.");
          process.exit(1);
        }
      } else if (opts.slug.trim() !== expectedSlug) {
        console.error(
          `Slug mismatch: arg "${opts.slug.trim()}" !== db "${expectedSlug}". Aborted.`,
        );
        process.exit(1);
      }
    } finally {
      rl.close();
    }

    await purgeOrganizationS3Prefix(organizationId);
    await purgeOrganization(db, organizationId);
    console.log("\nDone.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
