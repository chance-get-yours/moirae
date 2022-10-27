import { IUser } from "./user.interface";

export interface ICustomer extends IUser {
  companyName: string;
  customerId: string;
}
