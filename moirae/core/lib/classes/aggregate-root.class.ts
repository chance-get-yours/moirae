import { instanceToPlain } from "class-transformer";
import { sha1 } from "object-hash";
import { AggregateDeletedError } from "../exceptions/aggregate-deleted.error";
import { UnavailableCommitError } from "../exceptions/commit-unavailable.error";
import { InvalidMultipleSetError } from "../exceptions/invalid-mutliple-set.error";
import { UnhandledEventError } from "../exceptions/unhandled-event.error";
import { AggregateFactory } from "../factories/aggregate.factory";
import { ICache } from "../interfaces/cache.interface";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import {
  APPLY_METADATA,
  PROJECTION_METADATA,
  ROLLBACK_METADATA,
} from "../moirae.constants";

type IEventCommitFn = typeof AggregateFactory.prototype.commitEvents;

/**
 * Base class to provide Aggregate functionality
 */
export abstract class AggregateRoot<Projection = Record<string, unknown>> {
  private _cacheController: ICache;
  private _commitFn: IEventCommitFn;
  /**
   * History of all events applied to this aggregate in order
   */
  protected _eventHistory: IEvent[];
  protected _lastCommittedIndex: number;
  /**
   * Mark the instance as deleted
   */
  public deleted: boolean;
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
    if (this.deleted && !fromHistory) throw new AggregateDeletedError(this);
    const handlerName = Reflect.getMetadata(
      `${APPLY_METADATA}:${event.$name}`,
      this,
    );
    if (!handlerName) throw new UnhandledEventError(this, event);
    this[handlerName].call(this, event);
    if (!event.$streamId) event.$streamId = this.streamId;
    const len = this._eventHistory.push(event);
    if (fromHistory) this._lastCommittedIndex = len - 1;
    this.updatedAt = event.$timestamp;
  }

  /**
   * Commit all uncommitted events to the store
   */
  public async commit(): Promise<void>;
  /**
   * Commit all uncommitted events to the store and link those events
   * to the provided Command via `Command.$correlationId`. Additionally pass
   * on any metadata included as part of the command.
   */
  public async commit(initiatorCommand: ICommand): Promise<void>;
  public async commit(initiatorCommand?: ICommand): Promise<void> {
    if (!this._commitFn) throw new UnavailableCommitError(this);
    await this._commitFn(
      this.uncommittedEventHistory.map((event) => {
        if (!event.$correlationId)
          event.$correlationId = initiatorCommand?.$correlationId;
        if (initiatorCommand?.$metadata)
          event.$metadata = {
            ...(event.$metadata || {}),
            ...initiatorCommand.$metadata,
          };
        return event;
      }),
    );
  }

  /**
   * Get a duplicate of the current aggregate in the state it was prior to the application
   * of the specified event.
   */
  protected getAggregatePriorTo<T extends AggregateRoot<Projection>>(
    event: IEvent,
  ): T {
    const aggregate: T = Object.create(this, {
      streamId: { value: this.streamId, writable: false },
    });
    let idx = 0;
    while (
      this._eventHistory[idx].$uuid !== event.$uuid &&
      idx < this._eventHistory.length
    ) {
      aggregate.apply(this._eventHistory[idx], true);
      idx++;
    }
    return aggregate;
  }

  /**
   * Release a value previously reserved
   */
  public async releaseValue<T = unknown>(
    propertyName: string,
    value: T,
  ): Promise<boolean> {
    return this._cacheController.removeFromSet(
      `${this.constructor.name}__${propertyName}`,
      sha1({ value }),
    );
  }

  /**
   * Reserve a value to ensure uniqueness
   */
  public async reserveValue<T = unknown>(
    propertyName: string,
    value: T,
  ): Promise<boolean> {
    return this._cacheController.addToSet(
      `${this.constructor.name}__${propertyName}`,
      sha1({ value }),
    );
  }

  /**
   * Rollback all events with a specific correlationId
   *
   * @returns Number of events rolled back
   */
  public rollback(correlationId: string): number {
    return this._eventHistory
      .filter((event) => event.$correlationId === correlationId)
      .reverse()
      .map((event) => {
        const handlerName = Reflect.getMetadata(
          `${ROLLBACK_METADATA}:${event.$name}`,
          this,
        );
        if (!handlerName) throw new UnhandledEventError(this, event);
        const rollbackEvent: IEvent = this[handlerName].call(this, event);
        rollbackEvent.$correlationId = correlationId;
        return rollbackEvent;
      })
      .map((rollbackEvent) => this.apply(rollbackEvent)).length;
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
