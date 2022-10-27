import { BaseCache, CACHE_OPTIONS, ICache } from "@moirae/core";
import { Inject, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { sha1 } from "object-hash";
import { Repository } from "typeorm";
import { KeyValue } from "../entities/key-value.entity";
import { SetRoot } from "../entities/set-root.entity";
import { SetValue } from "../entities/set-value.entity";
import { ITypeORMCacheConfig } from "../interfaces/typeorm-cache-config.interface";

export class TypeORMCache
  extends BaseCache
  implements ICache, OnApplicationBootstrap
{
  constructor(
    @InjectRepository(KeyValue)
    private readonly keyRepository: Repository<KeyValue>,
    @Inject(CACHE_OPTIONS) private readonly options: ITypeORMCacheConfig,
    @InjectRepository(SetRoot)
    private readonly setRootRepository: Repository<SetRoot>,
    @InjectRepository(SetValue)
    private readonly setValueRepository: Repository<SetValue>,
  ) {
    super();
  }

  public async dropKey(key: string): Promise<void> {
    await this.keyRepository.delete({ key: this.formatKey(key) });
  }

  public async dropSet(key: string): Promise<void> {
    const _key = this.formatKey(key);
    await this.setValueRepository.delete({ setKey: _key });
    await this.setRootRepository.delete({ key: _key });
  }

  private formatKey(key: string): string {
    return sha1({ key });
  }

  protected async handleAddToSet(key: string, value: string): Promise<boolean> {
    const _key = this.formatKey(key);
    const existing = await this.setValueRepository.findOne({
      where: { setKey: _key, value },
    });
    if (existing) return false;
    const keyCount = await this.setRootRepository.count({
      where: { key: _key },
    });
    if (keyCount > 0) {
      await this.setValueRepository.save({ setKey: _key, value });
    } else {
      await this.setRootRepository.save({
        key: _key,
        values: [{ value }],
      });
    }
    return true;
  }

  protected async handleGetKey(key: string): Promise<string> {
    const _key = this.formatKey(key);
    const entity = await this.keyRepository.findOne({ where: { key: _key } });
    if (!entity) return undefined;
    return entity.value;
  }

  protected async handleReadFromSet(key: string): Promise<string[]> {
    const _key = this.formatKey(key);
    const values = await this.setValueRepository.find({
      where: { setKey: _key },
    });
    return values.map((value) => value.value);
  }

  protected async handleRemoveFromSet(
    key: string,
    value: string,
  ): Promise<boolean> {
    const _key = this.formatKey(key);
    const entity = await this.setValueRepository.findOne({
      where: { setKey: _key, value },
    });
    if (!entity) return false;
    await this.setValueRepository.remove(entity);
    return true;
  }

  protected async handleSetKey(key: string, value: string): Promise<boolean> {
    const _key = this.formatKey(key);
    await this.keyRepository.save({ key: _key, value });
    return true;
  }

  public async onApplicationBootstrap() {
    if (this.options.clear) {
      await this.setValueRepository.delete({});
      await this.setRootRepository.delete({});
      await this.keyRepository.delete({});
    }
  }
}
