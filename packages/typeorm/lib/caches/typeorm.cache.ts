import { BaseCache, ICache } from "@moirae/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KeyValue } from "../entities/key-value.entity";

export class TypeORMCache extends BaseCache implements ICache {
  constructor(
    @InjectRepository(KeyValue)
    private readonly keyRepository: Repository<KeyValue>,
  ) {
    super();
  }

  public async dropKey(key: string): Promise<void> {
    await this.keyRepository.delete({ key });
  }

  dropSet(key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected handleAddToSet(key: string, value: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  protected async handleGetKey(key: string): Promise<string> {
    const entity = await this.keyRepository.findOne({ where: { key } });
    if (!entity) return undefined;
    return entity.value;
  }

  protected handleReadFromSet(key: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected handleRemoveFromSet(key: string, value: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  protected async handleSetKey(key: string, value: string): Promise<boolean> {
    await this.keyRepository.save({ key, value });
    return true;
  }
}
