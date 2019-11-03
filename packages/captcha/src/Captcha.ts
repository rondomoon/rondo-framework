export type CaptchaType = 'image' | 'audio'

export interface Captcha {
  type: CaptchaType
  value: string
  timestamp: number
}

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Session {
      captcha?: Captcha
    }
  }
}

export function createCaptcha(
  value: string,
  type: CaptchaType,
): Captcha {
  return {
    value,
    type,
    timestamp: Date.now(),
  }

}
