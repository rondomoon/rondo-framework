import {createFilterProps} from './filterProps'

interface IEntity {
  readonly id: number
}

interface IPerson {
  readonly firstName: string
  readonly lastName: string
}

interface IPersonEntity extends IEntity, IPerson {}

describe('filterProps', () => {

  const p: IPersonEntity = {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
  }

  const filterProps = createFilterProps<IPerson>({
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
