import React from 'react'
import {Resizer} from './Resizer'
import {readAsDataURL} from './Files'
import {drawCanvasFromDataURL} from './Image'

export interface IImage {
  dataURL: string
}

export interface IImageUploadProps {
  onChange: (images: IImage[]) => void
  multiple: boolean
}

export class ImageUpload extends React.PureComponent<IImageUploadProps> {
  fileInput: React.RefObject<HTMLInputElement>
  constructor(props: IImageUploadProps) {
    super(props)
    this.fileInput = React.createRef()
  }

  safeHandleChange = async (event: React.SyntheticEvent<HTMLInputElement>) => {
    try {
      await this.handleChange(event)
    } catch (err) {
      // console.log('Error in handleChange', err)
    }
  }
  handleChange = async (event: React.SyntheticEvent<HTMLInputElement>) => {
    const self = this
    const files = Array.from(this.fileInput.current!.files!)

    const resized: IImage[] = []
    for (const file of files) {
      const dataURL = await readAsDataURL(file)
      const resizedDataURL = await this.resize(dataURL)
      resized.push({
        dataURL: resizedDataURL,
      })

      // TODO testing stuff
      const img = document.createElement('img')
      img.src = resizedDataURL
      this.fileInput.current!.parentElement!.appendChild(img)
    }

    (window as any).resized = resized
    this.props.onChange(resized)
  }

  async resize(dataURL: string): Promise<string> {
    const canvas = await drawCanvasFromDataURL(dataURL)

    const maxHeight = 512
    // // TODO figure out what to do when the image is really wide

    if (canvas.height > maxHeight) {
      const height = maxHeight
      const width = Math.round(canvas.width / canvas.height * maxHeight)
      await new Resizer().resample(canvas, width, height)
    }

    return canvas.toDataURL('image/jpeg', .85)
  }

  render() {
    return (
      <div className='image-upload'>
        <input
          autoComplete='off'
          multiple={this.props.multiple}
          type='file'
          accept='image/*'
          ref={this.fileInput}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}
