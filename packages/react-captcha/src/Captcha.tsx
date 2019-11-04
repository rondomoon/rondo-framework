import React from 'react'

export interface CaptchaProps {
  audioUrl?: string
  imageUrl: string
}

export type CaptchaType = 'image' | 'audio'

export interface CaptchaState {
  type: CaptchaType
  attempt: number
}

const flex = {
  display: 'flex',
}

const flexItemRight = {
  marginLeft: 'auto',
}

export class Captcha extends React.PureComponent<CaptchaProps, CaptchaState> {
  state: CaptchaState = {
    type: 'image',
    attempt: 1,
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
    const { imageUrl, audioUrl } = this.props
    const { attempt, type } = this.state

    return (
      <div className='captcha'>
        {type === 'image' && (
          <>
            <img key={attempt} src={imageUrl + '?' + attempt} width='100%' />
            <div style={flex}>
              <a className='action-refresh' onClick={this.refresh}>
                Refresh
              </a>
              {this.props.audioUrl && (
                <a
                  className='action-audio'
                  onClick={this.changeToAudio}
                  style={flexItemRight}
                >
                  Audio version
                </a>
              )}
            </div>
          </>
        )}
        {type === 'audio' && (
          <>
            <audio key={attempt} controls src={audioUrl + '?' + attempt} />
            <div style={flex}>
              <a className='action-refresh' onClick={this.refresh}>
                Refresh
              </a>
              <a
                className='action-image'
                onClick={this.changeToImage}
                style={flexItemRight}
              >
                Image version
              </a>
            </div>
          </>
        )}
      </div>
    )
  }
}
