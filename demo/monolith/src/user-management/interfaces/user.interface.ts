import { UserType } from "../user-management.constants";

export interface IUser {
  id: string;
  email: string;
  userType: UserType;
}
