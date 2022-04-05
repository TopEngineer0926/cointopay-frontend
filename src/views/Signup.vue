<template>
  <auth-layout>
    <div class="max-w-xl w-full space-y-4 rounded bg-white dark:bg-gray-800 dark:text-gray-400 shadow p-4">
      <h1 class="text-xl font-bold mb-4 text-center">{{ translate('signup.title') }}</h1>
      <form @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('signup.username') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'ownernickname') }}</div>
          </div>
          <input autofocus autocomplete="off" class="form-input w-full" type="text" v-model="form.ownernickname"/>
        </div>
        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-1">
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('signup.password') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'ownerpassword') }}</div>
              </div>
              <div class="flex items-center">
                <input class="form-input w-full" type="password" v-model="form.ownerpassword"/>
                <span class="ml-3 cursor-pointer" v-tippy="{content: passwordRules}">
                  <icon name="exclamation-circle" classes="w-5 h-5 text-yellow-500"></icon>
                </span>
              </div>
            </div>
          </div>

          <div class="col-span-1">
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('signup.email') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'email') }}</div>
              </div>
              <input class="form-input w-full" type="email" v-model="form.email"/>
            </div>
          </div>

        </div>

        <div class="mb-2">
          <div class="card mb-1">
            <div class="title">
              <h5>{{ translate('signup.wallets') }}</h5>
            </div>
            <hr class="border-gray-300 dark:border-gray-600"/>
            <div class="body">
              <div v-if="form.selectedaltcoins.length > 0"
                   class="flex flex-wrap justify-start gap-x-1 gap-y-1 md:gap-x-2 md:gap-y-2 mb-4">
                <div v-for="(altCoin, i) in form.selectedaltcoins"
                     :key="i" class="flex items-center w-40">
                  <img :src="generateIconUrl(altCoin.Name)" alt="" class="w-6 h-6 mr-3"/>
                  {{ altCoin.Name }}
                </div>
              </div>
              <div class="text-right">
                <j-button type="button" @click="launchAtlCoinsModal">
                  {{ translate('signup.wallet_button') }}
                </j-button>
              </div>
            </div>
          </div>
          <div class="text-red-500 text-sm">{{ showError(errorBag, 'selectedaltcoins') }}</div>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('signup.locale') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
          </div>
          <select class="form-select w-full" v-model="form.locale">
            <option :key="index" :value="index" v-for="(language, index) in languages">{{ language.naam }}</option>
          </select>
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
            <span>{{ translate('signup.button') }}</span>
          </j-button>
        </div>
      </form>
      <div class="text-center">
        <div class="flex items-center">
          <p class="mr-3">{{ translate('login.forgot') }}</p>
          <router-link class="link" to="/recover-password" tag="a">{{ translate('login.recover') }}</router-link>
        </div>
      </div>
      <div class="text-center font-bold my-4">
        <span>Or...</span>
      </div>
      <j-button size="w-full" buttonStyle="outline" @click="authenticate('facebook')">
        <img class="w-5 h-5 mr-3" src="@/assets/images/facebook.svg" alt="facebook"/>
        Sign Up With Facebook
      </j-button>
    </div>
  </auth-layout>
  <!-- AltCoins Modal -->
  <alt-coins-modal></alt-coins-modal>
</template>

<script>
import AuthLayout from '@/components/layouts/AuthLayout'
import AltCoinsModal from '@/components/auth/modals/AltCoinsModal'
import vueRecaptcha from 'vue3-recaptcha2'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import validator from '@/validator'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FETCH_ACCOUNT_INFO, FETCH_POS_DATA, PERSIST_AUTH, SET_LOGIN_TYPE } from '@/store/keys'
import { useCookies } from 'vue3-cookies'
import compositionUtils from '@/compositionUtils'
import Facebook from '@/libs/Facebook'

export default {
  name: 'Signup',
  components: {
    AuthLayout,
    vueRecaptcha,
    JButton,
    Icon,
    AltCoinsModal
  },
  setup () {
    const { cookies } = useCookies()
    const vueRecaptcha = ref(null)

    // Provides
    const http = inject('http')
    const toast = inject('toast')
    const emitter = inject('emitter')
    const translate = inject('translate')
    // Store
    const store = useStore()
    // Router
    const router = useRouter()

    const {
      validate,
      showError
    } = validator()
    const { generateIconUrl } = compositionUtils()

    const state = reactive({
      reCaptchaAPIKey: process.env.VUE_APP_GOOGLE_reCAPTCHA_SITE_KEY,
      form: {
        ownernickname: '',
        ownerpassword: '',
        email: '',
        selectedaltcoins: [],
        locale: 'EN',
        totp: '000000',
        reCaptcha: ''
      },
      errorBag: {},
      rules: {
        ownernickname: [
          'required',
          'regex:/^[a-zA-Z0-9.]{1,60}$/'
        ],
        ownerpassword: [
          'required',
          'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{6,60}$/'
        ],
        email: ['required', 'email'],
        selectedaltcoins: ['required'],
        locale: ['required'],
        totp: ['required'],
        reCaptcha: ['required']
      },
      messages: {
        ownernickname: {
          required: 'Username is required',
          regex: 'Username should only contain alpha numeric,. and max 60 characters'
        },
        ownerpassword: {
          required: 'Password is required',
          regex: 'Password is not valid'
        },
        email: {
          required: 'Email is required',
          email: 'Please provide a valid email'
        },
        selectedaltcoins: {
          required: 'Please select at least 1 coin'
        },
        locale: {
          required: 'Please select language'
        },
        totp: {
          integer: 'Only numeric value is allowed'
        },
        reCaptcha: {
          required: 'Verify you are not a robot'
        }
      },
      facebook: null,
      isSocial: false,
      isProcessing: false
    })

    // Computed
    const mode = computed(() => store.state.mode)
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const languages = computed(() => store.state.languages)
    const passwordRules = computed(() => {
      return `
            <p>1- Password should be between 6 - 60 characters.</p>
            <p>2. At least one digit.</p>
            <p>3- At least one lowercase character.</p>
            <p>4- At least one uppercase character.</p>
            <p>5- At least one special character. Allowed special characters are @$%#?&!*</p>
        `
    })

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
    const launchAtlCoinsModal = () => {
      emitter.emit('altCoinsModal', {
        selectedAltCoinsList: state.form.selectedaltcoins,
        confirm: (altCoins) => {
          state.form.selectedaltcoins = altCoins
        }
      })
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
              signup(userData)
            } else {
              toast.error('Please add email to your Facebook account')
            }
          }
        }).catch(error => {
          console.log(error)
        })
      }
    }
    const signup = (userData) => {
      const url = new URL(window.location.href)
      let r = url.searchParams.get('r')
      r = r === null ? 0 : r
      let exists = ''
      let params = {
        Call: 'CreateAccount',
        MerchantID: 1,
        APIKey: '_',
        selectedaltcoins: 1,
        shoptitle: userData.name.replace(/ /g, '').toLowerCase(),
        email: userData.email,
        ownernickname: userData.email.replace(/[^a-z0-9]/gi, ''),
        ownerpassword: userData.id,
        locale: 'EN',
        Sticky: 1,
        r: r,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: params
      }).then(response => {
        if (response.data === 'The Username ' + params.ownernickname + ' exists') {
          exists = response.data
          const username = params.ownernickname
          const apiToken = createHash(username)
          params = {
            User: username,
            Password: userData.id,
            totp: '000000',
            api: apiToken,
            output: 'json'
          }
          // Log user in
          http.get(`${apiBaseUrl}/Login`, {
            params: params
          }).then(response => {
            if (response.data === 'Session already exists') {
              toast.error(response.data)
            } else {
              // Commit user to store
              const user = response.data
              user.Username = username
              persistUser(user, userData.id)
            }
          }).catch(error => {
            if (exists !== '') {
              toast.error(exists)
            } else {
              toast.error(error.response.data)
            }
          })
        } else {
          // Commit user to store
          const user = response.data
          user.Username = params.ownernickname
          persistUser(user, params.Password)
        }
      }).catch(error => {
        if (state.isSocial) {
          state.facebook.signOut().then(() => {
          })
        }
        console.log(error)
      })
    }
    const persistUser = (user, password) => {
      delete user.Status
      // Set cookie
      cookies.set('JSESSIONID', user.SessionID, {
        expires: '1Y',
        domain: '.cointopay.com'
      })

      store.dispatch(PERSIST_AUTH, user).then(() => {
        store.dispatch(FETCH_POS_DATA, {
          User: user.Username,
          Password: password
        })
        // Get account info
        store.dispatch(FETCH_ACCOUNT_INFO).then(response => {
          store.commit(SET_LOGIN_TYPE, true)
          // Redirect
          router.push({ name: 'wallet' })
        }).catch(error => {
          console.log(error.response)
        })
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const url = new URL(window.location.href)
        let r = url.searchParams.get('r')
        r = r === null ? 0 : r
        const payload = {
          Call: 'CreateAccount',
          MerchantID: 1,
          APIKey: '_',
          shoptitle: state.form.ownernickname,
          ownernickname: state.form.ownernickname,
          ownerpassword: encodeURIComponent(state.form.ownerpassword),
          email: state.form.email,
          selectedaltcoins: state.form.selectedaltcoins.map(x => x.ID).join(','),
          locale: state.form.locale,
          Sticky: 1,
          r: r,
          output: 'json'
        }

        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          if (response.data === `The Username ${state.form.ownernickname} exists`) {
            state.isProcessing = false
            toast.error('error', response.data)
          } else {
            // Commit user to store
            const user = response.data
            delete user.Status
            user.Username = state.form.ownernickname
            // Set cookie
            cookies.set('JSESSIONID', user.SessionID, '7d', '/', '.cointopay.com', true, 'None')
            store.dispatch(PERSIST_AUTH, user).then(() => {
              // Get pos data
              store.dispatch(FETCH_POS_DATA, {
                User: user.Username,
                Password: payload.ownerpassword
              })
              // Get account info
              store.dispatch(FETCH_ACCOUNT_INFO).then(response => {
                state.isProcessing = false
                // Redirect
                router.push({ name: 'wallet' })
              }).catch(error => {
                state.isProcessing = false
                console.log(error.response)
              })
            })
          }
        }).catch(error => {
          state.isProcessing = false
          toast.error(error.response.data)
        })
      }
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
      vueRecaptcha,
      showError,
      mode,
      languages,
      passwordRules,
      generateIconUrl,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      launchAtlCoinsModal,
      authenticate,
      submit
    }
  }
}
</script>

<style scoped lang="scss">
.link {
  @apply text-blue-500 hover:underline;
}
</style>
