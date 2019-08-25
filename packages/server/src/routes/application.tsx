// import React from 'react'
// import {CComponent} from '@rondo.dev/client'
// import {Provider} from 'react-redux'
import {Router} from 'express'
// import {createReadStream} from 'fs'
// import {createStore} from '../../client/store'
// import {join} from 'path'
// import {renderToNodeStream} from 'react-dom/server'

export const application = Router()

// application.get('/client.js', (req, res) => {
//   const stream = createReadStream(join(__dirname, '../build/client.js'))
//   stream.pipe(res)
// })

// application.get('/no-ssr', (req, res) => {
//   res.write('<!DOCTYPE html><html><head><title>My Page</title></head><body>')
//   res.write(`</body><script src='client.js'></script></html>`)
//   res.end()
// })

// application.get('/', (req, res) => {
//   const store = createStore({
//     csrfToken: req.csrfToken(),
//     value: '1234',
//   })
//   const stream = renderToNodeStream(
//     <Provider store={store}>
//       <CComponent />
//     </Provider>,
//   )
//   const state = store.getState()
//   res.write('<!DOCTYPE html><html><head><title>My Page</title></head><body>')
//   // TODO attach javascript
//   stream.pipe(res, { end: false })
//   stream.on('end', () => {
//     res.write(`</body>
//     <script>window.__PRELOADED_STATE__ = ${JSON.stringify(state)
// .replace( /</g, '\\u003c')}</script>
//     <script src='client.js'></script>
// </html>`)
//     res.end()
//   })
// })

application.get('/', (req, res) => {
  res.json({csrfToken: req.csrfToken()})
})
