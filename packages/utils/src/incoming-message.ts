import contentType from "content-type";
import type { IncomingMessage } from "http";
import getRawBody from "raw-body";

export interface BufferInfo {
  limit?: string | number | undefined;
  encoding?: BufferEncoding;
}

export const buffer = async (
  req: IncomingMessage,
  { limit = "1mb", encoding }: BufferInfo = {},
) => {
  const type = req.headers["content-type"] || "text/plain";
  const length = req.headers["content-length"];

  return await getRawBody(req, {
    limit,
    length,
    encoding: encoding ?? contentType.parse(type).parameters.charset,
  });
};

export const reqBodyText = async (
  req: IncomingMessage,
  { limit, encoding }: BufferInfo = {},
) => {
  const body = await buffer(req, { limit, encoding });

  // @ts-ignore Wrong typing
  return body.toString(encoding);
};

export const reqBodyJson = async (
  req: IncomingMessage,
  opts: BufferInfo = {},
) => await reqBodyText(req, opts).then((body) => JSON.parse(body));
