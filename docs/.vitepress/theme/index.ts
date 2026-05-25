import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
// import { createVuetify } from 'vuetify'
// import * as components from 'vuetify/components'
// import PrimeVue from 'primevue/config'
// import InputText from 'primevue/inputtext'
// import Select from 'primevue/select'
// import Slider from 'primevue/slider'
// import Aura from '@primeuix/themes/aura'
import Liqvued from '@liqvued/Liqvued.vue'
// import Demo from '../components/Demo.vue'
// import DemoContainer from '../components/DemoContainer.vue'
// import DemoButton from '../components/DemoButton.vue'
// import DemoSlider from '../components/DemoSlider.vue'
// import DemoForm from '../components/DemoForm.vue'
import DemoShowcase from '../components/DemoShowcase.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // app.use(PrimeVue, {
    //   theme: {
    //     preset: Aura,
    //   },
    // })

    // const vuetify = createVuetify({ components: { ...components } })
    // app.use(vuetify)

    app.component('Liqvued', Liqvued)
    // app.component('Demo', Demo)
    // app.component('DemoContainer', DemoContainer)
    // app.component('DemoButton', DemoButton)
    // app.component('DemoSlider', DemoSlider)
    // app.component('DemoForm', DemoForm)
    app.component('DemoShowcase', DemoShowcase)
    // app.component('InputText', InputText)
    // app.component('Select', Select)
    // app.component('Slider', Slider)
  },
} satisfies Theme
