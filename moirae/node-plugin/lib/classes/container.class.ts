import { Explorer } from "@moirae/core";
import {
  RegisterCommandHandlerInput,
  RegisterContainerInput,
  RegisterQueryHandlerInput,
} from "../interfaces/register-container-input.interface";

type RegisterInput =
  | RegisterContainerInput
  | RegisterCommandHandlerInput
  | RegisterQueryHandlerInput;

/**
 * Internal replacement for the @moirae/core Explorer class
 */
export class Container implements Omit<Explorer, "_modulesContainer"> {
  private _providers: RegisterInput[];

  constructor() {
    this._providers = [];
  }

  public getInstances(): RegisterContainerInput[] {
    return this._providers;
  }

  public getProviders(): any[] {
    return [];
  }

  public register(container: RegisterInput): void {
    this._providers.push(container);
  }
}
