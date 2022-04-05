import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mitt from 'mitt'
import LitepieDatepicker from 'litepie-datepicker'
import Toaster from '@meforma/vue-toaster'
import VueClickAway from 'vue3-click-away'
import VueTippy from 'vue-tippy'
import translate from './libs/translate'
import instance from './libs/axios'
import { globalCookiesConfig } from 'vue3-cookies'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'tippy.js/dist/tippy.css'

// Tailwind CSS v2
import './assets/tailwind.scss'

globalCookiesConfig({
  expireTimes: '7d',
  path: '/',
  domain: '.cointopay.com',
  secure: true,
  sameSite: 'None'
})

const app = createApp(App)
  .use(VueTippy, {
    directive: 'tippy',
    component: 'tippy',
    defaultProps: {
      allowHTML: true,
      placement: 'top'
    },
    flipDuration: 0,
    popperOptions: {
      modifiers: {
        preventOverflow: {
          enabled: false
        }
      }
    }
  })
  .use(store)
  .use(router)
  .use(LitepieDatepicker)
  .use(Toaster)
  .use(VueClickAway)
  .use(VueSweetalert2)

// Providers
app.provide('toast', app.config.globalProperties.$toast)
app.provide('http', instance)
app.provide('translate', translate)
app.provide('swal', app.config.globalProperties.$swal)
app.provide('emitter', mitt())
// Global Properties
app.config.globalProperties.$http = instance

app.mount('#app')
