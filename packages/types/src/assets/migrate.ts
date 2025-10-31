import * as z from "zod";

export const assetsMigrateRequestSchema = z.object({
  fromAppId: z.string().min(1, "App ID for source is required"),
  toAppId: z.string().min(1, "App ID for target is required"),
});

export type AssetsMigrateRequest = z.infer<typeof assetsMigrateRequestSchema>;
