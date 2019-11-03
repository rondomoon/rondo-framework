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

/**
 * To make it easier to pass captcha in tests
 */
export function getValue(value: string, env = process.env) {
  return env.NODE_ENV === 'test' && env.CAPTCHA ? env.CAPTCHA : value
}

export function createCaptcha(
  value: string,
  type: CaptchaType,
): Captcha {
  return {
    value: getValue(value),
    type,
    timestamp: Date.now(),
  }
}
