import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import {
  AUTH_PASSWORD_MAX_BYTES,
  AUTH_PASSWORD_MIN_LENGTH,
} from '../auth-security.config';

export function isAuthPasswordValid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length >= AUTH_PASSWORD_MIN_LENGTH &&
    Buffer.byteLength(value, 'utf8') <= AUTH_PASSWORD_MAX_BYTES
  );
}

export function IsAuthPassword(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isAuthPassword',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: isAuthPasswordValid,
        defaultMessage: ({ property }: ValidationArguments) =>
          `${property} deve ter ao menos ${AUTH_PASSWORD_MIN_LENGTH} caracteres e no máximo ${AUTH_PASSWORD_MAX_BYTES} bytes UTF-8`,
      },
    });
  };
}
