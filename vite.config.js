import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Hosts allowed to reach the dev server. Vite blocks unknown Host headers by
    // default (DNS-rebinding protection), which rejects tunnels like ngrok. Add
    // tunnel hostnames here. Use '.ngrok-free.dev' to allow any ngrok-free
    // subdomain, or `true` to disable the check entirely (least safe).
    allowedHosts: ['citadel-pulp-postage.ngrok-free.dev'],
    proxy: {
      // Forward API calls to the Express/MongoDB backend (npm run server, port 4000).
      // Keeps the browser same-origin so the session cookie flows through in dev.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
