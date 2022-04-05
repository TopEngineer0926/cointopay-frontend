<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('account.wallet.choose') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div class="flex items-center justify-between flex-col md:flex-row">
        <j-button size="w-full md:w-auto" class="mb-2 md:mb-0" type="button" @click="selectAll()">Select All</j-button>
        <j-button size="w-full md:w-auto" class="mb-2 md:mb-0" type="button" @click="selectPopularOnly()">
          Select Popular Only
        </j-button>
        <j-button size="w-full md:w-auto" class="mb-2 md:mb-0" type="button" @click="unSelectAll()">
          Unselect All
        </j-button>
      </div>
      <div class="relative flex-1 my-4">
        <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
        <input v-model="keyword" aria-label="Search..." class="form-input px-10 w-full" type="text"/>
        <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
              @click="keyword = ''">
          <icon classes="w-5 h-5" name="close"></icon>
        </span>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <div v-for="(altCoin, index) in altCoinsList" :key="index"
             :class="`w-24 w-24 p-3 cursor-pointer hover:border-blue-700 dark:hover:border-blue-500 text-center border-2 inline-block rounded-md shadow flex items-center justify-center flex-col ${isSelected(altCoin) ? 'border-green-500' : 'border-gray-300 dark:border-gray-500'}`"
             @click="toggleAltCoinsSelection(altCoin)">
          <img :src="generateIconUrl(altCoin.Name)" alt class="w-10 h-10 mb-2 mx-auto"/>
          <p class="text-xs font-semibold">{{ altCoin.Name }}</p>
        </div>
      </div>
      <div class="text-center mt-4">
        <j-button @click="closeModal()">Close</j-button>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { useStore } from 'vuex'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'

export default {
  name: 'ActiveCurrenciesModal',
  components: {
    Modal,
    JButton,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      generateIconUrl,
      saveNotification
    } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      keyword: '',
      selectedAltCoinsList: [],
      selectedAltCoins: ''
    })
    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const altCoins = computed(() => store.state.altCoins)
    const altCoinsList = computed(() => {
      const coins = _.orderBy(altCoins.value, [coin => coin.Name.toLowerCase()], 'asc')
      return coins.filter(altCoin => {
        if (state.keyword && state.keyword !== '') {
          const keyword = state.keyword.toLowerCase()
          return (
            altCoin.Name.toLowerCase().indexOf(keyword) !== -1 ||
            altCoin.ShortName.toLowerCase().indexOf(keyword) !== -1 ||
            altCoin.LongName.toLowerCase().indexOf(keyword) !== -1
          )
        }
        return true
      })
    })

    // Methods
    const closeModal = () => {
      state.show = false
      updateActiveCurrenciesList()
    }
    const isSelected = (altCoin) => {
      return _.findIndex(state.selectedAltCoinsList, { ID: altCoin.ID }) !== -1
    }
    const selectAll = () => {
      state.selectedAltCoinsList = altCoins.value
      state.selectedAltCoins = state.selectedAltCoinsList.map(x => x.ID).join(',')
    }
    const selectPopularOnly = () => {
      state.selectedAltCoinsList = altCoins.value.filter(altCoin => {
        return altCoin.BuyEnabled === 1 && altCoin.vFiat === 0
      })
      state.selectedAltCoins = state.selectedAltCoinsList.map(x => x.ID).join(',')
    }
    const unSelectAll = () => {
      state.selectedAltCoinsList = altCoins.value.filter(altCoin => [1, 8, 9, 2].indexOf(altCoin.ID) !== -1)
      state.selectedAltCoins = '1,8,9,2'
    }
    const toggleAltCoinsSelection = (altCoin) => {
      const index = _.findIndex(state.selectedAltCoinsList, {
        ID: altCoin.ID
      })
      if (index !== -1) {
        state.selectedAltCoinsList.splice(index, 1)
      } else {
        state.selectedAltCoinsList.push(altCoin)
      }
      state.selectedAltCoins = state.selectedAltCoinsList.map(x => x.ID).join(',')
    }
    const updateActiveCurrenciesList = () => {
      if (state.selectedAltCoinsList.length > 0) {
        const payload = {
          ...accountInfo.value,
          SelectedAltCoins: state.selectedAltCoins
        }
        store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
          if (response.status === 200) {
            // Show success toast
            toast.success('Active coins updated successfully')
            saveNotification('Active coins updated successfully')
            state.selectedAltCoins = ''
          }
        }).catch(error => {
          toast.error(error.data.message)
          saveNotification(error.data.message)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('activeCurrenciesModal', (args) => {
        state.selectedAltCoinsList = args.selectedAltCoins
        state.selectedAltCoins = state.selectedAltCoinsList.map(x => x.ID).join(',')
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      generateIconUrl,
      altCoinsList,
      isSelected,
      toggleAltCoinsSelection,
      selectAll,
      selectPopularOnly,
      unSelectAll
    }
  }
}
</script>

<style scoped></style>
