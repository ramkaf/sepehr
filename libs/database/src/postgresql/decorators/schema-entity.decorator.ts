import { Entity, EntityOptions } from 'typeorm';

export function SchemaEntity(
  schema: string,
  name: string,
  options?: Omit<EntityOptions, 'name'>,
) {
  return Entity({
    name,
    schema,
    ...options,
  });
}
