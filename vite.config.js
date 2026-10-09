import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Publié sur GitHub Pages sous /HalaMadrid/ ; les images sont dans public/img (chemins relatifs « img/… »)
export default defineConfig({
  base: '/HalaMadrid/',
  plugins: [react()],
});
