import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://buyfresh-server.onrender.com",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "",
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
             if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
             }
             if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'leaflet-vendor';
             }
             return 'vendor';
          }
        },
      },
    },
  },
});