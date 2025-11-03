import { S3Configuration } from "./types";

export const getS3Configuration = (): S3Configuration => {
  return {
    region: process.env.S3_REGION!,
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
};
