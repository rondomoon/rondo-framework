import {Request, Response, NextFunction} from 'express'

export type THandler = (req: Request, res: Response, next: NextFunction) => any
