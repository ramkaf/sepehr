import { Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export function DocumentProperty(
  options: ApiPropertyOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    ApiProperty(options)(target, propertyKey);
  };
}

export function DocumentDto<T extends Type<any>>(constructor: T): T {
  // You can add class-level documentation here if needed
  return constructor;
}
