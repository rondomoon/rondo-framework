type CheckType<T> = (t: unknown) => t is T

export function guard<Expected>(
  checkType: CheckType<Expected>,
  t: unknown,
): Expected {
  if (!checkType(t)) {
    throw new Error(
      `Value ${t} does not satisfy constraint: ${checkType.name}`)
  }

  return t
}

export function isUndefined(t: unknown): t is undefined {
  return t === undefined
}

export function isNull(t: unknown): t is null {
  return t === null
}

export function isDefined<T>(
  t: unknown,
): t is T {
  return t !== undefined && t !== null
}

export function isNumber(t: unknown): t is number {
  return typeof t === 'number'
}

export function isString(t: unknown): t is string {
  return typeof t === 'string'
}
