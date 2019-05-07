import {TAsyncAction} from '../actions/TAsyncAction'
import {AnyAction, Middleware} from 'redux'

export class WaitMiddleware {
  protected notify?: (action: TAsyncAction<any, string>) => void

  handle: Middleware = store => next => (action: AnyAction) => {
    next(action)
    if (this.notify && 'status' in action) {
      this.notify(action as TAsyncAction<any, string>)
    }
  }

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
