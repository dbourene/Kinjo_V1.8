import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
});