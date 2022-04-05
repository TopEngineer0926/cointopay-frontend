<template>
  <div
    class='flex items-center flex-col md:flex-row w-full lg:w-3/5'
    v-if='form'
  >
    <div class='flex items-center mr-0 md:mr-4 mb-3 md:mb-0'>
      <j-button
        type='button'
        buttonStyle='default'
        class='rounded-r-none'
        @click='copyToClipboard(form.source)'
      >
        <icon name='clipboard' classes='w-5 h-5'></icon>
      </j-button>
      <input
        ref='source'
        v-model='form.source'
        class='form-input w-full rounded-none h-9'
        type='text'
        @keyup='calculate(true)'
      />
      <div
        id='source-dropdown'
        class='relative z-20'
        v-click-away='
          () => {
            sourceDropdown = false
          }
        '
      >
        <j-button
          type='button'
          size='w-30'
          buttonStyle='default'
          class='rounded-l-none flex items-center'
          @click='toggleDropdown(true)'
        >
          <img
            v-if='sourceAltCoin'
            :src='generateIconUrl(sourceAltCoin.Name)'
            alt=''
            class='w-5 h-5'
          />
          <!-- <span class='mx-2'>{{ sourceAltCoin.LongName }}</span> -->
          <span>
            <icon name='chevron-down' classes='w-4 h-4'></icon>
          </span>
        </j-button>
        <ul
          v-show='sourceDropdown'
          class='
            w-72
            h-72
            bg-gray-50
            dark:bg-gray-800
            shadow-lg
            border
            dark:border-gray-600
            absolute
            rounded
            right-0
            top-10
            scrollbar
            scrollbar-thin
            scrollbar-thumb-gray-400
            scrollbar-track-gray-200
            dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600
          '
        >
          <li class='p-3'>
            <input
              ref='sourceKeywordInput'
              v-model='keyword'
              aria-label=''
              class='form-input w-full h-9'
              type='text'
              @keydown.enter='setSourceID(null)'
            />
            <div class='clearfix'></div>
          </li>
          <li>
            <div class='divider'></div>
          </li>
          <li v-for='(record, index) in filteredSourceAltCoins' :key='index'>
            <a
              class='
                px-3
                flex
                items-center
                py-1
                hover:bg-gray-300
                dark:hover:bg-gray-700
              '
              href='javascript:void(0)'
              @click='setSourceID(record.ID)'
            >
              <img :src='generateIconUrl(record.Name)' alt='' class='w-5 h-5' />
              <!-- <span class='ml-8'>{{
                `${record.LongName} ${record.Name}`
              }}</span> -->
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class='flex items-center'>
      <j-button
        type='button'
        buttonStyle='default'
        class='rounded-r-none'
        @click='copyToClipboard(form.target)'
      >
        <icon name='clipboard' classes='w-5 h-5'></icon>
      </j-button>
      <input
        ref='target'
        v-model='form.target'
        class='form-input w-full h-9 rounded-none'
        type='text'
        @keyup='calculate(false)'
      />
      <div
        id='target-dropdown'
        class='relative z-10'
        v-click-away='
          () => {
            targetDropdown = false
          }
        '
      >
        <j-button
          type='button'
          size='w-30'
          buttonStyle='default'
          class='rounded-l-none flex items-center'
          @click='toggleDropdown(false)'
        >
          <img
            v-if='targetAltCoin'
            :src='generateIconUrl(targetAltCoin.Name)'
            alt=''
            class='w-5 h-5'
          />
          <!-- <span class='mx-2'>{{ targetAltCoin.LongName }}</span> -->
          <span>
            <icon name='chevron-down' classes='w-4 h-4'></icon>
          </span>
        </j-button>
        <ul
          v-show='targetDropdown'
          class='
            w-72
            h-72
            bg-gray-50
            dark:bg-gray-800
            shadow-lg
            border
            dark:border-gray-600
            absolute
            rounded
            right-0
            top-10
            scrollbar
            scrollbar-thin
            scrollbar-thumb-gray-400
            scrollbar-track-gray-200
            dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600
          '
        >
          <li class='p-3'>
            <input
              ref='targetKeywordInput'
              v-model='targetKeyword'
              aria-label=''
              class='form-input w-full h-9'
              type='text'
              @keydown.enter='setTargetID(null)'
            />
            <div class='clearfix'></div>
          </li>
          <li>
            <div class='divider'></div>
          </li>
          <li v-for='(record, index) in filteredTargetAltCoins' :key='index'>
            <a
              class='
                px-3
                flex
                items-center
                py-1
                hover:bg-gray-300
                dark:hover:bg-gray-700
              '
              href='javascript:void(0)'
              @click='setTargetID(record.ID)'
            >
              <img :src='generateIconUrl(record.Name)' alt='' class='w-5 h-5' />
              <!-- <span class='ml-8'>{{
                `${record.LongName} ${record.Name}`
              }}</span> -->
            </a>
          </li>
        </ul>
      </div>
    </div>

    <span class='hidden lg:block mx-3 cursor-pointer' @click='reset()'>
      <icon name='refresh'></icon>
    </span>
  </div>
</template>

<script>
import JButton from '@/templates/ButtonS'
import Icon from '@/components/Icon'
import {
  computed,
  inject,
  onBeforeMount,
  reactive,
  toRefs,
  watch,
  ref
} from 'vue'
import { useStore } from 'vuex'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import { SET_CONVERTER } from '../store/keys'

export default {
  name: 'Converter',
  components: {
    JButton,
    Icon
  },
  setup () {
    // Providers
    const http = inject('http')
    const toast = inject('toast')
    // Store
    const store = useStore()

    const { generateIconUrl, copyToClipboard, toFixed } = compositionUtils()

    const sourceKeywordInput = ref()
    const targetKeywordInput = ref()

    const state = reactive({
      form: null,
      keyword: '',
      targetKeyword: '',
      fiatValue: 0,
      isReverse: false,
      sourceDropdown: false,
      targetDropdown: false
    })
    // Computed
    const user = computed(() => store.state.user)
    const converter = computed(() => store.state.converter)
    const allAltCoins = computed(() => store.state.allAltCoins)
    const sourceAltCoin = computed(() => {
      if (state.form && state.form.sourceAltCoinId) {
        return _.find(allAltCoins.value, {
          ID: Number(state.form.sourceAltCoinId)
        })
      }
      return null
    })
    const targetAltCoin = computed(() => {
      if (state.form && state.form.targetAltCoinId) {
        return _.find(allAltCoins.value, {
          ID: Number(state.form.targetAltCoinId)
        })
      }
      return null
    })
    const filteredSourceAltCoins = computed(() => {
      const altCoins = _.cloneDeep(allAltCoins.value)
      return altCoins.filter((coin) => {
        if (state.keyword) {
          const keyword = state.keyword.trim().toLowerCase()
          return (
            _.includes(coin.LongName.toLowerCase(), keyword) ||
            _.includes(coin.ShortName.toString().toLowerCase(), keyword) ||
            _.includes(coin.Name.toString().toLowerCase(), keyword)
          )
        }
        return true
      })
    })
    const filteredTargetAltCoins = computed(() => {
      const altCoins = _.cloneDeep(allAltCoins.value)
      return altCoins.filter((coin) => {
        if (state.targetKeyword) {
          const keyword = state.targetKeyword.trim().toLowerCase()
          return (
            _.includes(coin.LongName.toLowerCase(), keyword) ||
            _.includes(coin.ShortName.toString().toLowerCase(), keyword) ||
            _.includes(coin.Name.toString().toLowerCase(), keyword)
          )
        }
        return true
      })
    })

    // Watch
    watch(
      () => state.form && state.form.sourceAltCoinId,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          store.commit(SET_CONVERTER, state.form)
        }
      }
    )
    watch(
      () => state.form && state.form.targetAltCoinId,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          store.commit(SET_CONVERTER, state.form)
        }
      }
    )
    watch(
      () => ({ ...converter.value }),
      (newVal, oldVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          state.form = { ...newVal }
          fiatLookup()
        }
      }
    )
    watch(
      () => state.form && state.form.source,
      (newVal, oldVal) => {
        if (
          newVal &&
          newVal !== oldVal &&
          newVal.toString().indexOf(',') !== -1
        ) {
          state.form.source = newVal.replace(',', '.')
          store.commit(SET_CONVERTER, state.form)
        }
      }
    )
    watch(
      () => state.form && state.form.target,
      (newVal, oldVal) => {
        if (
          newVal &&
          newVal !== oldVal &&
          newVal.toString().indexOf(',') !== -1
        ) {
          state.form.target = newVal.replace(',', '.')
          store.commit(SET_CONVERTER, state.form)
        }
      }
    )

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const setSourceID = (id) => {
      if (id) {
        state.form.sourceAltCoinId = id
      } else if (filteredSourceAltCoins.value.length > 0) {
        state.form.sourceAltCoinId = filteredSourceAltCoins.value[0].ID
      }
      state.sourceDropdown = false
    }
    const setTargetID = (id) => {
      if (id) {
        state.form.targetAltCoinId = id
      } else if (filteredTargetAltCoins.value.length > 0) {
        state.form.targetAltCoinId = filteredTargetAltCoins.value[0].ID
      }
      state.targetDropdown = false
    }
    const toggleDropdown = (isSource = true) => {
      if (isSource) {
        state.sourceDropdown = !state.sourceDropdown
        state.targetDropdown = false
        setTimeout(() => {
          sourceKeywordInput.value.focus()
        }, 50)
      } else {
        state.targetDropdown = !state.targetDropdown
        state.sourceDropdown = false
        setTimeout(() => {
          targetKeywordInput.value.focus()
        }, 50)
      }
    }
    const calculate = (isSource = true) => {
      if (!state.isReverse) {
        if (isSource) {
          if (state.form.source !== '') {
            state.form.target = toFixed(state.fiatValue * state.form.source)
          }
        } else {
          if (state.form.target !== '') {
            state.form.source = toFixed(state.form.target / state.fiatValue)
          }
        }
      } else {
        if (isSource) {
          if (state.form.source !== '') {
            state.form.target = toFixed(state.form.source / state.fiatValue)
          }
        } else {
          if (state.form.target !== '') {
            state.form.source = toFixed(state.form.target * state.fiatValue)
          }
        }
      }
    }
    const fiatLookup = () => {
      state.isReverse = false
      const targetCurrency = targetAltCoin.value
        ? targetAltCoin.value.ShortName
        : 'EUR'
      http
        .get(`${apiBaseUrl}/v2REAPI`, {
          params: {
            Call: 'Fiatlookup',
            MerchantID: user.value ? user.value.ID : '1',
            APIKey: user.value ? user.value.APIKey : '_',
            AltCoinID: state.form.sourceAltCoinId,
            Amount: 1,
            FiatLookup: 0,
            FiatMoney: targetCurrency,
            output: 'json'
          }
        })
        .then((response) => {
          if (response.data && response.data.length > 0) {
            state.fiatValue = response.data[0].OutputValue
            calculate()
          } else {
            reverseFiatLookup()
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
    const reverseFiatLookup = () => {
      state.isReverse = true
      const sourceCurrency = _.find(allAltCoins.value, {
        ID: state.form.sourceAltCoinId
      })
      http
        .get(`${apiBaseUrl}/v2REAPI`, {
          params: {
            Call: 'Fiatlookup',
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            AltCoinID: state.form.targetAltCoinId,
            Amount: 1,
            FiatLookup: 0,
            FiatMoney: sourceCurrency.ShortName,
            output: 'json'
          }
        })
        .then((response) => {
          if (response.data && response.data.length > 0) {
            state.fiatValue = response.data[0].OutputValue
            calculate()
          } else {
            state.fiatValue = 0
            state.form = {
              ...state.form,
              source: '',
              target: ''
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
    const reset = () => {
      fiatLookup()
      toast.success('Rate refreshed')
    }

    onBeforeMount(() => {
      if (converter.value === null) {
        state.form = {
          source: 1,
          sourceAltCoinId: 1,
          target: 0,
          targetAltCoinId: 625
        }
        store.commit(SET_CONVERTER, state.form)
      } else {
        state.form = { ...converter.value }
      }
      fiatLookup()
    })

    return {
      ...toRefs(state),
      generateIconUrl,
      copyToClipboard,
      sourceAltCoin,
      targetAltCoin,
      filteredSourceAltCoins,
      filteredTargetAltCoins,
      toggleDropdown,
      setSourceID,
      setTargetID,
      calculate,
      reset,
      sourceKeywordInput,
      targetKeywordInput
    }
  }
}
</script>

<style scoped></style>
