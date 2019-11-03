import { RequestHandler } from 'express'
import createError from 'http-errors'

export interface ValidationConfig {
  readonly property: string
  readonly ttl: number
}

const defaultConfig: ValidationConfig = {
  property: 'captcha',
  ttl: 10 * 60 * 1000,
}

export const validateCaptcha = (
  config?: Partial<ValidationConfig>,
): RequestHandler => {
  const cfg: ValidationConfig = Object.assign({}, defaultConfig, config)

  return (req, res, next) => {
    const captcha = req.session && req.session.captcha
    if (!captcha) {
      return next(createError(403, 'Invalid captcha'))
    }
    if (Date.now() >= captcha.timestamp + cfg.ttl) {
      return next(createError(403, 'Invalid captcha'))
    }
    if (captcha.value !== req.body[cfg.property]) {
      return next(createError(403, 'Invalid captcha'))
    }
    delete req.session!.captcha
    next()
  }
}
