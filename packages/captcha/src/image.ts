import SVGCaptcha from 'svg-captcha'
import { Request, Response } from 'express'

export interface ImageConfig {
  size: number
}

export const image = (config: ImageConfig) => (req: Request, res: Response) => {
  const { text, data } = SVGCaptcha.create({
    size: config.size,
  })
  req.session!.captcha = text
  res.type('svg')
  res.status(200)
  res.send(data)
}
