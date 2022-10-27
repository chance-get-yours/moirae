import { Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";

/**
 * Index and cache all providers in the current application. Used for finding all
 * handlers and sagas.
 */
@Injectable()
export class Explorer {
  private _providers: InstanceWrapper[];
  constructor(private readonly _modulesContainer: ModulesContainer) {}

  /**
   * Get all providers in the current application. Will lazy load from the modules container
   */
  public getProviders(): InstanceWrapper[] {
    if (!this._providers)
      this._providers = [...this._modulesContainer.values()].flatMap(
        (module) => [...module.providers.values()],
      );
    return this._providers;
  }
}
