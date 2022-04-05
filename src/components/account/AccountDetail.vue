<template>
  <div class="card">
    <h5 class="title">{{ translate('account.menu.details') }}</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <form v-if="accountInfo" @submit.prevent="submit()">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.verification') }}</label>
          <div class="col-span-3 md:col-span-2">
            <p class="font-semibold text-red-500" v-if="accountInfo.Verified === '0'">
              {{ translate('account.details.un_verified') }}</p>
            <p class="font-semibold text-green-700 dark:text-green-500" v-if="accountInfo.Verified === '1'">
              {{ translate('account.details.verified') }}</p>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.id') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" :value="accountInfo.ID" readonly/>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.api') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" :value="accountInfo.APIkey" readonly/>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.security_code') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" :value="accountInfo.SecurityCode" readonly/>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.details.organization') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.organizationName"/>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'organizationName') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.details.username') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" :value="accountInfo.OwnerNickName" readonly/>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.password') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input type="password" class="form-input w-full" v-model="form.password"/>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'password') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.details.email') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input type="email" class="form-input w-full" v-model="form.email"/>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'email') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.twofa.auth') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.google2FA" readonly/>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'google2FA') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <div class="col-span-1"></div>
          <div class="col-span-3 md:col-span-2">
            <div class="flex items-center justify-center flex-col">
              <p class="mb-2 cursor-pointer" @click="fetchTotp('GenerateSecurityID')">
                {{ translate('account.details.twofa.reset') }}</p>
              <QRCodeVue3
                :width="qrOptions.width"
                :height="qrOptions.height"
                :qr-options="qrOptions.qrOptions"
                :background-options="qrOptions.backgroundOptions"
                :dots-options="qrOptions.dotsOptions"
                :corners-dot-options="qrOptions.cornersDotOptions"
                :corners-square-options="qrOptions.cornersSquareOptions"
                :value="qrCodeText"></QRCodeVue3>
              <div class="cursor-pointer text-center" @click="fetchTotp('GenerateTOTP')" v-if="!totp">
                <p class="mb-2">{{ translate('account.details.twofa.test') }}</p>
                <p>{{ translate('account.details.twofa.warning') }}</p>
              </div>
              <div class="pointer" v-if="totp">
                <span>Test 2FA, result: {{ totp }}</span>
                <div class="w-full mt-2 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1.5 rounded-full"
                       :style="`width:${progress}%; transition: width 2s;`"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.details.twofa.on_off') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select class="form-select w-full" v-model="form.google2FAEnabled">
              <option value="1">On</option>
              <option value="0">Off</option>
            </select>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'google2FAEnabled') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">{{ translate('account.details.locale') }}</label>
          <div class="col-span-3 md:col-span-2">
            <select class="form-select w-full" v-model="form.locale">
              <option v-for="(language, index) in languages" :key="index" :value="index">{{ language.naam }}</option>
            </select>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
          </div>
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('account.button_update') }}</span>
          </j-button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import QRCodeVue3 from 'qrcode-vue3'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import qrCodeOptions from '@/qrOptions'
import validator from '@/validator'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'AccountDetail',
  components: {
    JButton,
    Icon,
    QRCodeVue3
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    // Store
    const store = useStore()

    const { qrOptions } = qrCodeOptions()
    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      form: {
        organizationName: '',
        email: '',
        password: '',
        google2FA: '',
        google2FAEnabled: '',
        locale: ''
      },
      errorBag: {},
      rules: {
        organizationName: ['required', 'regex:/^([0-9a-zA-Z-:.!@#$^&*+?| ]){1,50}$/'],
        email: ['required', 'email'],
        password: ['regex:/^[0-9a-zA-Z-:.!@#$^&*+_<>? |\\x22%\'(),/;=?[\\]`{}~]{1,25}$/'],
        google2FA: ['required'],
        google2FAEnabled: ['required'],
        locale: ['required']
      },
      google2FA: null,
      totp: null,
      progress: 100,
      timer: null,
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const languages = computed(() => store.state.languages)
    const googleTFA = computed(() => {
      return (state.google2FA) ? state.google2FA : accountInfo.value['2FA']
    })
    const qrCodeText = computed(() => {
      return `otpauth://totp/Cointopay(${accountInfo.value.OwnerNickName})?secret=${googleTFA.value}&issuer=Cointopay`
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules)
        }
      }
    )
    watch(() => ({ ...accountInfo.value }),
      (newVal, oldVal) => {
        state.form = {
          organizationName: newVal.ShopTitle,
          email: newVal.Email,
          google2FA: newVal['2FA'],
          google2FAEnabled: newVal['2FAEnabled'],
          locale: newVal.Locale
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchTotp = (call) => {
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: call,
          MerchantID: accountInfo.value.ID,
          APIKey: accountInfo.value.APIkey,
          AltCoinID: -1,
          TOTPSecurity: state.form.google2FA.replace(/ /g, ''),
          output: 'json'
        }
      }).then(response => {
        if (call === 'GenerateTOTP') {
          state.totp = response.data
          // Reset code after 30 sec
          let counter = 0
          state.timer = setInterval(() => {
            counter++
            if (counter >= 30) {
              counter = 0
              fetchTotp('GenerateTOTP')
              clearInterval(state.timer)
            }
            // Calculate progress
            state.progress = 100 - ((100 / 30) * counter)
          }, 1000)
        } else if (call === 'GenerateSecurityID') {
          state.google2FA = response.data.replace(/ /g, '').replace(/'/g, '')
          state.form.google2FA = state.google2FA
          if (state.timer) {
            clearInterval(state.timer)
            state.totp = null
          }
        }
      }).catch(error => {
        console.log(error.response)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        if (accountInfo.value) {
          const payload = {
            ...accountInfo.value,
            ShopTitle: state.form.organizationName,
            Email: state.form.email,
            '2FA': state.form.google2FA,
            '2FAEnabled': state.form.google2FAEnabled,
            Password: state.form.password,
            Locale: state.form.locale
          }
          state.isProcessing = true
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Account detail updated successfully')
              saveNotification('Account detail updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }

    onBeforeMount(() => {
      if (accountInfo.value) {
        state.form = {
          organizationName: accountInfo.value.ShopTitle,
          email: accountInfo.value.Email,
          google2FA: accountInfo.value['2FA'],
          google2FAEnabled: accountInfo.value['2FAEnabled'],
          locale: accountInfo.value.Locale
        }
      }
    })

    onBeforeUnmount(() => {
      if (state.timer) {
        clearInterval(state.timer)
      }
    })

    return {
      translate,
      ...toRefs(state),
      qrOptions,
      accountInfo,
      languages,
      qrCodeText,
      showError,
      fetchTotp,
      submit
    }
  }
}
</script>

<style scoped></style>
