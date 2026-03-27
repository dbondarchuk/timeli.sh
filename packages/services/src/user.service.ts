import { IUserService, User } from "@timelish/types";
import { ObjectId } from "mongodb";
import { USERS_COLLECTION_NAME } from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class UserService extends BaseService implements IUserService {
  public constructor(companyId: string) {
    super("UserService", companyId);
  }

  public async getUser(userId: string): Promise<User | null> {
    const logger = this.loggerFactory("getUser");
    logger.debug({ userId: userId, companyId: this.companyId }, "Getting user");
    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);

    const user = await users.findOne({
      _id: new ObjectId(userId),
      organizationId: this.companyId,
    });

    if (!user) {
      logger.warn({ userId, companyId: this.companyId }, "User not found");
      return null;
    }

    logger.debug({ userId, companyId: this.companyId }, "User found");
    return user;
  }

  public async updateUser(
    userId: string,
    user: Partial<User>,
  ): Promise<User | null> {
    const logger = this.loggerFactory("updateUser");
    logger.debug({ user: user, companyId: this.companyId }, "Updating user");

    const { _id, ...update } = user;

    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);
    const result = await users.updateOne(
      { _id: new ObjectId(userId), organizationId: this.companyId },
      { $set: update },
    );
    if (!result.upsertedCount) {
      logger.warn({ userId, companyId: this.companyId }, "User not updated");
      return null;
    }

    const updatedUser = await users.findOne({
      _id: new ObjectId(userId),
      organizationId: this.companyId,
    });
    if (!updatedUser) {
      logger.warn(
        { userId, companyId: this.companyId },
        "User not found after update",
      );
      return null;
    }

    logger.debug({ userId, companyId: this.companyId }, "User updated");
    return updatedUser;
  }

  public async getOrganizationAdminUser(
    organizationId: string,
  ): Promise<User | null> {
    const logger = this.loggerFactory("getOrganizationAdminUser");
    logger.debug(
      { organizationId: organizationId, companyId: this.companyId },
      "Getting organization admin user",
    );
    const db = await getDbConnection();
    const users = db.collection<User>(USERS_COLLECTION_NAME);
    // const user = await users.findOne({ organizationId: organizationId, role: "admin" });

    // TODO: Implement the logic to get the organization admin user once we have multiple users per organization
    const user = await users.findOne({
      organizationId: this.companyId,
    });

    if (!user) {
      logger.warn(
        { organizationId: organizationId, companyId: this.companyId },
        "Organization admin user not found",
      );
      return null;
    }

    logger.debug(
      { organizationId: organizationId, companyId: this.companyId },
      "Organization admin user found",
    );
    return user;
  }
}
