import { Respondable } from "./respondable.interface";

export interface IQuery extends Respondable {
  $executionDomain: string;
}
