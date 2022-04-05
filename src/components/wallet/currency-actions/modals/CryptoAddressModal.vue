<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('dashboard.ltr') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-1">
          <j-button size="w-full" :disabled="loading" @click="createAddress">
            <div v-if="loading === 'createAddress'" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('ltr.create') }}</span>
          </j-button>
        </div>
        <div class="col-span-1">
          <j-button size="w-full" :disabled="loading" @click="consolidate">
            <div v-if="loading === 'consolidate'" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('ltr.consolidate') }}</span>
          </j-button>
        </div>
      </div>

      <div class="mt-4" v-if="ltaData.length && !consolidateData && !loading">
        <div class="mx-auto">
          <h3 class="text-center mb-3 font-semibold text-lg capitalize">LTR Addresses created</h3>
          <div style="max-height: 500px"
               class="overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <div v-for="(record, i) in ltaData" :key="i">
              <div class="text-center">
                <QRCodeVue3 imgclass="mx-auto"
                            :width="qrOptions.width"
                            :height="qrOptions.height"
                            :qr-options="qrOptions.qrOptions"
                            :background-options="qrOptions.backgroundOptions"
                            :dots-options="qrOptions.dotsOptions"
                            :corners-dot-options="qrOptions.cornersDotOptions"
                            :corners-square-options="qrOptions.cornersSquareOptions"
                            :value="record.CoinAddressUsed"></QRCodeVue3>
              </div>
              <div class="mt-4">
                <p class="text-center">{{ record.CoinAddressUsed }}</p>
                <p class="text-center">will expire on {{ record.ExpiryDate }}</p>
                <p class="text-center">has balance <span class="font-semibold">{{ record.AddressBalance }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-if="loading === null">
        <p class="font-semibold text-center text-xl mt-3" v-if="consolidateData && ltaData.length === 0">
          {{ consolidateData }}
        </p>
      </template>
      <template v-if="loading">
        <pulse-skeleton></pulse-skeleton>
      </template>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import PulseSkeleton from '@/components/PulseSkeleton'
import QRCodeVue3 from 'qrcode-vue3'
import qrCodeOptions from '@/qrOptions'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'

export default {
  name: 'CryptoAddressModal',
  components: {
    Modal,
    Icon,
    JButton,
    PulseSkeleton,
    QRCodeVue3
  },
  setup () {
    const { qrOptions } = qrCodeOptions()
    const { saveNotification } = compositionUtils()
    // Providers
    const http = inject('http')
    const toast = inject('toast')
    const translate = inject('translate')
    const emitter = inject('emitter')
    // Store
    const store = useStore()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      selectedBalance: null,
      selectedCoin: null,
      ltaData: [],
      consolidateData: null,
      confirmHook: () => {
      },
      loading: null
    })
    // Computed
    const user = computed(() => store.state.user)
    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL

    const closeModal = () => {
      state.show = false
    }
    // Load Crypto Addresses
    const loadLongTermAddress = (isCallback = true) => {
      state.consolidateData = null
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'LTRAddressOverview',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          output: 'json'
        }
      }).then(response => {
        state.ltaData = response.data
        if (state.ltaData && isCallback) {
          const ltr = state.ltaData[state.ltaData.length - 1]
          state.confirmHook(ltr.ID)
        }
      }).catch(error => {
        console.log(error)
      })
    }
    // Create Crypto Address
    const createAddress = () => {
      state.loading = 'createAddress'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'LTRNewAddress',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          output: 'json'
        }
      }).then(response => {
        state.loading = null
        if (response.data !== 'Merchant custom Address Limit of 5 reached') {
          loadLongTermAddress()
          toast.success('LTR address created successfully')
          saveNotification('LTR address created successfully')
        } else {
          toast.error(response.data)
          saveNotification(response.data)
        }
      }).catch(error => {
        state.loading = null
        console.log(error)
      })
    }
    // Consolidate
    const consolidate = () => {
      state.loading = 'consolidate'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'LTRConsolidate',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          output: 'json'
        }
      }).then(response => {
        state.loading = null
        if (response.data.toLowerCase() === 'completed') {
          state.ltaData = []
          state.consolidateData = 'Consolidate to main balance, please wait...'
        }
      }).catch(error => {
        state.loading = null
        console.log(error)
      })
    }

    onBeforeMount(() => {
      emitter.on('cryptoAddressModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.selectedCoin = args.selectedCoin
        state.confirmHook = args.confirm
        // Load Crypto Addresses
        loadLongTermAddress(false)
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      qrOptions,
      ...toRefs(state),
      closeModal,
      createAddress,
      consolidate
    }
  }
}
</script>

<style scoped></style>
