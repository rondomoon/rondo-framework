import { Namespace } from 'cls-hooked'

export class NamespaceMock implements Namespace {
  readonly context: {[key: string]: any} = {}
  readonly active: {[key: string]: any} = this.context

  set<T>(key: string, value: T): T {
    this.context[key] = value
    return value
  }
  get(key: string) {
    return this.context[key]
  }

  // tslint:disable-next-line
  run(fn: Function) {
    return fn(this.context)
  }

  // tslint:disable-next-line
  bind<F extends Function>(fn: F, context?: any): F {
    return fn
  }

  bindEmitter(fn: any) {/* do not do anything */}

  runAndReturn<T>(fn: (...args: any[]) => T): T {
    return fn(this.context)
  }

  runPromise<T>(fn: (...args: any[]) => Promise<T>): Promise<T> {
    return fn(this.context)
  }

  createContext(): any {/* do not do anything*/}

  enter(context: any) {/* do not do anything*/}

  exit(context: any) {/* do not do anything*/}
}

export const namespace = new NamespaceMock()
