import { Readable } from "stream";

// export interface IAssetsStorage {
//   getFile(appData: ConnectedAppData, filename: string): Promise<Readable>;
//   saveFile(
//     appData: ConnectedAppData,
//     filename: string,
//     file: Readable,
//     fileLength: number,
//   ): Promise<void>;
//   deleteFile(appData: ConnectedAppData, filename: string): Promise<void>;
//   deleteFiles(appData: ConnectedAppData, filenames: string[]): Promise<void>;
//   checkExists(appData: ConnectedAppData, filename: string): Promise<boolean>;
// }

export type SaveFileOptions = {
  contentType?: string;
  publicRead?: boolean;
};

export type SupportedFileUrlResult =
  | { supported: true; url: string | null }
  | { supported: false; url?: never };

export type FileDeliveryResult =
  | { kind: "redirect"; url: string }
  | { kind: "stream"; stream: Readable; contentLength: number };

export interface IAssetsStorage {
  getFile(
    filename: string,
  ): Promise<{ stream: Readable; contentLength: number } | null>;
  getFileDelivery(
    filename: string,
    inline?: boolean,
  ): Promise<FileDeliveryResult | null>;
  getPresignedFileUrl(
    filename: string,
    inline?: boolean,
  ): Promise<SupportedFileUrlResult>;
  getPublicFileUrl(
    filename: string,
    inline?: boolean,
  ): SupportedFileUrlResult;
  saveFile(
    filename: string,
    file: Readable,
    fileLength: number,
    options?: SaveFileOptions,
  ): Promise<void>;
  deleteFile(filename: string): Promise<void>;
  deleteFiles(filenames: string[]): Promise<void>;
  checkExists(filename: string): Promise<boolean>;
}
