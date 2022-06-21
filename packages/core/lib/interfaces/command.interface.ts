import { Respondable } from "./respondable.interface";

export interface ICommand extends Respondable {
  /**
   * UUID related to a single "transaction" within the system, passed
   * from commands to events to commands etc...
   */
  $correlationId?: string;
}