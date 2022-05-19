import { Injectable } from "@nestjs/common";
import { EventEmitter } from "events";
import { AsyncMap } from "../classes/async-map.class";
import { Distributor } from "../classes/distributor.class";
import { StateTracker } from "../classes/state-tracker.class";

/**
 * Centralize the generation of event based observables
 */
@Injectable()
export class ObservableFactory {
  private readonly _ee: EventEmitter;

  constructor() {
    this._ee = new EventEmitter();
  }

  public get emitter(): EventEmitter {
    return this._ee;
  }

  public generateAsyncMap<T>(): AsyncMap<T> {
    return new AsyncMap(this._ee);
  }

  public generateDistributor<T>(uuid: string): Distributor<T> {
    return new Distributor<T>(this._ee, uuid);
  }

  public generateStateTracker<T>(initialStatus: T): StateTracker<T> {
    return new StateTracker(initialStatus, this._ee);
  }
}
