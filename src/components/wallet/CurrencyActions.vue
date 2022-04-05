<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <h5 class="title">{{ translate('dashboard.actions') }}</h5>
      <span class="mr-3 text-yellow-500" @click="launchCurrencyActionsInfoModal()">
        <icon name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-wrap flex-col md:flex-row justify-start -mx-1">
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto" :disabled="selectedCoin.DisablePayout === 1 || selectedBalance.balance <= 0"
                    @click="launchWithdrawCryptoModal">
            {{ translate('dashboard.send') }}
          </j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2" @click="launchDepositCryptoModal">
          <j-button size="w-full md:w-auto">{{ translate('dashboard.receive') }}</j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto" :disabled="selectedCoin.LTREnabled === 0"
                    @click="launchCryptoAddressModal">{{ translate('dashboard.ltr') }}
          </j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto" :disabled="selectedCoin.BuyEnabled === 0 || selectedBalance.balance <= 0"
                    @click="launchSwapModal">
            {{ translate('dashboard.swap') + ' ' + selectedBalance.longname }}
          </j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto" @click="launchVTokenModal">{{ translate('dashboard.vtoken') }}</j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto" :disabled="!isBuyEnabled" @click="launchBuyModal">
            {{ translate('dashboard.buy') + ' ' + selectedBalance.longname }}
          </j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <j-button size="w-full md:w-auto"
            :disabled="selectedCoin.BuyEnabled === 0 || selectedBalance.balance <= 0 || selectedCoin.DisableBankPayout === 1"
            @click="launchBankPayoutModal">
            {{ translate('dashboard.payout') }}
          </j-button>
        </div>
        <div class="mx-0 md:mx-1 mb-2">
          <a target="_blank" :href="`https://exchange.cointopay.com/tradeview/BTC_${selectedCoin.LongName}`"
             class="btn btn-primary w-full md:w-auto">Trade</a>
        </div>
        <div class="mx-0 md:mx-1" v-if="selectedBalance.balance > 0">
          <j-button size="w-full md:w-auto" buttonStyle="danger" @click="trash()">Trash it</j-button>
        </div>
      </div>
    </div>
  </div>
  <!-- Currency Actions Info Modal -->
  <currency-actions-info-modal></currency-actions-info-modal>
  <!-- Withdraw Crypto Modal -->
  <withdraw-crypto-modal></withdraw-crypto-modal>
  <!-- PIN Validation Modal -->
  <pin-validation-modal></pin-validation-modal>
  <!-- Crypto Address Book Modal -->
  <crypto-address-book-modal></crypto-address-book-modal>
  <!-- Deposit Crypto Modal -->
  <deposit-crypto-modal></deposit-crypto-modal>
  <!-- Invoice Modal -->
  <invoice-modal></invoice-modal>
  <!-- Crypto Address Modal -->
  <crypto-address-modal></crypto-address-modal>
  <!-- Buy Modal -->
  <buy-modal></buy-modal>
  <!-- Swap Modal -->
  <swap-modal></swap-modal>
  <!-- VToken Modal -->
  <v-token-modal></v-token-modal>
  <!-- Buy Receipt Modal -->
  <buy-receipt-modal></buy-receipt-modal>
  <!-- Bank Payout Modal -->
  <bank-payout-modal></bank-payout-modal>
  <!-- TransferWise Modal -->
  <transfer-wise-modal></transfer-wise-modal>
</template>

<script>
import Icon from '@/components/Icon'
import CurrencyActionsInfoModal from '@/components/wallet/modals/CurrencyActionsInfoModal'
import WithdrawCryptoModal from '@/components/wallet/currency-actions/modals/WithdrawCryptoModal'
import PinValidationModal from '@/components/wallet/currency-actions/modals/PinValidationModal'
import CryptoAddressBookModal from '@/components/wallet/currency-actions/modals/CryptoAddressBookModal'
import DepositCryptoModal from '@/components/wallet/currency-actions/modals/DepositCryptoModal'
import InvoiceModal from '@/components/wallet/currency-actions/modals/InvoiceModal'
import CryptoAddressModal from '@/components/wallet/currency-actions/modals/CryptoAddressModal'
import BuyModal from '@/components/wallet/currency-actions/modals/BuyModal'
import SwapModal from '@/components/wallet//currency-actions/modals/SwapModal'
import VTokenModal from '@/components/wallet/currency-actions/modals/VTokenModal'
import BuyReceiptModal from '@/components/wallet/currency-actions/modals/BuyReceiptModal'
import BankPayoutModal from '@/components/wallet/currency-actions/modals/BankPayoutModal'
import TransferWiseModal from '@/components/wallet/currency-actions/modals/TransferWiseModal'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import { computed, inject } from 'vue'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

export default {
  name: 'CurrencyActions',
  props: ['selectedBalance', 'balanceList'],
  emits: ['updateBalanceOverviewDetail', 'fetchTransaction', 'fetchTransactions'],
  components: {
    VTokenModal,
    Icon,
    JButton,
    CurrencyActionsInfoModal,
    WithdrawCryptoModal,
    PinValidationModal,
    CryptoAddressBookModal,
    DepositCryptoModal,
    InvoiceModal,
    CryptoAddressModal,
    BuyModal,
    BuyReceiptModal,
    BankPayoutModal,
    TransferWiseModal,
    SwapModal
  },
  setup (props, { emit }) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const swal = inject('swal')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const {
      toFixed,
      saveNotification
    } = compositionUtils()

    // Computed
    const user = computed(() => store.state.user)
    const selectedCoin = computed(() => _.find(store.state.altCoins, { ID: props.selectedBalance.id }))
    const isBuyEnabled = computed(() => store.state.accountInfo && store.state.accountInfo.FinalVerification === '1')

    // Methods
    const launchCurrencyActionsInfoModal = () => {
      emitter.emit('currencyActionsInfoModal', {})
    }
    // Withdraw Crypto Modal - Emitter
    const launchWithdrawCryptoModal = () => {
      emitter.emit('withdrawCryptoModal', {
        selectedBalance: props.selectedBalance,
        selectedCoin: selectedCoin.value,
        balanceList: props.balanceList
      })
    }
    // Deposit Crypto Modal - Emitter
    const launchDepositCryptoModal = () => {
      emitter.emit('depositCryptoModal', {
        selectedBalance: props.selectedBalance,
        selectedCoin: selectedCoin.value,
        confirm: (invoiceData) => {
          emit('updateBalanceOverviewDetail')
          emit('fetchTransaction', invoiceData.TransactionID)
        }
      })
    }
    // Crypto Addresses Modal - Emitter
    const launchCryptoAddressModal = () => {
      emitter.emit('cryptoAddressModal', {
        selectedBalance: props.selectedBalance,
        selectedCoin: selectedCoin.value,
        confirm: (id) => {
          emit('fetchTransaction', id)
        }
      })
    }
    // Swap Modal - Emitter
    const launchSwapModal = () => {
      emitter.emit('swapModal', {
        altCoinID: props.selectedBalance.id,
        amount: props.selectedBalance.balance,
        confirm: () => {
          setTimeout(() => {
            emit('updateBalanceOverviewDetail')
            emit('fetchTransactions')
          }, 3000)
        }
      })
    }
    // VToken Modal - Emitter
    const launchVTokenModal = () => {
      emitter.emit('vTokenModal', {
        selectedBalance: props.selectedBalance,
        confirm: () => {
          emit('updateBalanceOverviewDetail')
          emit('fetchTransactions')
        }
      })
    }
    // Buy Modal - Emitter
    const launchBuyModal = () => {
      emitter.emit('buyModal', {
        selectedBalance: props.selectedBalance,
        selectedCoin: selectedCoin.value
      })
    }
    // Buy Modal - Emitter
    const launchBankPayoutModal = () => {
      emitter.emit('bankPayoutModal', {
        selectedBalance: props.selectedBalance,
        selectedCoin: selectedCoin.value,
        confirm: (id) => {
          emit('updateBalanceOverviewDetail')
          emit('fetchTransaction', id)
        }
      })
    }
    // Thrash It
    const trash = () => {
      swal({
        text: 'Do you want to thrash the full amount?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        focusCancel: true,
        customClass: {
          container: 'swal2-tailwind'
        }
      }).then(({ value }) => {
        if (value && value === true) {
          const apiBaseUrl = process.env.VUE_APP_API_URL
          http.get(`${apiBaseUrl}/v2REAPI`, {
            params: {
              Call: 'Thrashit',
              MerchantID: user.value.ID,
              Amount: toFixed(props.selectedBalance.balance),
              APIKey: user.value.APIKey,
              AltCoinID: props.selectedBalance.id,
              output: 'json'
            }
          }).then(response => {
            if (response.status === 200) {
              toast.success('Balance trashed successfully')
              saveNotification('Balance trashed successfully')
              // getAll(props.selectedBalance.id)
              emit('updateBalanceOverviewDetail')
              emit('fetchTransactions')
            }
          }).catch(error => {
            console.log(error)
          })
        }
      })
    }

    return {
      translate,
      selectedCoin,
      isBuyEnabled,
      launchCurrencyActionsInfoModal,
      launchWithdrawCryptoModal,
      launchDepositCryptoModal,
      launchCryptoAddressModal,
      launchSwapModal,
      launchVTokenModal,
      launchBuyModal,
      launchBankPayoutModal,
      trash
    }
  }
}
</script>

<style scoped></style>
