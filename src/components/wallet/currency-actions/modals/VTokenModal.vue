<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('dashboard.vtoken') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <tab-set>
        <tab :name="translate('vtoken.button_claim')" :selected="true">
          <form v-if="formClaimVToken" @submit.prevent="claimVToken">
            <alert :message="errorMessageClaim" alertType="danger" @clear="errorMessageClaim = null"></alert>
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('vtoken.token') }}</label>
                <div class="flex items-center">
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'token') }}</div>
                  <span class="cursor-pointer ml-4" @click="isScanner = !isScanner">
                    <icon classes="w-5 h-5" name="qr-code"></icon>
                  </span>
                </div>
              </div>
              <input v-model="formClaimVToken.token" class="form-input w-full" type="text" @keyup="cleanToken">
            </div>
            <div v-if="isScanner" class="mb-4 flex items-start">
              <div class="flex-1 text-center border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-700 p-4">
                <div v-if="isScanner" class="w-72 h-48 mx-auto">
                  <qrcode-stream @decode="onDecode" @init="onInit">
                    <div v-if="loading" class="h-48 bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                      <icon classes="w-12 h-12 text-gray-800 dark:text-gray-400" name="spinner"></icon>
                    </div>
                  </qrcode-stream>
                </div>
              </div>
              <div class="text-right ml-3">
                <j-button buttonStyle="default" @click="isScanner = false">
                  <icon classes="w-5 h-5" name="close"></icon>
                </j-button>
              </div>
            </div>

            <div class="mt-4 text-right">
              <j-button :disabled="isProcessing">
                <div v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </div>
                <span>{{ translate('vtoken.button_claim') }}</span>
              </j-button>
            </div>
          </form>
        </tab>
        <tab :name="translate('vtoken.button_create')">
          <alert :message="errorMessageCreate" alertType="danger" @clear="errorMessageCreate = null"></alert>
          <form v-if="formCreateVToken" @submit.prevent="createVToken">
            <div v-if="successMessageCreate" class="mb-4 text-center">
              <QRCodeVue3 :background-options="qrOptions.backgroundOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :value="successMessageCreate"
                          :width="qrOptions.width"
                          imgclass="mx-auto"></QRCodeVue3>
              <div class="flex items-center mt-4">
                <input ref="copy" :value="successMessageCreate" type="text" class="form-input w-full h-9 rounded-r-none">
                <j-button type="button" @click="copyToClipboard(successMessageCreate)"
                  class="rounded-l-none h-9">
                  <icon classes="w-5 h-5" name="clipboard"></icon>
                </j-button>
              </div>
            </div>
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('vtoken.amount') }}</label>
                <div>
                  <a v-if="!showError(errorBag, 'amount')" class="cursor-pointer"
                     @click="formCreateVToken.amount = Number(selectedBalance.balance)">
                    {{ `${selectedBalance.balance} ${selectedBalance.longname}` }}</a>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'amount') }}</div>
                </div>
              </div>
              <input v-model="formCreateVToken.amount" class="form-input w-full" type="text">
            </div>

            <div class="mt-4 text-right">
              <j-button :disabled="isProcessing || Number(selectedBalance.balance) <= 0">
                <div v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </div>
                <span>{{ translate('vtoken.button_create') }}</span>
              </j-button>
            </div>
          </form>
        </tab>
      </tab-set>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import { useStore } from 'vuex'
import validator from '@/validator'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import qrCodeOptions from '@/qrOptions'
import compositionUtils from '@/compositionUtils'
import Alert from '@/templates/Alert'
import { QrcodeStream } from 'vue3-qrcode-reader'

export default {
  name: 'VTokenModal',
  components: {
    Alert,
    Tab,
    TabSet,
    Modal,
    Icon,
    JButton,
    QrcodeStream
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const emitter = inject('emitter')

    // Store
    const store = useStore()
    const {
      showError,
      validate
    } = validator()
    const { qrOptions } = qrCodeOptions()
    const {
      copyToClipboard,
      saveNotification
    } = compositionUtils()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      selectedBalance: null,
      errorBag: {},
      formCreateVToken: null,
      rulesCreateToken: {
        amount: ['required', 'decimal:8']
      },
      successMessageCreate: null,
      errorMessageCreate: null,
      formClaimVToken: null,
      rulesClaimToken: {
        token: ['required']
      },
      errorMessageClaim: null,
      isScanner: false,
      isProcessing: false,
      loading: false,
      confirmHook: () => {}
    })
    // Computed
    const user = computed(() => store.state.user)

    // Watch
    watch(() => ({ ...state.formCreateVToken }),
      (newValue, oldValue) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newValue, state.rulesCreateToken)
        }
      })
    watch(() => ({ ...state.formClaimVToken }),
      (newValue, oldValue) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newValue, state.rulesClaimToken)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    // Create VToken
    const createVToken = () => {
      state.errorBag = validate(state.formCreateVToken, state.rulesCreateToken)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const payload = {
          Call: 'VTOKEN',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Amount: state.formCreateVToken.amount,
          Direction: 1,
          output: 'json',
          V2: ''
        }
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            if (typeof response.data === 'string') {
              if (response.data.toLowerCase().startsWith('payout') ||
                response.data.toLowerCase().startsWith('amount') || response.data.toLowerCase() === 'not enough balance for vtoken creation') {
                state.errorMessageCreate = response.data.replace(/^\w/, c => c.toUpperCase())
              } else {
                state.successMessageCreate = response.data
                state.formCreateVToken.amount = ''
                state.confirmHook()
              }
            }
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }
    // Claim VToken
    const claimVToken = () => {
      state.errorBag = validate(state.formClaimVToken, state.rulesClaimToken)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const payload = {
          Call: 'VTOKEN',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Token: state.formClaimVToken.token.trim(),
          Amount: 1,
          Direction: 0,
          output: 'json',
          V2: ''
        }
        state.errorMessageClaim = null
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            if (typeof response.data === 'string') {
              if (response.data.toLowerCase() === 'ok') {
                toast.success('vToken claimed successfully')
                saveNotification('vToken claimed successfully')
                state.formClaimVToken.token = ''
                state.confirmHook()
              } else {
                state.errorMessageClaim = response.data.replace(/^\w/, c => c.toUpperCase())
              }
            }
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }
    // Init QrCode Reader
    const onInit = async (promise) => {
      try {
        state.loading = true
        await promise
      } catch (error) {
        let errorMsg = ''
        if (error.name === 'NotAllowedError') {
          errorMsg = 'ERROR: you need to grant camera access permission'
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'ERROR: no camera on this device'
        } else if (error.name === 'NotSupportedError') {
          errorMsg = 'ERROR: secure context required (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'ERROR: is the camera already in use?'
        } else if (error.name === 'OverconstrainedError') {
          errorMsg = 'ERROR: installed cameras are not suitable'
        } else if (error.name === 'StreamApiNotSupportedError') {
          errorMsg = 'ERROR: Stream API is not supported in this browser'
        }
        toast.error(errorMsg)
        saveNotification(errorMsg)
      } finally {
        state.loading = false
      }
    }
    // Decode QrCode
    const onDecode = (content) => {
      if (content) {
        state.formClaimVToken.token = content
        state.isScanner = false
      }
    }
    // Clean VToken
    const cleanToken = () => {
      if (state.formClaimVToken.token) {
        state.formClaimVToken.token = state.formClaimVToken.token.trim()
      }
    }

    onBeforeMount(() => {
      emitter.on('vTokenModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.confirmHook = args.confirm
        // Create VToken
        state.successMessageCreate = null
        state.errorMessageCreate = null
        state.formCreateVToken = {
          amount: ''
        }
        // Claim VToken
        state.formClaimVToken = {
          token: ''
        }
        state.errorMessageClaim = null
        state.isScanner = false
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      qrOptions,
      showError,
      copyToClipboard,
      closeModal,
      createVToken,
      claimVToken,
      cleanToken,
      onInit,
      onDecode
    }
  }
}
</script>

<style scoped>

</style>
