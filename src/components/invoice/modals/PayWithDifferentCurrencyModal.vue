<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>Pay with different currency</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div class="relative flex-1">
        <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
        <input v-model="keyword" aria-label="Search..." class="form-input px-10 w-full" type="text"/>
        <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
              @click="keyword = ''">
          <icon classes="w-5 h-5" name="close"></icon>
        </span>
      </div>
      <div class="flex flex-wrap justify-center gap-2 mt-4">
        <div class="w-24 w-24 p-3 cursor-pointer text-center border-2 border-gray-300 dark:border-gray-500 hover:border-blue-700 dark:hover:border-blue-500 inline-block rounded-md shadow flex items-center justify-center flex-col"
             v-for="(coin, index) in coinsList" :key="index">
          <a :href="generateUrl(coin.id)">
            <img class="w-10 h-10 mb-2 mx-auto" :src="generateIconUrl(coin.name)" alt/>
            <p class="text-xs font-semibold">{{ coin.name }}</p>
          </a>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'PayWithDifferentCurrencyModal',
  components: {
    Modal,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')

    const { generateIconUrl } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      keyword: '',
      coins: [],
      invoice: null
    })
    // Computed
    const coinsList = computed(() => {
      return state.coins.filter(coin => {
        if (state.keyword && state.keyword !== '') {
          return (
            coin.name.toLowerCase().indexOf(state.keyword.toLowerCase()) !== -1 &&
            coin.id !== 0 && coin.id !== state.invoice.AltCoinID
          )
        }
        return coin.id !== 0 && coin.id !== state.invoice.AltCoinID
      })
    })
    // Methods
    const closeModal = () => {
      state.show = false
    }
    // Generate clone transaction url
    const generateUrl = (id) => {
      return `https://cointopay.com/CloneMasterTransaction?TargetAltCoinID=${id}&TransactionID=${state.invoice.TransactionID}&MerchantID=${state.invoice.MerchantID}`
    }

    onBeforeMount(() => {
      emitter.on('payWithDifferentCurrencyModal', (args) => {
        state.coins = args.coins
        state.invoice = args.invoice
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      coinsList,
      generateUrl,
      generateIconUrl
    }
  }
}
</script>

<style scoped></style>
