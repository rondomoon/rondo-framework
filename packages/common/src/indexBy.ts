export function indexBy<T extends object, K extends keyof T>(
  items: T[],
  key: T[K] extends string | number ? K : never,
) {
  return items.reduce((obj, item) => {
    obj[String(item[key])] = item
    return obj
  }, {} as {[k: string]: T})
}
