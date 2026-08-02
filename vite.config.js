import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

function securityHeadersPlugin() {
  const headers = {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co ws: wss:; worker-src 'self' blob:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }

  const apply = (req, res, next) => {
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))
    next()
  }

  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use(apply)
    },
    configurePreviewServer(server) {
      server.middlewares.use(apply)
    },
  }
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        start: fileURLToPath(new URL('./start.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
})
