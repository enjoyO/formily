import { isFn, isStr, isArr, Subscribable } from '@formily/shared'
import { FormLifeCycle } from './FormLifeCycle'

export class FormHeart<Payload = any, Context = any> extends Subscribable {
  private lifecycles: FormLifeCycle<Payload>[]

  private context: Context

  private beforeNotify?: (...args: any[]) => void

  private afterNotify?: (...args: any[]) => void

  private batching?: boolean

  private buffer?: any[]

  constructor({
    lifecycles,
    context,
    beforeNotify,
    afterNotify
  }: {
    lifecycles?: FormLifeCycle[]
    context?: Context
    beforeNotify?: (...args: any[]) => void
    afterNotify?: (...args: any[]) => void
  } = {}) {
    super()
    this.lifecycles = this.buildLifeCycles(lifecycles || [])
    this.context = context
    this.buffer = []
    this.beforeNotify = beforeNotify
    this.afterNotify = afterNotify
  }

  buildLifeCycles(lifecycles: FormLifeCycle[]) {
    return lifecycles.reduce((buf, item) => {
      if (item instanceof FormLifeCycle) {
        return buf.concat(item)
      } else {
        if (typeof item === 'object') {
          this.context = item
          return buf
        } else if (isArr(item)) {
          return this.buildLifeCycles(item)
        }
        return buf
      }
    }, [])
  }

  batch = (callback?: () => void) => {
    if (isFn(callback)) {
      this.batching = true
      this.buffer = []
      callback()
      this.batching = false
      this.buffer.forEach(({ type, payload, context }) => {
        this.publish(type, payload, context)
      })
      this.buffer = []
    }
  }

  publish = <P, C>(type: any, payload: P, context?: C) => {
    if (this.batching) {
      this.buffer.push({
        type,
        payload,
        context
      })
      return
    }
    if (isStr(type)) {
      if (isFn(this.beforeNotify)) {
        this.beforeNotify(type, payload, context)
      }
      this.lifecycles.forEach(lifecycle => {
        lifecycle.notify(type, payload, context || this.context)
      })
      this.notify({
        type,
        payload
      })
      if (isFn(this.afterNotify)) {
        this.afterNotify(type, payload, context)
      }
    }
  }
}
