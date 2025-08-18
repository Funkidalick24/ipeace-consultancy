import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ['react', 'react-dom'],
          
          // Data fetching and state management
          data: ['@tanstack/react-query'],
          
          // UI components - split by functionality
          uiDialogs: ['@radix-ui/react-dialog', '@radix-ui/react-alert-dialog'],
          uiForms: ['@radix-ui/react-select', '@radix-ui/react-checkbox', '@radix-ui/react-label'],
          uiNavigation: ['@radix-ui/react-tabs', '@radix-ui/react-navigation-menu'],
          uiDisplay: ['@radix-ui/react-tooltip', '@radix-ui/react-popover', '@radix-ui/react-hover-card'],
          
          // Icon libraries
          icons: ['lucide-react', 'react-icons'],
          
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utility libraries
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        ecma: 2020,
        module: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
        passes: 3
      },
      mangle: {
        properties: {
          regex: /^__/
        }
      },
      output: {
        comments: false,
        ascii_only: true
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
