import {createFilterProps} from './filterProps'

interface Entity {
  readonly id: number
}

interface Person {
  readonly firstName: string
  readonly lastName: string
}

interface PersonEntity extends Entity, Person {}

describe('filterProps', () => {

  const p: PersonEntity = {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
  }

  const filterProps = createFilterProps<Person>({
    firstName: true,
    lastName: true,
  })

  it('picks only relevant props', () => {
    const person = filterProps(p)
    expect(person).toEqual({
      firstName: 'John',
      lastName: 'Smith',
    })
  })

})
