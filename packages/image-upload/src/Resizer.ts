interface IWorkerParam {
  sourceWidth: number
  sourceHeight: number
  width: number
  height: number
  source: ArrayBuffer
}

interface IWorkerParamMessage {
  data: IWorkerParam
}

interface IWorkerResult {
  target: Uint8ClampedArray
}

interface IWorkerResultMessage {
  data: IWorkerResult
}

function createResizeWorker(root: any = {})
  : {onmessage: (event: IWorkerParamMessage) => void} {
  root.onmessage = (event: IWorkerParamMessage) => {
    const sourceWidth = event.data.sourceWidth
    const sourceHeight = event.data.sourceHeight
    const width = event.data.width
    const height = event.data.height

    const ratioW = sourceWidth / width
    const ratioH = sourceHeight / height
    const ratioHalfW = Math.ceil(ratioW / 2)
    const ratioHalfH = Math.ceil(ratioH / 2)

    const source = new Uint8ClampedArray(event.data.source)
    const sourceH = source.length / sourceWidth / 4
    const targetSize = width * height * 4
    const targetMemory = new ArrayBuffer(targetSize)
    const target = new Uint8ClampedArray(targetMemory, 0, targetSize)
    // calculate
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x2 = (i + j * width) * 4
        let weight = 0
        let weights = 0
        let weightsAlpha = 0
        let gxR = 0
        let gxG = 0
        let gxB = 0
        let gxA = 0
        const centerY = j * ratioH

        const xxStart = Math.floor(i * ratioW)
        let xxStop = Math.ceil((i + 1) * ratioW)
        const yyStart = Math.floor(j * ratioH)
        let yyStop = Math.ceil((j + 1) * ratioH)

        xxStop = Math.min(xxStop, sourceWidth)
        yyStop = Math.min(yyStop, sourceHeight)

        for (let yy = yyStart; yy < yyStop; yy++) {
          const dy = Math.abs(centerY - yy) / ratioHalfH
          const centerX = i * ratioW
          const w0 = dy * dy // pre-calc part of w
          for (let xx = xxStart; xx < xxStop; xx++) {
            const dx = Math.abs(centerX - xx) / ratioHalfW
            const w = Math.sqrt(w0 + dx * dx)
            if (w >= 1) {
              // pixel too far
              continue
            }
            // hermite filter
            weight = 2 * w * w * w - 3 * w * w + 1
            // calc source pixel location
            const posX = 4 * (xx + yy * sourceWidth)
            // alpha
            gxA += weight * source[posX + 3]
            weightsAlpha += weight
            // colors
            if (source[posX + 3] < 255) {
              weight = weight * source[posX + 3] / 250
            }
            gxR += weight * source[posX]
            gxG += weight * source[posX + 1]
            gxB += weight * source[posX + 2]
            weights += weight
          }
        }
        target[x2] = gxR / weights
        target[x2 + 1] = gxG / weights
        target[x2 + 2] = gxB / weights
        target[x2 + 3] = gxA / weightsAlpha
      }
    }

    const objData: IWorkerResult = {
      target,
    }
    postMessage(objData, [target.buffer] as any)
  }
  return root
}

export class Resizer {
  readonly cores = navigator.hardwareConcurrency || 4
  readonly workerBlobURL = window.URL.createObjectURL(
    new Blob(
      ['(', createResizeWorker.toString(), ')(self)'],
      {type: 'application/javascript'},
    ))

  async resample(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): Promise<HTMLCanvasElement> {
    const {cores} = this
    const sourceWidth = canvas.width
    const sourceHeight = canvas.height
    width = Math.round(width)
    height = Math.round(height)
    const ratioH = sourceHeight / height

    // TODO handle null
    const ctx = canvas.getContext('2d')!

    let resolve: (canvas: HTMLCanvasElement) => void
    let reject: (err: Error) => void
    const promise = new Promise<HTMLCanvasElement>((res, rej) => {
      resolve = res
      reject = rej
    })

    const blockHeight = Math.ceil(sourceHeight / cores / 2) * 2
    let endY = -1
    let activeWorkers = 0
    const workers: Worker[] = []
    for (let c = 0; c < cores; c++) {
      const offsetY = endY + 1
      if (offsetY >= sourceHeight) {
        // size too small, nothing left for this core
        continue
      }

      endY = Math.min(offsetY + blockHeight - 1, sourceHeight - 1)

      const currentBlockHeight = Math.min(blockHeight, sourceHeight - offsetY)

      const partition = {
        source: ctx.getImageData(0, offsetY, sourceWidth, blockHeight),
        target: ctx.createImageData(
          width, Math.ceil(currentBlockHeight / ratioH)),
        startY: Math.ceil(offsetY / ratioH),
        height: currentBlockHeight,
      }

      const worker = new Worker(this.workerBlobURL)
      activeWorkers += 1
      workers[c] = worker
      worker.onmessage = (event: IWorkerResultMessage) => {
        worker.terminate()
        delete workers[c]
        activeWorkers -= 1
        partition.target.data.set(event.data.target)
        ctx.putImageData(partition.target, 0, partition.startY)

        if (!activeWorkers) {
          resolve(canvas)
        }
      }

      worker.onerror = (err: ErrorEvent) => {
        workers.forEach(w => w.terminate())
        workers.length = 0
        reject(new Error('Error resizing: ' + err.message))
      }

      const message: IWorkerParam = {
        sourceWidth,
        sourceHeight: partition.height,
        width,
        height: Math.ceil(partition.height / ratioH),
        source: partition.source.data.buffer,
      }
      worker.postMessage(message, [message.source])
    }

    canvas.width = width
    canvas.height = height
    // ctx.clearRect(0, 0, sourceWidth, sourceHeight)

    return promise
  }
}
