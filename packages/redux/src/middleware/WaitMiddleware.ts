import {AsyncAction} from '../actions/AsyncAction'
import {AnyAction, Middleware} from 'redux'

export class WaitMiddleware {
  protected notify?: (action: AsyncAction<unknown, string>) => void
  protected recorders: Recorder[] = []

  handle: Middleware = () => next => (action: AnyAction) => {
    next(action)
    this.recorders.forEach(recorder => recorder.record(action))
    if (this.notify && 'status' in action) {
      this.notify(action as AsyncAction<unknown, string>)
    }
  }

  /**
   * Starts recording actions and returns the recorder.
   */
  record(
    shouldRecord: ShouldRecord = defaultShouldRecord,
    shouldResolve: ShouldRecord = defaultShouldResolve,
    shouldReject: ShouldRecord = defaultShouldReject,
  ): Recorder {
    const recorder = new Recorder(shouldRecord, shouldResolve, shouldReject)
    this.recorders.push(recorder)
    return recorder
  }

  /**
   * Stops recording pending actions
   */
  stopRecording(recorder: Recorder): void {
    const index = this.recorders.indexOf(recorder)
    this.recorders.splice(index, index + 1)
  }

  /**
   * Stops recording, Waits for recorded pending actions to be resolved or
   * rejected. Throws an error if any actions is rejected.
   */
  async waitForRecorded(recorder: Recorder, timeout?: number): Promise<void> {
    this.stopRecording(recorder)
    const error = recorder.getError()
    if (error) {
      return Promise.reject(error)
    }
    await this.wait(recorder.getActionTypes(), timeout)
  }

  /**
   * Waits for actions to be resolved or rejected. Times out after 10 seconds
   * by default.
   */
  async wait(actions: Record<string, number>, timeout = 10000): Promise<void> {
    if (this.notify) {
      throw new Error('WaitMiddleware.wait - already waiting!')
    }

    let count = Object.keys(actions).reduce((count, type) => {
      return count + actions[type]
    }, 0)

    return new Promise((resolve, reject) => {
      if (!count) {
        resolve()
        this.notify = undefined
        return
      }

      const t = setTimeout(() => {
        reject(new Error('WaitMiddleware.wait - timed out!'))
        this.notify = undefined
      }, timeout)

      this.notify = (action: AsyncAction<unknown, string>) => {
        if (!actions[action.type]) {
          return
        }
        switch (action.status) {
          case 'pending':
            return
          case 'resolved':
            actions[action.type]--
            count--
            if (count === 0) {
              clearTimeout(t)
              resolve()
              this.notify = undefined
            }
            return
          case 'rejected':
            clearTimeout(t)
            reject(action.payload)
            this.notify = undefined
            return
        }
      }
    })
  }
}

/**
 * Returns true when an action should be recorded, false otherwise
 */
export type ShouldRecord = (action: AnyAction) => boolean

export const defaultShouldRecord: ShouldRecord =
  (action: AnyAction) => 'status' in action && action.status === 'pending'
export const defaultShouldResolve: ShouldRecord =
  (action: AnyAction) => 'status' in action && action.status === 'resolved'
export const defaultShouldReject: ShouldRecord =
  (action: AnyAction) => 'status' in action && action.status === 'rejected'

class Recorder {
  protected actionTypes: Record<string, number> = {}
  protected error?: Error

  constructor(
    protected readonly shouldRecord: ShouldRecord,
    protected readonly shouldResolve: ShouldRecord,
    protected readonly shouldReject: ShouldRecord,
  ) {}

  getActionTypes() {
    return {...this.actionTypes}
  }

  getError() {
    return this.error
  }

  record(action: AnyAction) {
    if (this.shouldRecord(action)) {
      this.actionTypes[action.type] = (this.actionTypes[action.type] || 0) + 1
    }
    if (this.shouldResolve(action)) {
      this.actionTypes[action.type] = (this.actionTypes[action.type] || 0) - 1
    }
    if (this.shouldReject(action)) {
      this.actionTypes[action.type] = (this.actionTypes[action.type] || 0) - 1
      this.error = action.payload
    }
  }
}
