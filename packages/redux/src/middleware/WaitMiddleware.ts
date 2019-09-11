import {TAsyncAction} from '../actions/TAsyncAction'
import {AnyAction, Middleware} from 'redux'

export class WaitMiddleware {
  protected notify?: (action: TAsyncAction<any, string>) => void
  protected recorders: Recorder[] = []

  handle: Middleware = store => next => (action: AnyAction) => {
    next(action)
    this.recorders.forEach(recorder => recorder.record(action))
    if (this.notify && 'status' in action) {
      this.notify(action as TAsyncAction<any, string>)
    }
  }

  /**
   * Starts recording actions and returns the recorder.
   */
  record(shouldRecord: ShouldRecord = defaultShouldRecord): Recorder {
    const recorder = new Recorder(shouldRecord)
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
    await this.wait(recorder.getActionTypes(), timeout)
  }

  /**
   * Waits for actions to be resolved or rejected. Times out after 10 seconds
   * by default.
   */
  async wait(actions: string[], timeout = 10000): Promise<void> {
    if (this.notify) {
      throw new Error('WaitMiddleware.wait - already waiting!')
    }

    const actionsByName = actions.reduce((obj, type) => {
      obj[type] = (obj[type] || 0) + 1
      return obj
    }, {} as Record<string, number>)
    let count = actions.length

    return new Promise((resolve, reject) => {
      if (!actions.length) {
        resolve()
        this.notify = undefined
        return
      }

      const t = setTimeout(() => {
        reject(new Error('WaitMiddleware.wait - timed out!'))
        this.notify = undefined
      }, timeout)

      this.notify = (action: TAsyncAction<any, string>) => {
        if (!actionsByName[action.type]) {
          return
        }
        switch (action.status) {
          case 'pending':
            return
          case 'resolved':
            actionsByName[action.type]--
            count--
            if (count === 0) {
              resolve()
              this.notify = undefined
            }
            return
          case 'rejected':
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

class Recorder {
  protected actionTypes: string[] = []

  constructor(protected readonly shouldRecord: ShouldRecord) {}

  getActionTypes(): string[] {
    return this.actionTypes.slice()
  }

  record(action: AnyAction) {
    if (this.shouldRecord(action)) {
      this.actionTypes.push(action.type)
    }
  }
}
