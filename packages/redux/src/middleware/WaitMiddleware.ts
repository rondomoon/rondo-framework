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
   * Starts recording pending actions and returns the recorder.
   */
  record(): Recorder {
    const recorder = new Recorder()
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
      obj[type] = true
      return obj
    }, {} as Record<string, boolean>)
    // no duplicates here so we cannot use actions.length
    let count = Object.keys(actionsByName).length

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
            actionsByName[action.type] = false
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

class Recorder {
  protected actionTypes: string[] = []

  getActionTypes(): string[] {
    return this.actionTypes.slice()
  }

  record(action: AnyAction) {
    if ('status' in action && action.status === 'pending') {
      this.actionTypes.push(action.type)
    }
  }
}
