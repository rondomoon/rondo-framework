export function createFilterProps<T>(schema: Record<keyof T & string, true>) {
  return function filterProps<U extends T>(item: U): T {
    return Object.keys(schema).reduce((obj: T, key) => {
      obj[key as keyof T] = item[key as keyof T]
      return obj
    }, {} as T)
  }
}
