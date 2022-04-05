<template>
  <auth-layout>
    <div class="max-w-xl w-full space-y-4 rounded bg-white dark:bg-gray-800 dark:text-gray-400 shadow p-4">
      <h1 class="text-xl font-bold mb-4 text-center">{{ translate('login.title') }}</h1>
      <form @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.username') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'User') }}</div>
          </div>
          <input v-model="form.User" autofocus class="form-input w-full rounded" type="text"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.password') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'Password') }}</div>
          </div>
          <input v-model="form.Password" class="form-input w-full rounded" type="password"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('login.twofa') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'totp') }}</div>
          </div>
          <input v-model="form.totp" class="form-input w-full" type="text"/>
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
            <span>{{ translate('login.button') }}</span>
          </j-button>
        </div>
      </form>
      <div class="text-center">
        <div class="flex items-center">
          <!--<p class="mr-3">{{ translate('login.forgot') }}   login.recover</p>-->
          <router-link class="link" to="/recover-password" tag="a">{{ translate('login.forgot') }}</router-link>
        </div>
      </div>
      <div class="text-center font-bold my-4">
        <span>Or...</span>
      </div>
      <j-button size="w-full" buttonStyle="outline" @click="authenticate('facebook')">
        <img class="w-5 h-5 mr-3" src="@/assets/images/facebook.svg" alt="facebook"/>
        Sign In With Facebook
      </j-button>
    </div>
  </auth-layout>
</template>

<script>
import AuthLayout from '@/components/layouts/AuthLayout'
import vueRecaptcha from 'vue3-recaptcha2'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { useCookies } from 'vue3-cookies'
import { FETCH_ACCOUNT_INFO, FETCH_POS_DATA, PERSIST_AUTH, SET_LOGIN_TYPE } from '@/store/keys'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import validator from '@/validator'
import { useRouter } from 'vue-router'
import Facebook from '../libs/Facebook'

export default {
  name: 'Login',
  components: {
    AuthLayout,
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

    // Store
    const store = useStore()
    // Router
    const router = useRouter()

    const {
      validate,
      showError
    } = validator()
    // State
    const state = reactive({
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
      isSocial: false,
      facebook: null,
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
    const recaptchaVerified = (response) => {
      state.form.reCaptcha = response
    }
    const recaptchaExpired = () => {
      vueRecaptcha.value.reset()
      state.form.reCaptcha = ''
    }
    const recaptchaFailed = () => {
    }
    const createHash = (username) => {
      let hash = 0
      for (let i = 0; i < username.length; i++) {
        const character = username.charCodeAt(i)
        hash = ((hash << 5) - hash) + character
        hash = hash & hash // Convert to 32bit integer
      }
      return hash
    }
    const authenticate = (provider) => {
      if (provider === 'facebook') {
        state.facebook.signIn().then(userData => {
          if (userData) {
            state.isSocial = true
            if (typeof userData.email !== 'undefined') {
              state.isProcessing = true
              const username = userData.email.replace(/[^a-z0-9]/gi, '')
              const apiToken = createHash(username)
              const payload = {
                User: username,
                Password: userData.id,
                totp: '000000',
                api: apiToken,
                output: 'json'
              }
              login(payload, provider)
            } else {
              toast.error('Please add email to your Facebook account')
            }
          }
        }).catch(error => {
          console.log(error)
        })
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const payload = state.form
        payload['g-recaptcha-response'] = state.form.reCaptcha
        delete payload.reCaptcha
        login(payload)
      }
    }
    const login = (payload, provider = null) => {
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
            if (provider) {
              store.commit(SET_LOGIN_TYPE, !!provider)
            }
            // Fetch account info
            store.dispatch(FETCH_ACCOUNT_INFO).then(response => {
              state.isProcessing = false
              const route = store.state.currentRoute
              // Redirect
              if (route.startsWith('/account')) {
                router.push(route)
              } else {
                router.push('/wallet')
                toast.success('Welcome to Cointopay')
              }
            }).catch(error => {
              state.isProcessing = false
              console.log(error.response)
            })
          })
        }
      }).catch(error => {
        state.isProcessing = false
        toast.error(error.response ? error.response.data : error.data)
        if (state.isSocial) {
          state.facebook.signOut().then(() => {
          })
        } else {
          vueRecaptcha.value.reset()
        }
      })
    }

    onBeforeMount(() => {
      state.facebook = new Facebook(process.env.VUE_APP_FACEBOOK_ID)
      if (state.facebook) {
        state.facebook.initialize().then((response) => {
        }).catch((error) => {
          console.log(error)
        })
      }
      if (isLoggedIn.value) {
        const route = store.state.currentRoute
        router.push(route)
      }
    })

    return {
      translate,
      ...toRefs(state),
      cookies,
      vueRecaptcha,
      mode,
      showError,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      authenticate,
      submit
    }
  }
}
</script>

<style scoped lang="scss">
.rc-anchor-dark {
  @apply bg-gray-800;
}

.link {
  @apply text-blue-500 hover:underline;
}
</style>
