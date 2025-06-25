import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [react()],
  };

  // Only add proxy in development mode
  if (command === "serve") {
    config.server = {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          // Optional: Remove /api prefix before forwarding
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    };
  }

  return config;
});
