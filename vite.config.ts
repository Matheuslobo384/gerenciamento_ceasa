import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'robots.txt'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'LECULGO - Gerenciamento de Mercadorias',
        short_name: 'LECULGO',
        description: 'Sistema completo de gerenciamento de mercadorias LECULGO',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0F172A',
        theme_color: '#0F172A',
        categories: ['business', 'productivity', 'finance'],
        lang: 'pt-BR',
        dir: 'ltr',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Acessar dashboard principal',
            url: '/dashboard',
            icons: [
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Vendas',
            short_name: 'Vendas',
            description: 'Gerenciar vendas',
            url: '/vendas',
            icons: [
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Produtos',
            short_name: 'Produtos',
            description: 'Gerenciar produtos',
            url: '/produtos',
            icons: [
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      },
      devOptions: {
        enabled: false // desabilita SW em desenvolvimento para não conflitar com Vite
      }
    }),
  ];

  if (mode === 'development') {
    const { componentTagger } = await import('lovable-tagger');
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
