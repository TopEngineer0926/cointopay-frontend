<template>
  <centered-layout>
    <div class="card">
      <div class="title">
        <h5>{{ translate('newsletter.title') }}</h5>
      </div>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">
        <div class="grid grid-cols-2">
          <div class="col-span-2 lg:col-span-1">
            <form>
              <div class="mb-2">
                <label>{{ translate('newsletter.email') }}</label>
                <input v-model="form.email" autocomplete="off" class="form-input w-full" type="email"/>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'email') }}</div>
              </div>
              <div>
                <vue-recaptcha ref="vueRecaptcha" :siteKey="reCaptchaAPIKey"
                               :theme="mode" size="normal" @expire="recaptchaExpired"
                               @fail="recaptchaFailed" @verify="recaptchaVerified">
                </vue-recaptcha>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'reCaptcha') }}</div>
              </div>
              <div class="mt-4 text-right">
                <j-button :disabled="loader !== ''" class="mb-2 md:mb-0 mr-3" type="button"
                          buttonStyle='danger' @click="unSubscribe()">
                  <div v-if="loader === 'unsub'" class="mr-3">
                    <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                  </div>
                  <span>{{ translate('newsletter.un_subscribe') }}</span>
                </j-button>
                <j-button :disabled="loader !== ''" type="button" @click="subscribe()">
                  <div v-if="loader === 'sub'" class="mr-3">
                    <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                  </div>
                  <span>{{ translate('newsletter.subscribe') }}</span>
                </j-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { inject, reactive, toRefs, computed, watch, ref } from 'vue'
import vueRecaptcha from 'vue3-recaptcha2'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'

export default {
  name: 'Newsletter',
  components: { CenteredLayout, JButton, Icon, vueRecaptcha },
  setup () {
    const vueRecaptcha = ref(null)

    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    const store = useStore()

    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()
    // State
    const state = reactive({
      reCaptchaAPIKey: process.env.VUE_APP_GOOGLE_reCAPTCHA_SITE_KEY,
      form: {
        email: '',
        reCaptcha: '',
        output: 'json'
      },
      errorBag: {},
      rules: {
        email: ['required', 'email'],
        reCaptcha: ['required']
      },
      messages: {
        email: {
          required: 'Email address is required',
          email: 'Please provide a valid email address'
        },
        reCaptcha: {
          required: 'Verify you are not a robot'
        }
      },
      loader: ''
    })

    // Computed
    const mode = computed(() => store.state.mode)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules, state.messages)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const recaptchaVerified = (response) => {
      state.form.reCaptcha = response
    }
    const recaptchaExpired = () => {
      vueRecaptcha.value.reset()
      state.form.reCaptcha = ''
    }
    const recaptchaFailed = () => {
    }
    const subscribe = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.loader = 'sub'
        const payload = {
          Subscriber: state.form.email,
          'g-recaptcha-response': state.form.reCaptcha
        }
        http.get(`${apiBaseUrl}/Subscribe`, {
          params: payload
        }).then(response => {
          state.loader = ''
          if (response.status === 200) {
            toast.success('Congratulations! You have subscribed to the Cointopay newsletter.')
            saveNotification('Congratulations! You have subscribed to the Cointopay newsletter.')
            if (vueRecaptcha.value) {
              vueRecaptcha.value.reset()
            }
            state.form = {
              email: '',
              reCaptcha: ''
            }
          }
        }).catch(error => {
          console.log(error)
          toast.error('Internal Server Error')
          state.loader = ''
          if (vueRecaptcha.value) {
            vueRecaptcha.value.reset()
          }
          state.form.reCaptcha = ''
        })
      }
    }
    const unSubscribe = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.loader = 'unsub'
        const payload = {
          Unsubscriber: state.form.email,
          'g-recaptcha-response': state.form.reCaptcha
        }
        http.get(`${apiBaseUrl}/Subscribe`, {
          params: payload
        }).then(response => {
          state.loader = ''
          if (response.status === 200) {
            toast.success('Congratulations! You have unsubscribed from Cointopay newsletter.')
            saveNotification('Congratulations! You have unsubscribed from Cointopay newsletter.')
            vueRecaptcha.value.reset()
            state.form = {
              email: '',
              reCaptcha: ''
            }
          }
        }).catch(error => {
          console.log(error)
          toast.error('Internal Server Error')
          state.loader = ''
          vueRecaptcha.value.reset()
          state.form.reCaptcha = ''
        })
      }
    }

    return {
      translate,
      ...toRefs(state),
      vueRecaptcha,
      mode,
      showError,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      subscribe,
      unSubscribe
    }
  }
}
</script>

<style scoped>

</style>
