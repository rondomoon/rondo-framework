import {Request, Response, NextFunction} from 'express'

export type IHandler = (req: Request, res: Response, next: NextFunction) => any
