import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils";

export type AssetEntity = Prettify<
  WithCompanyId<
    WithDatabaseId<{
      filename: string;
      size: number;
      mimeType: string;
      uploadedAt: Date;
      description?: string;
      appointmentId?: string;
      customerId?: string;
      hash: string;
    }>
  >
>;
