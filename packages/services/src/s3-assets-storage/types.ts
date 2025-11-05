export type S3Configuration = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string | undefined;
  bucket?: string | undefined;
  forcePathStyle?: boolean | undefined;
};
