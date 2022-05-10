import { Injectable } from "@nestjs/common";
import { EventEmitter } from "events";
import { StateTracker } from "../classes/state-tracker.class";

@Injectable()
export class ObservableFactory {
  private readonly _ee: EventEmitter;

  constructor() {
    this._ee = new EventEmitter();
  }

  public get emitter(): EventEmitter {
    return this._ee;
  }

  public generateStateTracker<T>(initialStatus: T): StateTracker<T> {
    return new StateTracker(initialStatus, this._ee);
  }
}
