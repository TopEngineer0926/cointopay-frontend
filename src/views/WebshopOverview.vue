<template>
  <centered-layout>
    <template v-if="!isProcessing">
      <div class="flex items-center justify-between flex-col md:flex-row mb-3">
        <j-button @click="exportToCSV" class="mb-3 md:mb-0">Export to CSV</j-button>
        <div class="flex items-center space-x-2 flex-col md:flex-row">
          <label class="whitespace-nowrap mb-1 md:mb-0">From Date</label>
          <litepie-datepicker as-single v-model="searchForm.fromDate" class="mb-3 md:mb-0"
                              :formatter="{ date: 'YYYY-MM-DD', month: 'MMM' }"></litepie-datepicker>
          <label class="whitespace-nowrap mb-1 md:mb-0">To Date</label>
          <litepie-datepicker as-single v-model="searchForm.toDate" class="mb-3 md:mb-0"
                              :formatter="{ date: 'YYYY-MM-DD', month: 'MMM' }"></litepie-datepicker>
          <div class="relative w-full md:w-auto">
            <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
            <input v-model="keyword" aria-label="Search..." class="form-input w-full px-10" type="text"
                   style="min-width: 220px;"/>
            <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                  @click="keyword = ''">
              <icon classes="w-5 h-5" name="close"></icon>
            </span>
          </div>
        </div>
      </div>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div
        class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
        <table class="table-sm mb-2">
          <thead>
          <tr>
            <th>ID</th>
            <th style="min-width: 180px;">Direction</th>
            <th class="whitespace-nowrap">Created On</th>
            <th class="whitespace-nowrap">Confirmed On</th>
            <th style="min-width: 70px;">Time</th>
            <th class="whitespace-nowrap">Customer Reference Nr</th>
            <th>Original</th>
            <th>Received</th>
            <th class="whitespace-nowrap">Fee Paid</th>
            <th style="min-width: 70px;">Input</th>
            <th class="whitespace-nowrap">Crypto Amount</th>
            <th class="whitespace-nowrap">Crypto Name</th>
            <th class="whitespace-nowrap">Coin Address Used</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(report, i) in paginatedReports" :key="i">
            <td>{{ report.ID }}</td>
            <td>{{ report.Incoming }}</td>
            <td class="whitespace-nowrap">{{ formatDT(report.CreatedOn) }}</td>
            <td class="whitespace-nowrap">{{ formatDT(report.ConfirmedOn) }}</td>
            <td>{{ report.ConfirmationTime }}</td>
            <td class="break-all whitespace-normal" style="max-width: 600px">{{ report.CustomerReferenceNr }}</td>
            <td>{{ report.OriginalAmount }}</td>
            <td>
              <span class="flex items-center">
                {{ report.AmountReceived }}
                <span class="ml-3 cursor-pointer hover:text-blue-500"
                      @click="toConverter(report, 'ic')">
                  <icon name="clipboard" classes="w-5 h-5"></icon>
                </span>
              </span>
            </td>
            <td>{{ report.FeePaidByCustomer }}</td>
            <td>{{ report.InputCurrency }}</td>
            <td>
              <span class="flex items-center">
                {{ report.CryptoCurrencyAmount }}
                <span class="ml-3 cursor-pointer hover:text-blue-500"
                      @click="toConverter(report, 'c')">
                  <icon name="clipboard" classes="w-5 h-5"></icon>
                </span>
              </span>
            </td>
            <td class="whitespace-nowrap">{{ report.Name }}</td>
            <td class="break-all">{{ report.CoinAddressUsed }}</td>
          </tr>
          <template v-if="paginatedReports.length === 0">
            <tr>
              <td colspan="13">No record found!</td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
      <template v-if="filteredReports.length > 0">
        <pagination :meta="meta" @page="updatePage"></pagination>
      </template>
    </template>
    <template v-if="isProcessing">
      <pulse-skeleton></pulse-skeleton>
      <pulse-skeleton></pulse-skeleton>
    </template>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import PulseSkeleton from '@/components/PulseSkeleton'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import Pagination from '@/components/common/Pagination'
import LitepieDatepicker from 'litepie-datepicker'
import compositionUtils from '@/compositionUtils'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SET_CONVERTER } from '@/store/keys'
import * as moment from 'moment'

export default {
  name: 'WebshopOverview',
  components: {
    CenteredLayout,
    PulseSkeleton,
    Icon,
    JButton,
    Pagination,
    LitepieDatepicker
  },
  setup () {
    // Providers
    const http = inject('http')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      formatDT,
      copyToClipboard
    } = compositionUtils()

    // State
    const state = reactive({
      reports: [],
      isProcessing: false,
      keyword: '',
      searchForm: {
        fromDate: '',
        toDate: ''
      },
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 25,
        offset: 0
      }
    })

    // Computed
    const user = computed(() => store.state.user)
    const converter = computed(() => store.state.converter)
    const filteredReports = computed(() => {
      return state.reports.filter(report => {
        let keyword = state.keyword ? state.keyword.toString().trim() : ''
        if (keyword) {
          keyword = keyword.toLowerCase()
          return (
            _.includes(report.ID.toLowerCase(), keyword) ||
            _.includes(report.CustomerReferenceNr.toLowerCase(), keyword) ||
            _.includes(report.InputCurrency && report.InputCurrency.toLowerCase(), keyword) ||
            _.includes(report.Incoming.toLowerCase(), keyword) ||
            _.includes(report.Name.toLowerCase(), keyword) ||
            _.includes(report.CreatedOn, keyword) ||
            _.includes(report.ConfirmedOn, keyword) ||
            _.includes(report.CoinAddressUsed.toLowerCase(), keyword)
          )
        }
        return true
      })
    })
    const paginatedReports = computed(() => {
      if (filteredReports.value.length > 0) {
        return [...filteredReports.value].slice(state.meta.offset, state.meta.offset + state.meta.limit)
      }
      return [...filteredReports.value]
    })
    const allAltCoins = computed(() => store.state.allAltCoins)

    // Watch
    watch(() => ({ ...state.searchForm }),
      (newVal, oldVal) => {
        const fromDate = state.searchForm.fromDate
        const toDate = state.searchForm.toDate
        let isValid = true
        // Check if from date is less or equal to today
        if (new Date(fromDate).getTime() > new Date().getTime()) {
          isValid = false
          state.searchForm.fromDate = ''
          toast.error('From date cannot be greater than today')
        } else if (fromDate !== '' && toDate !== '') {
          if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
            isValid = false
            state.searchForm.fromDate = ''
            toast.error('From date should be less than to date')
          }
        } else {
          if (state.searchForm.toDate === '') {
            state.searchForm.toDate = moment().format('YYYY-MM-DD')
          }
        }
        if (isValid && (state.searchForm.fromDate !== '' || state.searchForm.toDate !== '')) {
          setTimeout(() => {
            fetchWebShopOverviewData(state.searchForm)
          }, 50)
        }
      })

    watch(() => state.keyword,
      (newVal, oldVal) => {
        state.meta = {
          ...state.meta,
          currentPage: 1,
          totalPages: Math.ceil(filteredReports.value.length / state.meta.limit),
          offset: 0
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchWebShopOverviewData = (range = null) => {
      state.isProcessing = true
      const payload = {
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey
      }
      if (range !== null) {
        if (range.fromDate !== '') {
          Object.assign(payload, { fromdate: range.fromDate })
        }
        if (range.todate !== '') {
          Object.assign(payload, { todate: range.toDate })
        }
      }
      http.get(`${apiBaseUrl}/V2Processor?WebShopReport`, {
        params: payload
      }).then(response => {
        state.isProcessing = false
        state.reports = []
        if (response.status === 200) {
          if (Object.keys(response.data.data[0]).length > 0) {
            state.reports = response.data.data
            state.meta = {
              ...state.meta,
              currentPage: 1,
              totalPages: Math.ceil(state.reports.length / state.meta.limit),
              offset: 0
            }
          }
        }
      }).catch(error => {
        state.isProcessing = false
        console.log(error)
      })
    }
    const toConverter = (report, type) => {
      if (type === 'ic') {
        const sourceCoin = _.find(allAltCoins.value, { ShortName: report.InputCurrency })
        const targetCoin = _.find(allAltCoins.value, { Name: report.Name.split(' ')[0] })
        if (sourceCoin) {
          const altCoinID = sourceCoin.ID
          const form = {
            ...converter.value,
            source: report.AmountReceived,
            sourceAltCoinId: altCoinID
          }
          if (targetCoin) {
            form.targetAltCoinId = targetCoin.ID
          }
          store.commit(SET_CONVERTER, form)
        }
        copyToClipboard(report.AmountReceived)
      } else {
        const sourceCoin = _.find(allAltCoins.value, { Name: report.Name.split(' ')[0] })
        const targetCoin = _.find(allAltCoins.value, { ShortName: report.InputCurrency })
        if (sourceCoin) {
          const altCoinID = sourceCoin.ID
          const form = {
            ...converter.value,
            source: report.CryptoCurrencyAmount,
            sourceAltCoinId: altCoinID
          }
          if (targetCoin) {
            form.targetAltCoinId = targetCoin.ID
          }
          store.commit(SET_CONVERTER, form)
        }
        copyToClipboard(report.CryptoCurrencyAmount)
      }
    }
    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }
    // Export to CSV
    const exportToCSV = () => {
      const data = [
        [
          'ID',
          'Direction',
          'CreatedOn',
          'ConfirmedOn',
          'ConfirmationTime',
          'CustomerReferenceNr',
          'OriginalAmount',
          'AmountReceived',
          'FeePaidByCustomer',
          'InputCurrency',
          'CryptoAmount',
          'CryptoName',
          'CoinAddressUsed'
        ]
      ]
      if (state.reports.length > 0) {
        state.reports.forEach(report => {
          data.push([
            report.ID,
            report.Incoming,
            formatDT(report.CreatedOn),
            formatDT(report.ConfirmedOn),
            report.ConfirmationTime,
            report.CustomerReferenceNr,
            report.OriginalAmount,
            report.AmountReceived,
            report.FeePaidByCustomer,
            report.InputCurrency,
            report.CryptoCurrencyAmount,
            report.Name,
            report.CoinAddressUsed
          ])
        })
      }

      const csvContent = data.map(e => e.join(';')).join('\n')
      const encodedUri = encodeURIComponent(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodedUri)
      link.setAttribute('download', 'webshop-overview.csv')
      document.body.appendChild(link)
      link.click()
    }

    onBeforeMount(() => {
      fetchWebShopOverviewData()
    })

    return {
      ...toRefs(state),
      filteredReports,
      paginatedReports,
      formatDT,
      toConverter,
      updatePage,
      exportToCSV
    }
  }
}
</script>

<style scoped></style>
