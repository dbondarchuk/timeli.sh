/** @typedef {'up' | 'down'} MigrationDirection */

const INTERNAL_COLLECTIONS = new Set(["changelog", "changelog_lock"]);

const INDEX_OPTION_KEYS = new Set([
  "unique",
  "sparse",
  "expireAfterSeconds",
  "collation",
  "partialFilterExpression",
  "weights",
  "default_language",
  "language_override",
  "textIndexVersion",
  "2dsphereIndexVersion",
  "bits",
  "min",
  "max",
  "bucketSize",
  "wildcardProjection",
  "hidden",
]);

/**
 * @param {MigrationDirection} direction
 */
function fieldFrom(direction) {
  return direction === "up" ? "companyId" : "organizationId";
}

/**
 * @param {MigrationDirection} direction
 */
function fieldTo(direction) {
  return direction === "up" ? "organizationId" : "companyId";
}

/**
 * @param {string} path
 * @param {MigrationDirection} direction
 */
function rewriteFieldPath(path, direction) {
  const from = fieldFrom(direction);
  const to = fieldTo(direction);
  return path
    .split(".")
    .map((segment) => (segment === from ? to : segment))
    .join(".");
}

/**
 * @param {unknown} value
 * @param {MigrationDirection} direction
 */
function rewriteFilterKeys(value, direction) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((x) => rewriteFilterKeys(x, direction));
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const newKey = rewriteFieldPath(k, direction);
    out[newKey] = rewriteFilterKeys(v, direction);
  }
  return out;
}

/**
 * @param {string} name
 * @param {MigrationDirection} direction
 */
function rewriteIndexName(name, direction) {
  if (direction === "up") {
    return name.replace(/company/gi, "organization");
  }
  return name.replace(/organization/gi, "company");
}

/**
 * @param {Record<string, number>} key
 * @param {MigrationDirection} direction
 */
function rewriteIndexKey(key, direction) {
  const from = fieldFrom(direction);
  const to = fieldTo(direction);
  const next = {};
  for (const [field, dir] of Object.entries(key)) {
    next[field === from ? to : field] = dir;
  }
  return next;
}

/**
 * @param {import('mongodb').Document} index
 * @param {MigrationDirection} direction
 */
function shouldRewriteIndex(index, direction) {
  if (index.name === "_id_") {
    return false;
  }
  const from = fieldFrom(direction);
  const hasSourceField = Object.prototype.hasOwnProperty.call(
    index.key,
    from,
  );
  const namePattern = direction === "up" ? /company/i : /organization/i;
  const nameMatches = namePattern.test(index.name);
  return hasSourceField || nameMatches;
}

/**
 * @param {import('mongodb').Document} oldIndex
 * @param {string} newName
 * @param {MigrationDirection} direction
 */
function buildCreateOptions(oldIndex, newName, direction) {
  const opts = { name: newName };
  for (const key of INDEX_OPTION_KEYS) {
    if (oldIndex[key] === undefined) {
      continue;
    }
    if (
      key === "partialFilterExpression" ||
      key === "weights" ||
      key === "wildcardProjection"
    ) {
      opts[key] = rewriteFilterKeys(oldIndex[key], direction);
    } else {
      opts[key] = oldIndex[key];
    }
  }
  return opts;
}

/**
 * @param {import('mongodb').Collection} collection
 * @param {MigrationDirection} direction
 */
async function renameTenantField(collection, direction) {
  const from = fieldFrom(direction);
  const to = fieldTo(direction);
  const renamed = await collection.updateMany(
    {
      [from]: { $exists: true },
      [to]: { $exists: false },
    },
    { $rename: { [from]: to } },
  );

  const cleared = await collection.updateMany(
    { [from]: { $exists: true }, [to]: { $exists: true } },
    { $unset: { [from]: "" } },
  );

  return {
    renamedCount: renamed.modifiedCount,
    clearedDuplicateFieldCount: cleared.modifiedCount,
  };
}

/**
 * @returns {Promise<Array<{ collectionName: string, specs: Array<{ newKey: Record<string, number>, options: import('mongodb').CreateIndexesOptions }> }>>}
 * @param {import('mongodb').Db} db
 * @param {MigrationDirection} direction
 */
async function dropIndexesNeedingRewriteAndCollectSpecs(db, direction) {
  /** @type {Array<{ collectionName: string, specs: Array<{ newKey: Record<string, number>, options: import('mongodb').CreateIndexesOptions }> }>} */
  const pendingCreates = [];

  const collections = (await db.listCollections().toArray()).filter(
    (c) => c.type !== "view",
  );

  for (const { name } of collections) {
    if (INTERNAL_COLLECTIONS.has(name)) {
      continue;
    }

    const collection = db.collection(name);
    const indexes = await collection.indexes();
    const toRebuild = indexes.filter((idx) => shouldRewriteIndex(idx, direction));

    if (toRebuild.length === 0) {
      continue;
    }

    const specs = toRebuild.map((idx) => {
      const newName = rewriteIndexName(idx.name, direction);
      return {
        newKey: rewriteIndexKey(idx.key, direction),
        options: buildCreateOptions(idx, newName, direction),
      };
    });

    for (const idx of toRebuild) {
      if (idx.name === "_id_") {
        continue;
      }
      if (await collection.indexExists(idx.name)) {
        await collection.dropIndex(idx.name);
        console.log(`Dropped index ${idx.name} on ${name}`);
      }
    }

    pendingCreates.push({ collectionName: name, specs });
  }

  return pendingCreates;
}

/**
 * @param {import('mongodb').Db} db
 * @param {Array<{ collectionName: string, specs: Array<{ newKey: Record<string, number>, options: import('mongodb').CreateIndexesOptions }> }>} pendingCreates
 */
async function createIndexesFromSpecs(db, pendingCreates) {
  for (const { collectionName, specs } of pendingCreates) {
    const collection = db.collection(collectionName);
    for (const { newKey, options } of specs) {
      const name = options.name;
      if (typeof name !== "string") {
        continue;
      }
      if (await collection.indexExists(name)) {
        console.log(
          `Index ${name} already exists on ${collectionName}, skipping create`,
        );
        continue;
      }
      await collection.createIndex(newKey, options);
      console.log(`Created index ${name} on ${collectionName}`);
    }
  }
}

/**
 * @param {import('mongodb').Db} db
 * @param {MigrationDirection} direction
 */
async function migrateDocuments(db, direction) {
  const collections = (await db.listCollections().toArray()).filter(
    (c) => c.type !== "view",
  );

  for (const { name } of collections) {
    if (INTERNAL_COLLECTIONS.has(name)) {
      continue;
    }
    const collection = db.collection(name);
    const counts = await renameTenantField(collection, direction);
    if (
      counts.renamedCount > 0 ||
      counts.clearedDuplicateFieldCount > 0
    ) {
      console.log(
        `Collection ${name}: renamed ${counts.renamedCount} docs, cleared duplicate field on ${counts.clearedDuplicateFieldCount} docs`,
      );
    }
  }
}

/**
 * @param {import('mongodb').Db} db
 * @param {MigrationDirection} direction
 */
async function runDirection(db, direction) {
  const pendingCreates = await dropIndexesNeedingRewriteAndCollectSpecs(
    db,
    direction,
  );
  await migrateDocuments(db, direction);
  await createIndexesFromSpecs(db, pendingCreates);
}

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    console.log("rename_companyId_to_organizationId: up()");
    await runDirection(db, "up");
    console.log("rename_companyId_to_organizationId: up() done");
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    console.log("rename_companyId_to_organizationId: down()");
    await runDirection(db, "down");
    console.log("rename_companyId_to_organizationId: down() done");
  },
};
