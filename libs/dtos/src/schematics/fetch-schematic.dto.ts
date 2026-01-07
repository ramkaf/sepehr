import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  ValidationArguments,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsUUID,
} from 'class-validator';

@ValidatorConstraint({ name: 'XorPlantOrId', async: false })
export class XorPlantOrIdConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as any;
    const hasPlantId =
      object.plantUuid !== undefined && object.plantUuid !== null;
    const hasId = object.uuid !== undefined && object.uuid !== null;
    // Must have exactly one of them
    return (hasPlantId || hasId) && !(hasPlantId && hasId);
  }

  defaultMessage() {
    return 'Either "plantUuid" or "uuid" must be provided, but not both.';
  }
}

export class GetSchematicsDto {
  @ApiPropertyOptional({
    description: 'Plant UUID to filter schematics by plant',
  })
  @IsOptional()
  @IsUUID()
  plantUuid?: string;

  @ApiPropertyOptional({
    description: 'UUID of a specific schematic',
  })
  @IsOptional()
  @IsUUID()
  uuid?: string;

  @Validate(XorPlantOrIdConstraint)
  xorCheck!: boolean; // dummy property (won’t appear in Swagger)
}
