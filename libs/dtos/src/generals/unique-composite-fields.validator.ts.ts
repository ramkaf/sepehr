import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationOptions } from 'joi';

// unique-composite-fields.validator.ts
@ValidatorConstraint({ name: 'UniqueCompositeFields', async: false })
export class UniqueCompositeFieldsConstraint implements ValidatorConstraintInterface {
  validate(items: any[], args: ValidationArguments) {
    const [fieldNames] = args.constraints;
    if (!items?.length) return true;

    const compositeKeys = items.map((item) =>
      fieldNames.map((field: any) => item[field]).join('|'),
    );

    const duplicates = compositeKeys.filter(
      (key, index) =>
        compositeKeys.indexOf(key) !== index && !key.includes('undefined'),
    );

    args.constraints[1] = duplicates; // Pass duplicates to error message
    return duplicates.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [fieldNames, duplicates] = args.constraints;
    if (!duplicates?.length)
      return `Combination of fields [${fieldNames.join(', ')}] must be unique.`;

    const duplicateExamples = duplicates.slice(0, 3).join(', '); // Show max 3 examples
    return `Duplicate combinations found for [${fieldNames.join(
      ', ',
    )}]: ${duplicateExamples}${duplicates.length > 3 ? '...' : ''}`;
  }
}

// Decorator
export function UniqueCompositeFields(
  fieldNames: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fieldNames, []], // Initialize duplicates array
      validator: UniqueCompositeFieldsConstraint,
    });
  };
}
