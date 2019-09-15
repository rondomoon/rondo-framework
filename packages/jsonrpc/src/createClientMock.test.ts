import createClientMock from './createClientMock'

describe('createClientMock', () => {

  interface Service {
    add(a: number, b: number): number
    concat(a: string, b: string): string
  }

  it('creates a mock for all methods', async () => {
    const [client, mock] = createClientMock<Service>(['add', 'concat'])
    mock.add.mockReturnValue(Promise.resolve(3))
    mock.concat.mockImplementation((a, b) => Promise.resolve(a + b))
    expect(await client.add(4, 5)).toBe(3)
    expect(await client.concat('a', 'b')).toBe('ab')
  })

})
