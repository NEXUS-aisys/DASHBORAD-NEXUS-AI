import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  return {
    plugins: [react()],
    
    // Build optimization
    build: {
      // Enable minification in production
      minify: isProd ? 'terser' : false,
      
      // Generate source maps for debugging (disabled in production for security)
      sourcemap: isDev,
      
      // Optimize chunk sizes
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor libraries
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            charts: ['recharts', 'chart.js', 'react-chartjs-2', 'd3', 'plotly.js', 'react-plotly.js'],
            router: ['react-router-dom'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            utils: ['axios', 'date-fns', 'uuid', 'clsx', 'tailwind-merge']
          },
          // Optimize file naming for caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      },
      
      // Terser configuration for production
      terserOptions: isProd ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : {},

      // Performance optimization
      target: 'es2015',
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // 4kb
      
      // Output directory
      outDir: 'dist',
      emptyOutDir: true
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        },
        '/socket.io': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          ws: true
        }
      }
    },

    // Preview server configuration
    preview: {
      port: 3000,
      host: true
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/components': resolve(__dirname, './src/components'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/services': resolve(__dirname, './src/services'),
        '@/utils': resolve(__dirname, './src/utils'),
        '@/hooks': resolve(__dirname, './src/hooks'),
        '@/contexts': resolve(__dirname, './src/contexts'),
        '@/lib': resolve(__dirname, './src/lib')
      }
    },

    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_CDN_URL': JSON.stringify(process.env.VITE_CDN_URL || ''),
    },

    // CSS configuration
    css: {
      devSourcemap: isDev,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    // Optimization configuration
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@radix-ui/react-accordion',
        '@radix-ui/react-dialog',
        'recharts',
        'chart.js'
      ],
      exclude: ['@vite/client', '@vite/env']
    },

    // Asset handling
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp']
  }
})
