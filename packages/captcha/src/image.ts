import SVGCaptcha from 'svg-captcha'
import { Request, Response } from 'express'

export function image(req: Request, res: Response) {
  const { text, data } = SVGCaptcha.create()
  req.session!.captcha = text
  res.type('svg')
  res.status(200)
  res.send(data)
}
