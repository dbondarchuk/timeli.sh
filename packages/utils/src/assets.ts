import mimeType from "mime-type/with-db";

export const mimeTypeToExtension = (fileType: string) =>
  (mimeType.extension(fileType) || "bin") as string;

export const fileNameToMimeType = (fileName: string) => {
  let fileType = mimeType.lookup(fileName);
  if (!fileType) {
    fileType = "application/octet-stream";
  } else if (Array.isArray(fileType)) {
    fileType = fileType[0];
  }

  return fileType;
};
