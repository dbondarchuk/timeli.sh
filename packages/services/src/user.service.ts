import { IUserService, User } from "@timelish/types";
import { ObjectId } from "mongodb";
import { USERS_COLLECTION_NAME } from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class UserService extends BaseService implements IUserService {
  public constructor(organizationId: string) {
    super("UserService", organizationId);
  }

  public async getUser(userId: string): Promise<User | null> {
    const logger = this.loggerFactory("getUser");
    logger.debug(
      { userId: userId, organizationId: this.organizationId },
      "Getting user",
    );
    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);

    const user = await users.findOne({
      _id: new ObjectId(userId),
      organizationId: this.organizationId,
    });

    if (!user) {
      logger.warn(
        { userId, organizationId: this.organizationId },
        "User not found",
      );
      return null;
    }

    logger.debug({ userId, organizationId: this.organizationId }, "User found");
    return user;
  }

  public async updateUser(
    userId: string,
    user: Partial<User>,
  ): Promise<User | null> {
    const logger = this.loggerFactory("updateUser");
    logger.debug(
      { user: user, organizationId: this.organizationId },
      "Updating user",
    );

    const { _id, ...update } = user;

    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);
    const result = await users.updateOne(
      { _id: new ObjectId(userId), organizationId: this.organizationId },
      { $set: update },
    );
    if (!result.upsertedCount) {
      logger.warn(
        { userId, organizationId: this.organizationId },
        "User not updated",
      );
      return null;
    }

    const updatedUser = await users.findOne({
      _id: new ObjectId(userId),
      organizationId: this.organizationId,
    });
    if (!updatedUser) {
      logger.warn(
        { userId, organizationId: this.organizationId },
        "User not found after update",
      );
      return null;
    }

    logger.debug(
      { userId, organizationId: this.organizationId },
      "User updated",
    );
    return updatedUser;
  }

  public async getOrganizationAdminUser(): Promise<User | null> {
    const logger = this.loggerFactory("getOrganizationAdminUser");
    logger.debug(
      { organizationId: this.organizationId },
      "Getting organization admin user",
    );
    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);
    // const user = await users.findOne({ organizationId: organizationId, role: "admin" });

    // TODO: Implement the logic to get the organization admin user once we have multiple users per organization
    const user = await users.findOne({
      organizationId: this.organizationId,
    });

    if (!user) {
      logger.warn(
        { organizationId: this.organizationId },
        "Organization admin user not found",
      );
      return null;
    }

    logger.debug(
      { organizationId: this.organizationId },
      "Organization admin user found",
    );
    return user;
  }
}
