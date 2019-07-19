export interface IQueue<T> {
  push(...t: T[]): void
  pop(): T | undefined
  peek(): T | undefined
  toArray(): T[]
}

interface INode<T> {
  value: T
  next?: INode<T>
}

export class LinkedList<T> implements IQueue<T> {
  length = 0

  protected head: INode<T> | undefined
  protected tail: INode<T> | undefined

  push(...t: T[]) {
    t.forEach(value => {
      const node: INode<T> = {value}
      if (!this.length) {
        this.head = this.tail = node
        this.length = 1
        return
      }
      this.tail!.next = node
      this.tail = node
      this.length++
    })
  }

  peek(): T | undefined {
    return this.head && this.head.value
  }

  pop(): T | undefined {
    if (!this.length) {
      return undefined
    }
    if (this.length === 1) {
      const value = this.head!.value
      this.head = this.tail = undefined
      this.length = 0
      return value
    }
    const head = this.head!
    this.head = head.next
    this.length--
    return head.value
  }

  toArray(): T[] {
    const array: T[] = []
    for (let h = this.head; h !== undefined; h = h.next) {
      array.push(h.value)
    }
    return array
  }

  static fromArray<T>(t: T[]): LinkedList<T> {
    const list = new LinkedList<T>()
    list.push(...t)
    return list
  }
}
