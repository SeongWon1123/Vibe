import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** Local-only stand-in for `vercel dev` so /api/chat works without a Vercel login. */
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/chat') return next()

        try {
          const apiUrl = `${pathToFileURL(path.join(rootDir, 'api/chat.js')).href}?t=${Date.now()}`
          const { default: handler } = await import(apiUrl)

          const chunks = []
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            await new Promise((resolve, reject) => {
              req.on('data', (chunk) => chunks.push(chunk))
              req.on('end', resolve)
              req.on('error', reject)
            })
          }

          let body = {}
          if (chunks.length) {
            body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
          }

          const fakeRes = {
            statusCode: 200,
            status(code) {
              this.statusCode = code
              return this
            },
            json(obj) {
              res.statusCode = this.statusCode
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(obj))
            },
            end() {
              res.statusCode = this.statusCode
              res.end()
            },
          }

          await handler({ method: req.method, body, headers: req.headers }, fakeRes)
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ reply: '잠시 후 다시 시도해주세요' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiDev()],
  server: {
    host: true,
    port: 3000,
  },
})
