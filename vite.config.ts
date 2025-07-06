/* eslint-disable sort-keys-fix/sort-keys-fix */
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const dir = path.resolve(__dirname, 'src');
const componentFiles = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.ts') && file !== 'types.ts');

// Generate entry points dynamically
const entry = componentFiles.reduce((acc, file) => {
  const name = path.basename(file, path.extname(file));

  return { ...acc, [name]: path.resolve(dir, file) };
}, {});

const dtsPlugin = dts({
  entryRoot: 'src',
  insertTypesEntry: true,
  outDir: 'dist',
  tsconfigPath: './tsconfig.json',
  exclude: ['vite.config.ts'],
});

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry,
    },
    minify: false,
    target: 'esnext',

    rollupOptions: {
      external: ['*'],
      output: [
        {
          format: 'esm',
          dir: 'dist',
          entryFileNames: '[name].js',
          preserveModules: true,
        },
      ],
    },
  },
  plugins: [dtsPlugin],
  resolve: {
    alias: {
      '@': dir,
    },
  },
});
