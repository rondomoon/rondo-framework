export function without<T, R extends Record<string, T>, K extends keyof R>(
  items: R,
  key: K,
): Pick<R, Exclude<keyof R, K>> {
  return Object.keys(items).reduce((obj, k) => {
    /* tslint:disable-next-line */
    if (key == k) {
      return obj
    }
    (obj as any)[k] = items[k] // eslint-disable-line
    return obj
  }, {} as Pick<R, Exclude<keyof R, K>>)
}
