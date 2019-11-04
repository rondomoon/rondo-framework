import SVGCaptcha from 'svg-captcha'
import { Request, Response } from 'express'
import { createCaptcha } from './Captcha'

export interface ImageConfig {
  size: number
}

export const image = (config: ImageConfig) => (req: Request, res: Response) => {
  const { text, data } = SVGCaptcha.create({
    size: config.size,
  })
  req.session!.captcha = createCaptcha(text, 'image')
  res.header('Cache-control', 'no-cache')
  res.type('svg')
  res.status(200)
  res.send(data)
}
