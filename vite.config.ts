import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import path from 'path'
import alias from '@rollup/plugin-alias'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      dirs: ['src/components'],
      dts: true,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    tsconfigPaths:true,
    preserveSymlinks: true,
    alias: {
      '@liqvued': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Liqvued',
      formats: ['es', 'umd'],
      fileName: 'liqvued'
    },
    cssCodeSplit: false,
    rolldownOptions: {
      plugins: [
        alias({
          entries: [
            { find: '@', replacement: path.resolve(__dirname, 'src') }
          ]
        })
      ],
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset'
          if (name === 'style.css') return 'liqvued.css'
          return name
        }
      }
    },
    chunkSizeWarningLimit: 5000,
  },
  optimizeDeps: {
    include: [
      'vue',
      '@liqvued/Liqvued.vue',
    ],
    entries: [
      './src/**/*.vue',
    ],
  },
})