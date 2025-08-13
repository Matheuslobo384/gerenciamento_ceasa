import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

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
                maxAgeSeconds: 60 * 60 * 24 * 365
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
                maxAgeSeconds: 60 * 60 * 24 * 365
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
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      }
    })
  ];

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendor libraries em chunks menores
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'chart-vendor': ['recharts'],
            'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 500
    },
    server: {
      port: 8082,
      host: true
    },
    preview: {
      port: 8082,
      host: true
    }
  };
});
