export async function createImageFromDataURL(
  dataURL: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Error reading image!'))
    image.src = dataURL
  })
}

export async function drawCanvasFromDataURL(
  dataURL: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const image = await createImageFromDataURL(dataURL)
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)
  return canvas
}

export async function getCanvasFromArrayBuffer(
  arrayBuffer: ArrayBuffer,
  width: number,
  height: number,
) {
  return new Promise(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const imageData = new ImageData(
      new Uint8ClampedArray(arrayBuffer),
      width,
      height,
    )
    canvas.width = width
    canvas.height = height
    ctx.putImageData(imageData, 0, 0)
  })
}
