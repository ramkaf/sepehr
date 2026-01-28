// src/common/services/base.service.ts
import { NotFoundException } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';

export class BaseService<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    private readonly entityName: string,
  ) {}

  save(schema: DeepPartial<T>): Promise<T> {
    return this.repository.save(schema);
  }

  async findOne(uuid: string): Promise<T | null> {
    return await this.repository.findOne({
      where: { uuid } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.save(entity);
  }

  async update(uuid: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(uuid);
    if (!entity)
      throw new NotFoundException(
        `${this.entityName} with UUID "${uuid}" not found`,
      );
    Object.assign(entity, data);
    return await this.save(entity);
  }

  async destroy(uuid: string): Promise<void> {
    const entity = await this.findOne(uuid);
    if (!entity)
      throw new NotFoundException(
        `${this.entityName} with UUID "${uuid}" not found`,
      );
    await this.repository.remove(entity);
  }
}
