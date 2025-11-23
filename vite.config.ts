import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ajustado para incluir apenas o ícone SVG que criamos, evitando 404s
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SpeakUp Coach',
        short_name: 'SpeakUp',
        description: 'App de treinamento de oratória com análise de IA',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})