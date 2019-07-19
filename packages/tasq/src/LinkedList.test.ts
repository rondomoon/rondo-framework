import {LinkedList} from './LinkedList'

describe('LinkedList', () => {

  describe('static fromArray', () => {
    it('creates a LinkedList from array', () => {
      const array = [0, 1, 2, 3, 4, 5]
      const ll = LinkedList.fromArray(array)
      expect(ll.toArray()).toEqual(array)
    })
  })

  describe('push', () => {

  })

  describe('peek', () => {

  })

  describe('pop', () => {

  })

})
