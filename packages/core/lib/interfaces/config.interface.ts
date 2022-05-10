import { ClassConstructor } from "class-transformer";
import { IPublisher } from "./publisher.interface";

export interface IConfig {
  externalTypes?: ClassConstructor<unknown>[];
  publisher?: ClassConstructor<IPublisher>;
}
