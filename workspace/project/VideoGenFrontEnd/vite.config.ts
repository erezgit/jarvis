import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Plugin } from 'vite';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a custom plugin for middleware functionality
const customMiddleware = (): Plugin => ({
  name: 'custom-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Handle SPA routing
      if (req.url?.endsWith('.html')) {
        req.url = '/index.html';
      }
      next();
    });
  },
});

// Determine if we're in a Replit environment
const isReplit = !!process.env.REPL_ID;
const replitSlug = process.env.REPL_SLUG || 'workspace';
const replitOwner = process.env.REPL_OWNER || 'erezfern';

export default defineConfig({
  plugins: [react(), customMiddleware()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: false, // Allow fallback to another port if 3000 is not available
    host: '0.0.0.0',
    // Only set specific HMR settings in Replit environment
    ...(isReplit && {
      hmr: {
        clientPort: 443,
        host: `${replitSlug}.${replitOwner}.repl.co`,
      },
    }),
    // Prevent opening browser automatically in Replit
    open: false,
    // Allow specific hosts
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.replit.dev',
      '.repl.co',
      '328f45bf-ba2c-4dce-b284-5d10821a9ebd-00-srh2sdtv23id.sisko.replit.dev'
    ],
  },
  preview: {
    port: 3000,
    strictPort: false,
    host: '0.0.0.0',
    open: false, // Prevent automatic browser opening
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
