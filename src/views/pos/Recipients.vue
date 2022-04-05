<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <div class="body">
          <div class="flex items-center justify-end mb-3">
            <div class="relative w-full md:w-2/5">
              <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
              <input v-model="keyword" aria-label="Search..." class="form-input px-10 w-full" type="text"/>
              <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                    @click="keyword = ''">
                <icon classes="w-5 h-5" name="close"></icon>
              </span>
            </div>
          </div>

          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-sm mb-2">
              <thead>
              <tr>
                <th class="whitespace-nowrap">Receipt ID</th>
                <th class="whitespace-nowrap">Transaction ID</th>
                <th @click="sort('TICKETNUMBER')" class="cursor-pointer whitespace-nowrap">
                  Ticket Number
                  <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                        v-if="sortKey === 'TICKETNUMBER'">
                    <icon name="sort" class="w-4 h-4"></icon>
                  </span>
                </th>
                <th @click="sort('CASHIER')" class="pointer whitespace-nowrap">
                  Cashier
                  <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                        v-if="sortKey === 'CASHIER'">
                    <icon name="sort" class="w-4 h-4"></icon>
                  </span>
                </th>
                <th @click="sort('DATE')" class="cursor-pointer whitespace-nowrap">
                  Date
                  <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                        v-if="sortKey === 'DATE'">
                    <icon name="sort" class="w-4 h-4"></icon>
                  </span>
                </th>
                <th @click="sort('TOTAL')" class="cursor-pointer whitespace-nowrap">
                  Total Amount
                  <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                        v-if="sortKey === 'TOTAL'">
                    <icon name="sort" class="w-4 h-4"></icon>
                  </span>
                </th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr :key="index" v-for="(receipt, index) in paginatedReceipts"
                  @click="launchReceiptDetailModal(receipt)" class="cursor-pointer">
                <td>{{ receipt.ID }}</td>
                <td>{{ receipt.TRANSACTION_ID }}</td>
                <td>#{{ receipt.TICKETNUMBER }}</td>
                <td>{{ receipt.CASHIER }}</td>
                <td>{{ formatDT(receipt.DATE) }}</td>
                <td>
                  {{
                    `${receipt.TOTAL.replace('Total Price: ', '').replace(receipt.CURRENCY, '')} ${receipt.CURRENCY}`
                  }}
                </td>
                <td>
                  <button @click="launchReceiptDetailModal(receipt)" class="hover:text-blue-500">
                    <icon name="eye"></icon>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedReceipts.length === 0">
                <td colspan="7">No receipt available</td>
              </tr>
              </tbody>
            </table>
          </div>

          <template v-if="filteredReceipts.length > 0">
            <pagination :meta="meta" @page="updatePage"></pagination>
          </template>

        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Receipt Detail Modal -->
  <receipt-detail-modal></receipt-detail-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import Icon from '@/components/Icon'
import Pagination from '@/components/common/Pagination'
import ReceiptDetailModal from '@/components/account/pos/modals/receipts/ReceiptDetailModal'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import * as moment from 'moment'

export default {
  name: 'Recipients',
  components: {
    'pos-layout': POSLayout,
    Icon,
    Pagination,
    ReceiptDetailModal
  },
  setup () {
    const emitter = inject('emitter')

    const store = useStore()

    const state = reactive({
      keyword: '',
      sortKey: null,
      order: 'asc',
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 25,
        offset: 0
      }
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const filteredReceipts = computed(() => {
      if (state.keyword) {
        return pos.value.receipts.filter(receipt => {
          const keyword = state.keyword.trim().toLowerCase()
          return (
            _.includes(receipt.ID, keyword) ||
            _.includes(receipt.CASHIER.toLowerCase(), keyword) ||
            _.includes(receipt.TICKETNUMBER, keyword) ||
            _.includes(receipt.TRANSACTION_ID, keyword)
          )
        })
      }
      return _.orderBy(pos.value.receipts, 'DATE', 'desc')
    })
    const paginatedReceipts = computed(() => {
      if (filteredReceipts.value && filteredReceipts.value.length > 0) {
        let filteredReceiptsList = _.cloneDeep(filteredReceipts.value)
        filteredReceiptsList = filteredReceiptsList.map(r => {
          return {
            ...r,
            ITEM_PRICE: Number.parseFloat(r.TOTAL.replace('Total Price: ', ''))
          }
        })
        filteredReceiptsList = _.orderBy(filteredReceiptsList, state.sortKey, state.order)
        return filteredReceiptsList.slice(state.meta.offset, state.meta.currentPage * state.meta.limit)
      }
      return filteredReceipts.value
    })

    // Watch
    watch(() => state.keyword,
      (newVal, oldVal) => {
        state.meta = {
          ...state.meta,
          currentPage: 1,
          totalPages: Math.ceil(filteredReceipts.value.length / state.meta.limit),
          offset: 0
        }
      })

    // Methods
    const sort = (key) => {
      if (key === state.sortKey) {
        state.order = state.order === 'asc' ? 'desc' : 'asc'
      }
      state.sortKey = key
    }

    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }

    const formatDT = (date) => {
      return moment(new Date(Number(date))).format('DD/MM/YYYY H:mm A')
    }

    const launchReceiptDetailModal = (receipt) => {
      emitter.emit('receiptDetailModal', {
        receipt: receipt
      })
    }

    onBeforeMount(() => {
      state.employee = _.find(pos.value.users, { isLoggedIn: 'true' })
      state.meta = {
        ...state.meta,
        currentPage: 1,
        totalPages: Math.ceil(filteredReceipts.value.length / state.meta.limit),
        offset: 0
      }
    })

    return {
      ...toRefs(state),
      filteredReceipts,
      paginatedReceipts,
      sort,
      updatePage,
      formatDT,
      launchReceiptDetailModal
    }
  }
}
</script>

<style lang="scss" scoped>
.table-sm {
  thead {
    tr {
      th:first-child {
        @apply pl-3;
      }
    }
  }

  tbody {
    tr {
      td:first-child {
        @apply pl-3;
      }
    }
  }
}
</style>
