export interface IQueue<T> {
  push(...t: T[]): void
  shift(): T | undefined
  peek(): T | undefined
  toArray(): T[]
}

interface INode<T> {
  value: T
  next?: INode<T>
}

export interface IIterator<T> {
  hasNext(): boolean
  next(): T | undefined
}

export class LinkedListIterator<T> implements IIterator<T> {
  constructor(protected node: INode<T> | undefined) {
  }
  hasNext() {
    return this.node !== undefined
  }
  next(): T | undefined {
    if (this.node === undefined) {
      return undefined
    }
    const node = this.node
    const {value} = node
    this.node = node.next
    return value
  }
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

  shift(): T | undefined {
    if (!this.length) {
      return undefined
    }
    const head = this.head!
    this.head = head.next
    this.length--
    return head.value
  }

  clear() {
    this.head = this.tail = undefined
    this.length = 0
  }

  toArray(): T[] {
    const array: T[] = []
    for (let h = this.head; h !== undefined; h = h.next) {
      array.push(h.value)
    }
    return array
  }

  iterator(): LinkedListIterator<T> {
    return new LinkedListIterator(this.head)
  }

  static fromArray<T>(t: T[]): LinkedList<T> {
    const list = new LinkedList<T>()
    list.push(...t)
    return list
  }
}
