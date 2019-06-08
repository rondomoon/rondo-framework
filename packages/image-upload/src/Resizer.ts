interface IPartition {
  source: ImageData
  target: ImageData
  startY: number
  height: number
}

interface IWorkerParam {
  sourceWidth: number
  sourceHeight: number
  width: number
  height: number
  core: number
  source: ArrayBuffer
}

interface IWorkerParamMessage extends MessageEvent {
  data: IWorkerParam
}

interface IWorkerResult {
  core: number
  target: Uint8ClampedArray
}

interface IWorkerResultMessage extends MessageEvent {
  data: IWorkerResult
}

function ResizeWorker() {
  function onmessage(event: IWorkerParamMessage) {
    const core = event.data.core
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
      core,
      target,
    }
    postMessage(objData, [target.buffer] as any)
  }
}

export class Resizer {
  readonly cores = navigator.hardwareConcurrency || 4
  readonly workerBlobURL = window.URL.createObjectURL(
    new Blob(
      ['(', ResizeWorker.toString(), ')()'],
      {type: 'application/javascript'},
    ))

  async resample(canvas: HTMLCanvasElement, width: number, height: number) {
    const {cores} = this
    const sourceWidth = canvas.width
    const sourceHeight = canvas.height
    width = Math.round(width)
    height = Math.round(height)
    const ratioH = sourceHeight / height

    const workers = new Array(cores)
    // TODO handle null
    const ctx = canvas.getContext('2d')!

    // prepare source and target data for workers
    const partitions: IPartition[] = new Array(cores)
    const blockHeight = Math.ceil(sourceHeight / cores / 2) * 2
    let endY = -1
    for (let c = 0; c < cores; c++) {
      // source
      const offsetY = endY + 1
      if (offsetY >= sourceHeight) {
        // size too small, nothing left for this core
        continue
      }

      endY = offsetY + blockHeight - 1
      endY = Math.min(endY, sourceHeight - 1)

      let currentBlockHeight = blockHeight
      currentBlockHeight = Math.min(blockHeight, sourceHeight - offsetY)

      // console.log(
      // 'source split: ', '#'+c, offsetY, endY, 'height: '+currentBlockHeight);

      partitions[c] = {
        source: ctx.getImageData(0, offsetY, sourceWidth, blockHeight),
        target: ctx.createImageData(
          width, Math.ceil(currentBlockHeight / ratioH)),
        startY: Math.ceil(offsetY / ratioH),
        height: currentBlockHeight,
      }
    }

    ctx.clearRect(0, 0, sourceWidth, sourceHeight)

    let resolve: () => void
    const promise = new Promise(r => resolve = r)

    // start
    let activeWorkers = 0
    for (let c = 0; c < cores; c++) {
      if (partitions[c] === undefined) {
        // no job for this worker
        continue
      }

      activeWorkers++
      const worker = new Worker(this.workerBlobURL)
      workers[c] = worker

      worker.onmessage = (event: IWorkerResultMessage) => {
        activeWorkers--
        const core = event.data.core
        workers[core].terminate()
        delete workers[core]

        // draw
        // const height_part = Math.ceil(partitions[core].height / ratioH)
        // partitions[core].target = ctx.createImageData(width, height_part)
        partitions[core].target.data.set(event.data.target)
        ctx.putImageData(partitions[core].target, 0, partitions[core].startY)

        if (activeWorkers <= 0) {
          resolve()
        }
      }
      const message: IWorkerParam = {
        sourceWidth,
        sourceHeight: partitions[c].height,
        width,
        height: Math.ceil(partitions[c].height / ratioH),
        core: c,
        source: partitions[c].source.data.buffer,
      }
      worker.postMessage(message, [message.source])
    }

    return promise
  }
}
