import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Plugin to copy manifest.json and assets to dist
function copyManifest() {
  return {
    name: "copy-manifest",
    writeBundle() {
      const distDir = resolve(__dirname, "dist");
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      const manifestSrc = resolve(__dirname, "manifest.json");
      const manifestDest = resolve(distDir, "manifest.json");
      if (existsSync(manifestSrc)) {
        copyFileSync(manifestSrc, manifestDest);
      }

      // popup.html is processed by Vite, no need to copy manually

      // Copy assets directory
      const assetsSrc = resolve(__dirname, "assets");
      const assetsDest = resolve(distDir, "assets");
      if (existsSync(assetsSrc)) {
        if (!existsSync(assetsDest)) {
          mkdirSync(assetsDest, { recursive: true });
        }
        const copyRecursive = (src: string, dest: string) => {
          const entries = readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = resolve(src, entry.name);
            const destPath = resolve(dest, entry.name);
            if (entry.isDirectory()) {
              if (!existsSync(destPath)) {
                mkdirSync(destPath, { recursive: true });
              }
              copyRecursive(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          }
        };
        copyRecursive(assetsSrc, assetsDest);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "background" ? "background.js" : "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "popup.html") {
            return "popup.html";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  base: "./", // Use relative paths for Chrome extension
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

