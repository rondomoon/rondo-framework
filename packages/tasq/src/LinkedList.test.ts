import {LinkedList} from './LinkedList'

describe('LinkedList', () => {

  describe('static fromArray', () => {
    it('creates a LinkedList from array', () => {
      const array = [0, 1, 2, 3, 4, 5]
      const ll = LinkedList.fromArray(array)
      expect(ll.toArray()).toEqual(array)
    })
  })

  describe('clear', () => {
    it('clears the array and sets length to 0', () => {
      const array = [0, 1, 2, 3, 4, 5]
      const ll = LinkedList.fromArray(array)
      expect(ll.length).toBe(6)
      ll.clear()
      expect(ll.length).toBe(0)
      expect(ll.toArray()).toEqual([])
    })
  })

  describe('push', () => {
    it('pushes a new element to the end', () => {
      const ll = new LinkedList()
      ll.push(0)
      expect(ll.length).toBe(1)
      ll.push(1)
      expect(ll.length).toBe(2)
      ll.push(2, 3)
      expect(ll.length).toBe(4)
      ll.push(4, 5, 6)
      expect(ll.length).toBe(7)
      expect(ll.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe('peek', () => {
    it('returns the next element', () => {
      const ll = new LinkedList()
      expect(ll.peek()).toEqual(undefined)
      expect(ll.peek()).toEqual(undefined)
      ll.push(1)
      expect(ll.peek()).toEqual(1)
      expect(ll.peek()).toEqual(1)
      ll.push(2)
      expect(ll.peek()).toEqual(1)
      expect(ll.peek()).toEqual(1)
      ll.clear()
      expect(ll.peek()).toEqual(undefined)
    })
  })

  describe('shift', () => {
    it('returns the first element and shifts the linked list', () => {
      const ll = LinkedList.fromArray([0, 1, 2, 3])
      expect(ll.length).toBe(4)
      expect(ll.shift()).toEqual(0)
      expect(ll.length).toBe(3)
      expect(ll.shift()).toEqual(1)
      expect(ll.length).toBe(2)
      expect(ll.shift()).toEqual(2)
      expect(ll.length).toBe(1)
      expect(ll.shift()).toEqual(3)
      expect(ll.length).toBe(0)
      expect(ll.shift()).toEqual(undefined)
      expect(ll.length).toBe(0)
      expect(ll.shift()).toEqual(undefined)
      expect(ll.length).toBe(0)
    })
  })

})
