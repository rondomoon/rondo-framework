import React from 'react'

export interface CaptchaProps {
  onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  audioUrl?: string
  imageUrl: string
}

export type CaptchaType = 'image' | 'audio'

export interface CaptchaState {
  type: CaptchaType
  attempt: number
}

export class Captcha extends React.PureComponent<CaptchaProps, CaptchaState> {
  state: CaptchaState = {
    type: 'image',
    attempt: 0,
  }
  changeType(type: CaptchaType) {
    this.setState({ type })
  }
  changeToAudio = () => {
    this.changeType('audio')
  }
  changeToImage = () => {
    this.changeType('image')
  }
  refresh = () => {
    this.setState({ attempt: this.state.attempt + 1 })
  }
  render() {
    const { onChange, value, imageUrl, audioUrl } = this.props
    const { attempt, type } = this.state

    return (
      <div>
        {type === 'image' && (
          <>
            <img key={attempt} src={imageUrl} />
            <a onClick={this.refresh}>
              Refresh
            </a>
            <a onClick={this.changeToAudio}>
              Click here for image version
            </a>
          </>
        )}
        {type === 'audio' && (
          <>
            <audio key={attempt} controls src={audioUrl} />
            <a onClick={this.refresh}>
              Refresh
            </a>
            <a onClick={this.changeToImage}>
              Click here for audio version
            </a>
          </>
        )}
        k
        <input value={value} onChange={onChange} />
      </div>
    )
  }
}
