import * as Files from './Files'

describe('Files', () => {

  const pngDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg' +
    'AAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const bytesString = atob(base64)
    const arrayBuffer = new ArrayBuffer(bytesString.length)
    const iArray = new Uint8Array(arrayBuffer)
    for (let i = 0; i < bytesString.length; i++) {
      iArray[i] = bytesString.charCodeAt(i)
    }
    return arrayBuffer
  }

  function dataURLToBlob(dataURL: string) {
    const [type, base64] = dataURL.split(';base64,', 2)
    const arrayBuffer = base64ToArrayBuffer(base64)

    return new Blob([arrayBuffer], {
      type: type.replace(/^data:/, ''),
    })
  }

  const pngBlob = dataURLToBlob(pngDataURL)

  describe('readAsDataURL', () => {
    it('asynchronously reads a file and returns a base64 string', async () => {
      const file = new File([pngBlob], 'test.png', {
        type: pngBlob.type,
      })
      const result = await Files.readAsDataURL(file)
      expect(result).toEqual(pngDataURL)
    })
  })

  describe('readAsArrayBuffer', () => {
    it('asynchronously reads a file and returns an ArrayBuffer', async () => {
      const base64 = pngDataURL.split(';base64,', 2)[1]
      const file = new File([pngBlob], 'test.png', {
        type: pngBlob.type,
      })
      const result = await Files.readAsArrayBuffer(file)
      expect(result).toEqual(base64ToArrayBuffer(base64))
    })
  })

  // describe('readAsArrayBuffer', () => {

  // })

})
