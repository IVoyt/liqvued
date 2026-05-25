import { Plugin } from 'vue'
import Liqvued from './Liqvued.vue'
import type { Surface } from './types'

const LiqvuedPlugin: Plugin = {
  install(app) {
    app.component('Liqvued', Liqvued)
  }
}

export { Liqvued }
export type { Surface }
export default LiqvuedPlugin