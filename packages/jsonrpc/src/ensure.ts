import 'reflect-metadata'

export const ensureKey = Symbol('ensure')

export type Validate<Context> = (context: Context) => boolean

export function ensure<Context>(
  validate: Validate<Context>,
  message: string = 'Validation failed',
) {
  return (
    target: any,
    propertyKey: string,
    // tslint:disable-next-line
    descriptor: PropertyDescriptor,
  ) => {
    const validators: Array<Validate<Context>> =
      getValidatorsForMethod<Context>(target, propertyKey)

    validators.push(validate)

    Reflect.defineMetadata(ensureKey, validators, target, propertyKey)
  }
}

export function getValidatorsForMethod<Context>(
  target: any,
  method: string,
): Array<Validate<Context>> {
  return Reflect.getOwnMetadata(ensureKey, target, method) || []
}
