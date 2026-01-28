import {
  IsString,
  IsDateString,
  IsOptional,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom Validator updated to handle null endDate
function IsDateAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const startValue = (args.object as any)[property];

          // start_date MUST exist
          if (startValue === null) {
            return false;
          }

          // end_date is optional → pass if missing
          if (value === null) {
            return true;
          }

          const startDate = new Date(startValue);
          const endDate = new Date(value);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }

          return startDate.getTime() < endDate.getTime();
        },
        defaultMessage() {
          return 'start_date must be earlier than end_date';
        },
      },
    });
  };
}

export class CreateDeviceWarrantyDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  warranty_provider: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  })
  start_date: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (value === null) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  })
  @IsDateAfter('start_date', {
    message: 'start_date must be earlier than end_date',
  })
  end_date: Date | null;
}
