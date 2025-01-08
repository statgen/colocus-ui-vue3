/*
 * This is a server using the express package.
 * Its purpose is to run the production build of Colocus locally,
 * with proxying to the Django back end,
 * configured as shown in the proxy settings below.
 *
 * To run it, the libraries must be installed
 *   `npm -D i express`
 *   `npm -D i http-proxy-middleware`
 * Then run by:
 *   `npm build`
 *   `node express-server.js`
 * The app should then be available at the url:port specified below.
 */

const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const port = 55000

// Serve built files from "dist"
app.use(express.static('dist'))

// Proxy /api calls to your backend
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://127.0.0.1:8000/api/',
    changeOrigin: true,
  })
)

app.listen(port, () => {
  console.log(`Production build served at http://localhost:${port}`)
})
