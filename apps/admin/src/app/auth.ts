import { getRedisClient } from "@timelish/services";
import {
  getDbConnection,
  getDbConnectionSync,
} from "@timelish/services/database";
import type { WithDatabaseId } from "@timelish/types";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, Organization, organization } from "better-auth/plugins";
import { ObjectId } from "mongodb";
import { ApiError } from "next/dist/server/api-utils";

export const auth = betterAuth({
  database: (options: any) => {
    return mongodbAdapter(getDbConnectionSync(), {
      usePlural: true,
    })(options);
  },
  secondaryStorage: {
    get: async (key: string) => {
      return await getRedisClient().get(key);
    },
    set: async (key: string, value: any, ttl: number | undefined) => {
      if (ttl) {
        await getRedisClient().set(key, value, "EX", ttl);
      } else {
        await getRedisClient().set(key, value);
      }
    },
    delete: async (key: string) => {
      await getRedisClient().del(key);
    },
  },
  advanced: {
    database: {
      generateId: () => new ObjectId().toString(),
    },
    generateId: () => new ObjectId().toString(),
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      organizationSlug: {
        type: "string",
        required: true,
        unique: true,
      },
      organizationId: {
        type: "string",
        input: false,
      },
      organizationName: {
        type: "string",
        required: true,
        unique: true,
      },
      language: {
        type: "string",
        input: false,
        default: "en",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const db = await getDbConnection();

          const { organizationSlug, organizationName, ...userData } = user;
          if (!organizationSlug) {
            throw new ApiError(400, "Organization slug is required");
          }

          if (!organizationName) {
            throw new ApiError(400, "Organization name is required");
          }

          const organization = await db
            .collection<Organization>("organization")
            .findOne({
              slug: organizationSlug,
            });

          if (organization) {
            throw new ApiError(400, "Organization already exists");
          }

          const organizationId = new ObjectId().toString();
          await db
            .collection<
              WithDatabaseId<Omit<Organization, "id">>
            >("organizations")
            .insertOne({
              slug: organizationSlug as string,
              name: organizationName as string,
              createdAt: new Date(),
              _id: organizationId,
            });

          return {
            data: {
              ...userData,
              organizationId,
              language: "en",
            },
          };
        },
      },
    },
  },
  plugins: [
    organization({
      organizationLimit: 1,
    }),
    customSession(async ({ user, session }) => {
      const organizationId = (user as any).organizationId as string;
      if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
      }

      const db = await getDbConnection();
      const organization = await db
        .collection<WithDatabaseId<Organization>>("organizations")
        .findOne({
          _id: organizationId,
        });

      if (!organization) {
        throw new ApiError(400, "Organization not found");
      }

      return {
        ...session,
        user: {
          ...user,
          organizationId: organizationId,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          language: (user as any).language || "en",
        },
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
