import * as z from "zod";
import { AppointmentEntity } from "../booking/appointment";
import { Customer } from "../customers/customer";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils";
import { AssetEntity } from "./entity";

export type Asset = Prettify<
  WithCompanyId<
    WithDatabaseId<
      AssetEntity & {
        appointment?: AppointmentEntity & {
          customer?: Customer;
        };
        customer?: Customer;
      }
    >
  >
>;

export const assetUpdateSchema = z.object({
  description: z.string().optional(),
  appointmentId: z.string().optional(),
  customerId: z.string().optional(),
});

export type AssetUpdate = z.infer<typeof assetUpdateSchema>;

export type UploadedFile = Asset & {
  url: string;
};
