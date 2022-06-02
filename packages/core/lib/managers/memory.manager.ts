import { Injectable } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { sha1 } from "object-hash";
import { IEvent } from "packages/core";
import { AggregateRoot } from "../classes/aggregate-root.class";
import { IManager } from "../interfaces/manager.interface";

@Injectable()
export class MemoryManager implements IManager {
  private _reservations: Set<string>;
  private _transactions: Map<string, Set<string>>;

  constructor() {
    this._reservations = new Set();
  }

  public async addEventToTransaction(
    event: IEvent,
    aggregate: ClassConstructor<AggregateRoot>,
  ): Promise<void> {
    if (!this._transactions.has(event.$correlationId))
      this._transactions.set(event.$correlationId, new Set());
    this._transactions
      .get(event.$correlationId)
      .add(`${aggregate.name}:${event.$streamId}`);
  }

  public async releaseValue(key: string, value: unknown): Promise<boolean> {
    const reservation = sha1({
      key,
      value,
    });
    if (!this._reservations.has(reservation)) return true;
    return this._reservations.delete(reservation);
  }

  public async reserveValue(key: string, value: unknown): Promise<boolean> {
    const reservation = sha1({
      key,
      value,
    });
    if (this._reservations.has(reservation)) return false;
    this._reservations.add(reservation);
    return true;
  }
}
