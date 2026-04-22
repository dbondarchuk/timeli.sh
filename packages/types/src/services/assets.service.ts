import { Readable } from "stream";
import { Asset, AssetEntity, AssetUpdate } from "../assets";
import { Query, WithTotal } from "../database";
import type { EventSource } from "../events/envelope";

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
      "_id" | "uploadedAt" | "size" | "hash" | "organizationId"
    >,
    file: File,
    source: EventSource,
  ): Promise<AssetEntity>;
  updateAsset(
    id: string,
    update: Partial<AssetUpdate>,
    source: EventSource,
  ): Promise<void>;
  deleteAsset(id: string, source: EventSource): Promise<AssetEntity | null>;
  deleteAssets(ids: string[], source: EventSource): Promise<AssetEntity[]>;
  checkUniqueFileName(filename: string, _id?: string): Promise<boolean>;
  streamAsset(
    filename: string,
  ): Promise<{ stream: Readable; asset: AssetEntity } | null>;
}
