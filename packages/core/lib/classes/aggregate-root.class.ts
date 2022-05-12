import { instanceToPlain } from "class-transformer";
import { UnavailableCommitError } from "../exceptions/commit-unavailable.error";
import { InvalidMultipleSetError } from "../exceptions/invalid-mutliple-set.error";
import { UnhandledEventError } from "../exceptions/unhandled-event.error";
import { AggregateFactory } from "../factories/aggregate.factory";
import { IEvent } from "../interfaces/event.interface";
import { APPLY_METADATA, PROJECTION_METADATA } from "../moirae.constants";

type IEventCommitFn = typeof AggregateFactory.prototype.commitEvents;

export abstract class AggregateRoot<Projection = Record<string, unknown>> {
  protected _commitFn: IEventCommitFn;
  /**
   * History of all events applied to this aggregate in order
   */
  protected _eventHistory: IEvent[];
  protected _lastCommittedIndex: number;
  /**
   * Timestamp of the last applied event
   */
  public updatedAt: Date;

  constructor(public readonly streamId: string) {
    this._eventHistory = new Array<IEvent>();
  }

  /**
   * All events that have been applied to the aggregate
   */
  public get eventHistory(): IEvent[] {
    return this._eventHistory;
  }

  /**
   * The list of all uncommitted events to be persisted
   */
  public get uncommittedEventHistory(): IEvent[] {
    const uncommittedStart = this._lastCommittedIndex + 1;
    if (uncommittedStart >= this._eventHistory.length) return [];
    return this._eventHistory.slice(uncommittedStart);
  }

  /**
   * Apply an event to the aggregate and execute a state change
   */
  public apply(event: IEvent): void;
  /**
   * Apply an event to the aggregate from the database. Generally not meant to be called
   * outside aggregate population.
   */
  public apply(event: IEvent, fromHistory: boolean): void;
  public apply(event: IEvent, fromHistory = false): void {
    const handlerName = Reflect.getMetadata(
      `${APPLY_METADATA}:${event.name}`,
      this,
    );
    if (!handlerName) throw new UnhandledEventError(this, event);
    this[handlerName].call(this, event);
    if (!event.streamId) event.streamId = this.streamId;
    const len = this._eventHistory.push(event);
    if (fromHistory) this._lastCommittedIndex = len - 1;
    this.updatedAt = event.timestamp;
  }

  /**
   * Commit all uncommitted events to the store
   */
  public async commit() {
    if (!this._commitFn) throw new UnavailableCommitError(this);
    await this._commitFn(this.uncommittedEventHistory);
  }

  public setCommitFunction(fn: IEventCommitFn) {
    if (this._commitFn) throw new InvalidMultipleSetError(this, "_commitFn");
    this._commitFn = fn;
  }

  /**
   * Return a plain javascript object matching the projection interface. Useful
   * in generating a projection from the current state of the aggregate.
   */
  public toProjection(): Projection {
    return instanceToPlain(this, {
      groups: [PROJECTION_METADATA],
      strategy: "excludeAll",
    }) as Projection;
  }
}
