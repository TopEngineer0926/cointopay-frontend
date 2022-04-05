<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('login.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.username') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'User') }}</div>
          </div>
          <input v-model="form.User" autofocus class="form-input w-full rounded" type="text"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.password') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'Password') }}</div>
          </div>
          <input v-model="form.Password" autofocus class="form-input w-full rounded" type="password"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.twofa') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'totp') }}</div>
          </div>
          <input v-model="form.totp" autofocus class="form-input w-full" type="text"/>
        </div>
        <div>
          <vue-recaptcha ref="vueRecaptcha" :siteKey="reCaptchaAPIKey"
                         size="normal" @expire="recaptchaExpired" :theme="mode"
                         @fail="recaptchaFailed" @verify="recaptchaVerified">
          </vue-recaptcha>
          <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'reCaptcha') }}</div>
        </div>
        <div class="mt-4">
          <j-button :disabled="isProcessing" size="w-full">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('login.button') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import vueRecaptcha from 'vue3-recaptcha2'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { useCookies } from 'vue3-cookies'
import { FETCH_ACCOUNT_INFO, FETCH_POS_DATA, PERSIST_AUTH } from '@/store/keys'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import validator from '@/validator'

export default {
  name: 'LoginModal',
  components: {
    Modal,
    vueRecaptcha,
    JButton,
    Icon
  },
  setup () {
    const { cookies } = useCookies()
    const vueRecaptcha = ref(null)
    // Provides
    const http = inject('http')
    const toast = inject('toast')
    const translate = inject('translate')
    const emitter = inject('emitter')

    // Store
    const store = useStore()

    const {
      validate,
      showError
    } = validator()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      reCaptchaAPIKey: process.env.VUE_APP_GOOGLE_reCAPTCHA_SITE_KEY,
      form: {
        User: '',
        Password: '',
        totp: '000000',
        reCaptcha: '',
        output: 'json'
      },
      errorBag: {},
      rules: {
        User: ['required'],
        Password: ['required'],
        totp: ['required'],
        reCaptcha: ['required']
      },
      messages: {
        User: {
          required: 'Username is required',
          regex: 'Username should only contain alpha numeric,. and max 60 characters'
        },
        Password: {
          required: 'Password is required'
        },
        totp: {
          required: 'Google 2FA code is required',
          integer: 'Only numeric value is allowed'
        },
        reCaptcha: {
          required: 'Verify you are not a robot'
        }
      },
      isProcessing: false
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
    const closeModal = () => {
      state.show = false
    }
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
        const payload = state.form
        payload['g-recaptcha-response'] = state.form.reCaptcha
        delete payload.reCaptcha
        http.get(`${process.env.VUE_APP_API_URL}/Login`, {
          params: payload
        }).then(response => {
          if (response.data === 'Session already exists') {
            toast.error(response.data)
            state.isProcessing = false
          } else {
            // Commit user to store
            const user = response.data
            delete user.Status
            user.Username = payload.User
            // Set cookie
            cookies.set('JSESSIONID', user.SessionID)
            store.dispatch(PERSIST_AUTH, user).then(() => {
              // Fetch POS data
              store.dispatch(FETCH_POS_DATA, payload)
              // Fetch account info
              store.dispatch(FETCH_ACCOUNT_INFO).then(response => {
                state.isProcessing = false
                closeModal()
              }).catch(error => {
                state.isProcessing = false
                console.log(error.response)
              })
            })
          }
        }).catch(error => {
          toast.error(error.response.data)
          state.isProcessing = false
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('loginModal', () => {
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      cookies,
      vueRecaptcha,
      mode,
      showError,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      submit
    }
  }
}
</script>

<style scoped>

</style>
