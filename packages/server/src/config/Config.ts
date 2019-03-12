export class Config {
  constructor(protected readonly config: any) {}

  get(key: string) {
    let value = this.config
    key.split('.').forEach(k => {
      if (!value.hasOwnProperty(k)) {
        throw new Error(`Property "${k}" from "${key}" does not exist`)
      }
      value = value[k]
    })
    return value
  }

  has(key: string) {
    let c = this.config
    return key.split('.').every(k => {
      const has = c.hasOwnProperty(k)
      if (has) {
        c = c[k]
      }
      return has
    })
  }

  value() {
    return this.config
  }
}
