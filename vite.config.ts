import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base works at https://<username>.github.io/<repo>/ for any repo
// name, and hash navigation means Pages never has to resolve a deep link.
export default defineConfig({
  base: './',
  plugins: [react()],
});
