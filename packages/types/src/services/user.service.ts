import { User } from "../users/user";

export interface IUserService {
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, user: Partial<User>): Promise<User | null>;
  getOrganizationAdminUser(): Promise<User | null>;
}
