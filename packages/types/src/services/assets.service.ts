import { Readable } from "stream";
import { Asset, AssetEntity, AssetUpdate } from "../assets";
import { Query, WithTotal } from "../database";

export interface IAssetsService {
  getAsset(_id: string): Promise<Asset | null>;
  getAssets(
    query: Query & {
      accept?: string[];
      customerId?: string | string[];
      appointmentId?: string | string[];
    },
  ): Promise<WithTotal<Asset>>;
  createAsset(
    asset: Omit<
      AssetEntity,
      "_id" | "uploadedAt" | "size" | "hash" | "companyId"
    >,
    file: File,
  ): Promise<AssetEntity>;
  updateAsset(id: string, update: Partial<AssetUpdate>): Promise<void>;
  deleteAsset(id: string): Promise<AssetEntity | null>;
  deleteAssets(ids: string[]): Promise<AssetEntity[]>;
  checkUniqueFileName(filename: string, _id?: string): Promise<boolean>;
  streamAsset(
    filename: string,
  ): Promise<{ stream: Readable; asset: AssetEntity } | null>;
}
