import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type ProxyOptions } from 'vite'

// The SPA, news API and launcher share an origin. Production's edge attaches
// the user bearer. Development defaults to the credential-free local mock.
const upstream = process.env.APPTHRUST_NEWS_API_UPSTREAM ?? `http://127.0.0.1:${process.env.APPTHRUST_NEWS_MOCK_PORT ?? 5256}`
const devBearer = process.env.APPTHRUST_NEWS_DEV_BEARER
const devCookieFile = process.env.APPTHRUST_NEWS_DEV_COOKIE_FILE
const proxy: ProxyOptions = {
  target: upstream,
  changeOrigin: true,
  configure(server) {
    server.on('proxyReq', (request) => {
      request.removeHeader('origin')
      if (devBearer) request.setHeader('authorization', `Bearer ${devBearer}`)
      if (devCookieFile) request.setHeader('cookie', readFileSync(devCookieFile, 'utf8').trim())
    })
  },
}

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: { jsx: 'automatic' },
  server: {
    port: Number(process.env.APPTHRUST_NEWS_PORT ?? 5258),
    strictPort: true,
    proxy: Object.fromEntries(['/api', '/config', '/launcher'].map((route) => [route, proxy])),
  },
})
