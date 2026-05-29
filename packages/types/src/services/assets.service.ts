import { Readable } from "stream";
import { SupportedFileUrlResult } from "../apps/assets/assets-storage";
import { Asset, AssetEntity, AssetUpdate } from "../assets";
import { Query, WithTotal } from "../database";
import type { EventSource } from "../events/envelope";

export type AssetDeliveryResult =
  | { kind: "redirect"; url: string }
  | { kind: "stream"; asset: AssetEntity; stream: Readable };

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
  getAssetDelivery(
    filename: string,
    inline?: boolean,
  ): Promise<AssetDeliveryResult | null>;
  getAssetUrl(
    filename: string,
    inline?: boolean,
  ): Promise<SupportedFileUrlResult | null>;
}
