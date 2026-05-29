import { Stream } from "stream";
import { Readable } from "stream";

export async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}

export function readableToWebStream(
  downloadStream: Readable,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer | string) =>
        controller.enqueue(
          new Uint8Array(
            typeof chunk === "string" ? Buffer.from(chunk, "utf-8") : chunk,
          ),
        ),
      );
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error),
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}
