import 'reflect-metadata'

export const ensureKey = Symbol('ensure')
export const ensureClassKey = Symbol('ensureClass')

export type Validate<Context> = (context: Context) => boolean | Promise<boolean>

export function ensure<Context>(
  validate: Validate<Context>,
  message: string = 'Validation failed',
) {
  return function ensureImpl(
    target: any, key?: string, descriptor?: PropertyDescriptor) {
    switch (arguments.length) {
      case 1:
        return ensureClass(validate, message).apply(null, arguments as any)
      case 3:
        return ensureMethod(validate, message).apply(null, arguments as any)
      default:
        throw new Error('Unexpected number of arguments for @ensure. ' +
          'It can only be used as as class or method decorator')
    }
  }
}

function ensureClass<Context>(
  validate: Validate<Context>,
  message: string = 'Validation failed',
) {
  // tslint:disable-next-line
  return (target: any) => {
    const validators: Array<Validate<Context>> =
      getValidatorsForClass<Context>(target)

    validators.push(validate)

    Reflect.defineMetadata(ensureKey, validators, target)
  }
}

function ensureMethod<Context>(
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

export function getValidatorsForInstance<Context>(
  target: any,
): Array<Validate<Context>> {
  return getValidatorsForClass(Object.getPrototypeOf(target).constructor)
}

export function getValidatorsForClass<Context>(
  target: any,
): Array<Validate<Context>> {
  return Reflect.getMetadata(ensureKey, target) || []
}

export function getValidatorsForMethod<Context>(
  target: any,
  method: string,
): Array<Validate<Context>> {
  return Reflect.getMetadata(ensureKey, target, method) || []
}
