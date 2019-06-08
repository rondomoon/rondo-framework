import React from 'react'

export interface IImage {
  base64: string
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

  handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const files = this.fileInput.current!.files!

    Array.prototype.forEach.call(files, (file: File) => {
      const reader = new FileReader()
      reader.addEventListener('load', function() {
        const {result} = this
        console.log(file.name, result)
        // TODO resize image...
      })
      reader.readAsDataURL(file)
    })
  }
  render() {
    return (
      <div className='image-upload'>
        <input
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
