import { Explorer } from "@moirae/core";
import {
  RegisterCommandHandlerInput,
  RegisterContainerInput,
} from "../interfaces/register-container-input.interface";

type RegisterInput = RegisterContainerInput & RegisterCommandHandlerInput;

export class Container implements Omit<Explorer, "_modulesContainer"> {
  private _providers: RegisterContainerInput[];

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
