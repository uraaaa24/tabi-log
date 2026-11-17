import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'

// Serves the E2E web export. expo-sqlite's web worker needs SharedArrayBuffer,
// which browsers only enable for cross-origin isolated pages (COOP/COEP).
// Unknown paths fall back to index.html so deep links reach the router.

const root = path.resolve(process.argv[2] ?? 'dist/e2e-web')
const port = Number(process.argv[3] ?? 8081)
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
}

async function locate(urlPath: string): Promise<string> {
  const candidate = path.join(root, decodeURIComponent(urlPath))
  if (!candidate.startsWith(root)) {
    return path.join(root, 'index.html')
  }
  const info = await stat(candidate).catch(() => null)
  return info?.isFile() ? candidate : path.join(root, 'index.html')
}

createServer((request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname
  locate(urlPath)
    .then((file) => {
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cache-Control': 'no-store',
      })
      createReadStream(file).pipe(response)
    })
    .catch((error: unknown) => {
      response.writeHead(500)
      response.end(String(error))
    })
}).listen(port, '127.0.0.1', () => {
  console.log(`E2E web export: http://127.0.0.1:${port}`)
})
