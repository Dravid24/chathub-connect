import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isProduction = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://chathub-connect.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
