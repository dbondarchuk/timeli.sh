import { WithDatabaseId, WithOrganizationId } from "../database";
import { Prettify } from "../utils";

export type AssetEntity = Prettify<
  WithOrganizationId<
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
