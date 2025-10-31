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

export interface IAssetsStorage {
  getFile(filename: string): Promise<Readable | null>;
  saveFile(filename: string, file: Readable, fileLength: number): Promise<void>;
  deleteFile(filename: string): Promise<void>;
  deleteFiles(filenames: string[]): Promise<void>;
  checkExists(filename: string): Promise<boolean>;
}
