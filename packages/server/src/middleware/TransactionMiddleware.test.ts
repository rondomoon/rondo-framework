import { TRANSACTION } from '@rondo.dev/db'
import { TypeORMDatabase, TypeORMLogger } from '@rondo.dev/db-typeorm'
import { createNamespace } from 'cls-hooked'
import express, { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { config } from '../config'
import { loggerFactory  } from '../logger'
import { CORRELATION_ID, TransactionMiddleware } from '../middleware'

const ns = createNamespace('clsify-test')
const database = new TypeORMDatabase(
  ns,
  new TypeORMLogger(loggerFactory.getLogger('sql'), ns),
  config.app.db,
)

describe('middleware/Transaction', () => {

  const app = express()

  const results: {[key: string]: string[]} = {}

  function handler(req: Request, res: Response, next: NextFunction) {
    results[req.params.id] = (results[req.params.id] || [])
    results[req.params.id].push(ns.get(CORRELATION_ID))
    setImmediate(next)
  }

  app.use(new TransactionMiddleware(ns).handle)
  app.use('/:id', handler)
  app.use('/:id', handler)
  app.use('/:id', handler)
  app.use('/:id', handler)
  app.get('/:id', (req, res) => res.end())

  const size = 100
  beforeEach(async () => {
    const promises: Array<Promise<any>> = []
    for (let i = 1; i <= size; i++) {
      promises.push(request(app).get('/' + i))
    }
    await Promise.all(promises)
  })

  it('chains should have the same correlation ids', () => {
    const allCorrelationIds = new Set()
    const keys = Object.keys(results)
    expect(keys.length).toEqual(size)
    keys.forEach(key => {
      const correlationIds = results[key]
      expect(correlationIds.length).toEqual(4)
      const id = correlationIds[0]
      const allEqual = correlationIds.every(cId => cId === id)
      expect(allEqual).toEqual(true)
      allCorrelationIds.add(id)
    })
    expect(allCorrelationIds.size).toEqual(size)
  })
})

describe('doInTransaction', () => {

  let entityManager: any
  const app = express()
  app.use(new TransactionMiddleware(ns).handle)
  app.use('/', (req, res, next) => {
    if (entityManager) {
      ns.set(TRANSACTION, entityManager)
    }
    next()
  })
  app.get('/', (req, res, next) => {
    const tm = database.transactionManager
    tm.doInTransaction(async entMan => {
      const em = tm.getEntityManager()
      expect(em).toEqual(entMan)
      res.json({inTransaction: !!em, alreadyIn: entityManager === em})
    })
  })

  beforeEach(async () => {
    entityManager = null
    await database.connect()
  })
  afterEach(async () => {
    await database.close()
  })

  it('opens a new transaction when no active transactions', async () => {
    await request(app)
    .get('/')
    .expect(200)
    .expect('{"inTransaction":true,"alreadyIn":false}')
  })

  it('starts a new transaction when already in a transaction', async () => {
    entityManager = {}
    await request(app)
    .get('/')
    .expect(200)
    .expect('{"inTransaction":true,"alreadyIn":true}')
  })

})
