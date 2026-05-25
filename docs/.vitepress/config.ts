import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  cleanUrls: true,
  title: 'Liqvued',
  description: 'Liquid glass effects for Vue 3 — realistic SVG displacement map refraction via SVG filters',
  head: [['link', { rel: 'icon', href: '/liqvued/brand_icon.png' }]],
  base: '/liqvued/',
  lang: 'en-US',

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    resolve: {
      alias: {
        '@liqvued': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },

    plugins: [
      {
        name: 'polyfill-css-ssr',
        transform(code, id) {
          if (id.includes('vuetify') && (code.includes('CSS.supports') || code.includes('CSS.escape') || code.includes('CSS.registerProperty'))) {
            return `if(typeof globalThis.CSS==='undefined'){globalThis.CSS={supports:()=>false,escape:s=>s,registerProperty:()=>{}}}\n${code}`
          }
        },
      },
    ],
  },

  themeConfig: {
    logo: '/brand_icon.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      // { text: 'Examples', link: '/examples/button' },
      { text: 'API', link: '/api' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'How It Works', link: '/guide/how-it-works' },
            { text: 'Browser Compatibility', link: '/guide/browser-compatibility' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'FAQ', link: '/guide/faq' },
          ],
        },
      ],
      // '/examples/': [
      //   {
      //     text: 'Examples',
      //     items: [
      //       { text: 'Buttons', link: '/examples/button' },
      //       { text: 'Sliders', link: '/examples/slider' },
      //       { text: 'Form Elements', link: '/examples/form-elements' },
      //     ],
      //   },
      // ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IVoyt/liqvued' },
    ],

    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2026 Igor Voytovich',
    },
  },
})
