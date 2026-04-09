import { sendEmail } from "@/utils/email/send-email";
import { languages } from "@timelish/i18n";
import { getRedisClient } from "@timelish/services";
import {
  getDbConnection,
  getDbConnectionSync,
} from "@timelish/services/database";
import type {
  Organization as OrganizationDbModel,
  WithDatabaseId,
} from "@timelish/types";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, Organization, organization } from "better-auth/plugins";
import { ObjectId } from "mongodb";
import { ApiError } from "next/dist/server/api-utils";

export const auth = betterAuth({
  trustedOrigins: [
    process.env.BETTER_AUTH_TRUST_HOST || process.env.AUTH_TRUST_HOST || "",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3001"]
      : []),
  ],
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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      const language = (user as any).language || "en";
      await sendEmail("resetPassword", user.email, language, {
        url,
        token,
        name: user.name,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      const language = (user as any).language || "en";
      await sendEmail("emailVerification", user.email, language, {
        url,
        token,
        name: user.name,
      });
    },
  },
  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        input: false,
      },
      language: {
        type: [...languages],
        input: true,
        default: "en",
      },
      phone: {
        type: "string",
        required: true,
        input: true,
      },
      bio: {
        type: "string",
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        const language = (user as any).language || "en";
        await sendEmail("changeEmail", user.email, language, {
          url,
          token,
          name: user.name,
          newEmail,
        });
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          //   const db = await getDbConnection();

          //   const { organizationSlug, organizationName, ...userData } = user;
          //   if (!organizationSlug) {
          //     throw new ApiError(400, "Organization slug is required");
          //   }

          //   if (!organizationName) {
          //     throw new ApiError(400, "Organization name is required");
          //   }

          //   const organization = await db
          //     .collection<Organization>("organization")
          //     .findOne({
          //       slug: organizationSlug,
          //     });

          //   if (organization) {
          //     throw new ApiError(400, "Organization already exists");
          //   }

          //   const organizationId = new ObjectId().toString();
          //   await db
          //     .collection<
          //       WithDatabaseId<Omit<Organization, "id">>
          //     >("organizations")
          //     .insertOne({
          //       slug: organizationSlug as string,
          //       name: organizationName as string,
          //       createdAt: new Date(),
          //       _id: organizationId,
          //     });

          //   return {
          //     data: {
          //       ...userData,
          //       organizationId,
          //       language: "en",
          //     },
          //   };
          // },
          return {
            data: {
              ...user,
              organizationId: "",
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
      let organizationId = (user as any).organizationId as string;
      const db = await getDbConnection();
      if (!organizationId) {
        const userDbModel = await db.collection<User>("users").findOne({
          _id: new ObjectId(user.id),
        });

        if (!userDbModel) {
          throw new ApiError(400, "User not found");
        }

        if (!userDbModel.organizationId) {
          return {
            ...session,
            user: {
              ...user,
              organizationId: "",
              organizationInstalled: false,
              phone: (user as any).phone || "",
              language: (user as any).language || "en",
              organizationName: "",
              organizationSlug: "",
              organizationDomain: "",
            },
          };
        }

        organizationId = userDbModel.organizationId;
      }

      const organization = await db
        .collection<
          WithDatabaseId<OrganizationDbModel & Organization>
        >("organizations")
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
          phone: (user as any).phone || "",
          organizationInstalled: organization.isInstalled,
          organizationId: organizationId,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          organizationDomain: organization.domain,
          language: (user as any).language || "en",
        },
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
