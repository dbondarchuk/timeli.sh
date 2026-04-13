const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const COLLECTION = "communication-logs";
const PREVIEW_LEN = 50;

/**
 * @param {string | undefined} text
 * @param {string | undefined} html
 */
function previewFromDoc(text, html) {
  if (typeof text === "string" && text.trim().length) {
    const n = text.replace(/\s+/g, " ").trim();
    return n.length <= PREVIEW_LEN ? n : n.slice(0, PREVIEW_LEN);
  }
  if (typeof html === "string" && html.length) {
    const plain = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plain.length <= PREVIEW_LEN ? plain : plain.slice(0, PREVIEW_LEN);
  }
  return "";
}

function getS3Config() {
  return {
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET || "assets",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

function s3Key(organizationId, logId) {
  return `${organizationId}/communication-logs/${logId}.json`;
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<void>}
 */
async function up(db, client) {
  const cfg = getS3Config();
  if (!cfg.region) {
    throw new Error("S3_REGION must be set to run this migration");
  }

  const s3 = new S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle,
  });

  const coll = db.collection(COLLECTION);
  const cursor = coll.find({
    $or: [
      { text: { $exists: true, $ne: null } },
      { html: { $exists: true, $ne: null } },
      { data: { $exists: true, $ne: null } },
    ],
  });

  for await (const doc of cursor) {
    const hasInline =
      (typeof doc.text === "string" && doc.text.length > 0) ||
      (typeof doc.html === "string" && doc.html.length > 0) ||
      doc.data !== undefined;

    if (!hasInline) {
      continue;
    }

    const orgId = doc.organizationId;
    const logId = doc._id;
    if (!orgId || !logId) {
      continue;
    }

    const payload = {
      text: typeof doc.text === "string" ? doc.text : "",
      ...(typeof doc.html === "string" ? { html: doc.html } : {}),
      ...(doc.data !== undefined ? { data: doc.data } : {}),
    };

    const body = Buffer.from(JSON.stringify(payload), "utf8");

    await s3.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: s3Key(orgId, logId),
        Body: body,
        ContentLength: body.length,
      }),
    );

    const preview =
      typeof doc.preview === "string" && doc.preview.length
        ? doc.preview
        : previewFromDoc(doc.text, doc.html);

    const hasPayloadData = doc.data !== undefined && doc.data !== null;

    await coll.updateOne(
      { _id: logId, organizationId: orgId },
      {
        $set: {
          preview,
          hasPayloadData,
        },
        $unset: { text: "", html: "", data: "" },
      },
    );
  }
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<void>}
 */
async function down(db, client) {
  const cfg = getS3Config();
  if (!cfg.region) {
    throw new Error("S3_REGION must be set to run this migration down");
  }

  const s3 = new S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle,
  });

  const coll = db.collection(COLLECTION);
  const cursor = coll.find({
    preview: { $exists: true },
    text: { $exists: false },
  });

  for await (const doc of cursor) {
    const orgId = doc.organizationId;
    const logId = doc._id;
    if (!orgId || !logId) {
      continue;
    }

    const key = s3Key(orgId, logId);
    let payload = null;
    try {
      const res = await s3.send(
        new GetObjectCommand({
          Bucket: cfg.bucket,
          Key: key,
        }),
      );
      if (res.Body) {
        const chunks = [];
        for await (const chunk of res.Body) {
          chunks.push(chunk);
        }
        payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      }
    } catch {
      payload = null;
    }

    if (!payload) {
      continue;
    }

    await coll.updateOne(
      { _id: logId, organizationId: orgId },
      {
        $set: {
          text: typeof payload.text === "string" ? payload.text : "",
          ...(payload.html !== undefined ? { html: payload.html } : {}),
          ...(payload.data !== undefined ? { data: payload.data } : {}),
        },
        $unset: { preview: "", hasPayloadData: "" },
      },
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
      }),
    );
  }
}

module.exports = { up, down };
