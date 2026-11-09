// Local-only news API and launcher, proxied by Vite without credentials.
import { createMockLauncherHandler, mockLauncherEntries, type Entry } from '@appthrust/app-launcher'
import { mockConfig, newsRoutes, type MockMode } from './mock-news'

const port = Number(process.env.APPTHRUST_NEWS_MOCK_PORT ?? 5256)
const self: Entry = {
  definitionId: 'appthrust-news',
  name: 'AppThrust News',
  description: 'Product news, releases and updates from AppThrust.',
  icon: 'sparkles',
  url: mockConfig.publicUrl,
  phase: 'Ready',
  current: true,
}
const launcher = createMockLauncherHandler([self, ...mockLauncherEntries('appthrust-news')])
const configuredMode = process.env.APPTHRUST_NEWS_MOCK_MODE ?? 'ok'
if (!['ok', 'empty', 'content_unavailable'].includes(configuredMode)) throw new Error(`unknown APPTHRUST_NEWS_MOCK_MODE: ${configuredMode}`)
const mode = configuredMode as MockMode
const server = Bun.serve({
  port,
  hostname: '127.0.0.1',
  fetch(request) {
    const url = new URL(request.url)
    return launcher(request) ?? newsRoutes(request, url, mode) ?? Response.json({ error: 'not_found', message: `no mock for ${request.method} ${url.pathname}` }, { status: 404 })
  },
})
console.log(`appthrust-news mock API on http://${server.hostname}:${server.port} (mode=${mode})`)
