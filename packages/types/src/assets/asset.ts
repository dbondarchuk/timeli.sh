import z from "zod";
import { AppointmentEntity } from "../booking";
import { Customer } from "../customers";

export type AssetEntity = {
  _id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  description?: string;
  appointmentId?: string;
  customerId?: string;
  hash: string;
};

export type Asset = AssetEntity & {
  appointment?: AppointmentEntity & {
    customer?: Customer;
  };
  customer?: Customer;
};

export const assetUpdateSchema = z.object({
  description: z.string().optional(),
  appointmentId: z.string().optional(),
  customerId: z.string().optional(),
});

export type AssetUpdate = z.infer<typeof assetUpdateSchema>;

export type UploadedFile = Asset & {
  url: string;
};
