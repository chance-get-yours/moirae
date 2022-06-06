import { Injectable } from "@nestjs/common";
import { sha1 } from "object-hash";
import { IManager } from "../interfaces/manager.interface";

@Injectable()
export class MemoryManager implements IManager {
  private _reservations: Set<string>;

  constructor() {
    this._reservations = new Set();
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
