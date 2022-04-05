<template>
  <div class="text-right mb-3">
    <j-button @click="launchSaveShippingMethodModal()">{{ translate('pos.shipping.btn_add') }}</j-button>
  </div>
  <div
    class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
    <table class="table-sm">
      <thead>
      <tr>
        <th class="whitespace-nowrap">{{ translate('pos.shipping.headings.country') }}</th>
        <th class="whitespace-nowrap">{{ translate('pos.shipping.headings.shipping_method') }}</th>
        <th class="whitespace-nowrap">{{ translate('pos.shipping.headings.shipping_cost') }}</th>
        <th class="w-32">{{ translate('pos.shipping.headings.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="index" v-for="(shippingMethod, index) in paginatedShippingMethods">
        <td>{{ shippingMethod.countryName }}</td>
        <td>{{ shippingMethod.shippingMethod }}</td>
        <td>{{ formatPrice(shippingMethod.shippingCost, currency) }}</td>
        <td>
          <button @click="launchSaveShippingMethodModal(shippingMethod)" class="hover:text-blue-500 mr-2">
            <icon name="edit"></icon>
          </button>
          <button @click="deleteShippingMethod(index)" class="hover:text-red-500" type="button">
            <icon name="trash"></icon>
          </button>
        </td>
      </tr>
      <tr v-if="shippingMethods.length === 0">
        <td colspan="4">{{ translate('pos.shipping.no_data') }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <template v-if="shippingMethods.length > 0">
    <pagination :meta="meta" @page="updatePage"></pagination>
  </template>
  <!-- Save Shipping Method Modal -->
  <save-shipping-method-modal></save-shipping-method-modal>
</template>

<script>
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import Pagination from '@/components/common/Pagination'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import { FETCH_SHIPPING_METHODS, SAVE_SHIPPING_METHODS } from '@/store/keys'
import SaveShippingMethodModal from '@/components/account/pos/modals/office/SaveShippingMethodModal'

export default {
  name: 'ShippingMethods',
  components: {
    Icon,
    JButton,
    Pagination,
    SaveShippingMethodModal
  },
  setup () {
    const translate = inject('translate')
    const swal = inject('swal')
    const toast = inject('toast')
    const emitter = inject('emitter')

    // Store
    const store = useStore()

    const { formatPrice } = compositionUtils()

    // State
    const state = reactive({
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 25,
        offset: 0
      }
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const altCoins = computed(() => store.state.altCoins)
    const shippingMethods = computed(() => store.state.shippingMethods)
    const currency = computed(() => {
      let currency = 'EUR'
      if (accountInfo.value) {
        currency = accountInfo.value.PayoutCurrencyShortName
        // Convert short name to long name
        const altCoin = _.find(altCoins.value, { ShortName: accountInfo.value.PayoutCurrencyShortName })
        if (altCoin) {
          currency = altCoin.LongName
        }
      }
      return currency
    })
    const paginatedShippingMethods = computed(() => {
      if (shippingMethods.value.length > 0) {
        return shippingMethods.value.slice(
          state.meta.offset,
          state.meta.currentPage * state.meta.limit
        )
      }
      return shippingMethods.value
    })

    // Methods
    // Update page
    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }
    const deleteShippingMethod = (index) => {
      swal.fire({
        title: 'Delivery Option',
        text: 'Are you sure, want to delete this delivery option?',
        icon: 'warning',
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
          const shippingMethodsList = _.cloneDeep(shippingMethods.value)
          shippingMethodsList.splice(index, 1)
          store.dispatch(SAVE_SHIPPING_METHODS, shippingMethodsList).then(response => {
            toast.success('Shipping options deleted successfully')
          }).catch(errors => {
            toast.warning('Internal Server Error')
          })
        }
      })
    }
    const launchSaveShippingMethodModal = (shippingMethod = null) => {
      emitter.emit('saveShippingMethodModal', {
        shippingMethod: shippingMethod
      })
    }

    onBeforeMount(() => {
      store.dispatch(FETCH_SHIPPING_METHODS)
    })

    return {
      translate,
      ...toRefs(state),
      currency,
      shippingMethods,
      paginatedShippingMethods,
      formatPrice,
      updatePage,
      deleteShippingMethod,
      launchSaveShippingMethodModal
    }
  }
}
</script>

<style scoped lang="scss">
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
