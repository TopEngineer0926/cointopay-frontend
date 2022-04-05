<template>
  <auth-layout>
    <div class="max-w-xl w-full space-y-4 rounded bg-white dark:bg-gray-800 dark:text-gray-400 shadow p-4">
      <h1 class="text-xl font-bold mb-4 text-center">{{ translate('login.recover') }}</h1>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.username') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'User') }}</div>
          </div>
          <input type="text" autofocus v-model="form.User" class="form-input w-full" autocomplete="off"/>
        </div>
        <div>
          <vue-recaptcha ref="vueRecaptcha" :siteKey="reCaptchaAPIKey"
                         size="normal" @expire="recaptchaExpired" :theme="mode"
                         @fail="recaptchaFailed" @verify="recaptchaVerified">
          </vue-recaptcha>
          <div class="text-red-500 text-sm">{{ showError(errorBag, 'reCaptcha') }}</div>
        </div>

        <div class="mt-4">
          <j-button :disabled="isProcessing" size="w-full">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('login.recover') }}</span>
          </j-button>
        </div>
      </form>
    </div>
  </auth-layout>
</template>

<script>
import AuthLayout from '@/components/layouts/AuthLayout'
import vueRecaptcha from 'vue3-recaptcha2'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import validator from '@/validator'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ForgotPassword',
  components: {
    AuthLayout,
    vueRecaptcha,
    JButton,
    Icon
  },
  setup () {
    const vueRecaptcha = ref(null)

    // Provides
    const http = inject('http')
    const toast = inject('toast')
    const translate = inject('translate')
    // Store
    const store = useStore()
    // Router
    const router = useRouter()

    const {
      validate,
      showError
    } = validator()

    const state = reactive({
      reCaptchaAPIKey: process.env.VUE_APP_GOOGLE_reCAPTCHA_SITE_KEY,
      form: {
        User: '',
        reCaptcha: '',
        output: 'json'
      },
      errorBag: {},
      rules: {
        User: ['required'],
        reCaptcha: ['required']
      },
      messages: {
        User: {
          required: 'Username is required'
        },
        reCaptcha: {
          required: 'Verify you are not a robot'
        }
      },
      isProcessing: false
    })

    // Computed
    const mode = computed(() => store.state.mode)
    const isLoggedIn = computed(() => store.state.isLoggedIn)

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
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = state.form
        payload = Object.assign(payload, {
          'g-recaptcha-response': payload.reCaptcha
        })
        delete payload.reCaptcha

        http.get(`${apiBaseUrl}/RecoverPassword`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            if (response.data.status_code === 400) {
              toast.error(response.data.reason)
            } else {
              // Reset google reCaptcha
              toast.success(response.data.data[0])
              // Redirect
              router.push('/login')
            }
          }
        }).catch(error => {
          state.isProcessing = false
          if (error.response) {
            toast.error(error.response.data)
          } else if (error.data && error.data.reason) {
            toast.error(error.data.reason)
          }
          vueRecaptcha.value.reset()
          state.form.reCaptcha = ''
        })
      }
    }

    onBeforeMount(() => {
      if (isLoggedIn.value) {
        const route = store.state.currentRoute
        router.push(route)
      }
    })

    return {
      translate,
      ...toRefs(state),
      vueRecaptcha,
      showError,
      mode,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      submit
    }
  }
}
</script>

<style scoped></style>
