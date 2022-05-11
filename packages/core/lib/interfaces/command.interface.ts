import { Respondable } from "./respondable.interface";

export interface ICommand extends Respondable {
  /**
   * System property to disable response processing if command
   * was triggered from a saga.
   */
  disableResponse?: boolean;
}
