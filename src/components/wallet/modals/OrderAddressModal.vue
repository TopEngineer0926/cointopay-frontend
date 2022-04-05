<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span v-if="deliveryAddresses.length > 0">{{ translate('invoice.delivery_address') }}</span>
        <span v-if="order.items.length > 0">{{ translate('invoice.order_information') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <table class="table-sm text-left" v-if="deliveryAddresses.length > 0">
        <tbody v-for="(address, index) of deliveryAddresses" :key="index">
        <tr>
          <th class="bg-blue-700 dark:bg-blue-400 py-1 text-white" colspan="2">
            {{ translate('shop.checkout.billing') }}
          </th>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_first_name') }}</th>
          <td>{{ address.billingfirstname }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_last_name') }}</th>
          <td>{{ address.billinglastname }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.organization') }}</th>
          <td>{{ address.billingorg }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_skype') }}</th>
          <td>{{ address.billingskype }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_email') }}</th>
          <td>{{ address.billingemail }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_phone') }}</th>
          <td>{{ address.billingphone }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_address') }}</th>
          <td>{{ address.billingaddress }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_postal_code') }}</th>
          <td>{{ address.billingpostalcode }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_city') }}</th>
          <td>{{ address.billingcity }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_state') }}</th>
          <td>{{ address.billingprovince }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.billing_country') }}</th>
          <td>{{ getCountry(address.billingcountryid) }}</td>
        </tr>
        <tr>
          <th class="bg-blue-700 dark:bg-blue-400 py-1 text-white" colspan="2">
            {{ translate('shop.checkout.shipping') }}
          </th>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_first_name') }}</th>
          <td>{{ address.shippingfirstname }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_last_name') }}</th>
          <td>{{ address.shippinglastname }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.organization') }}</th>
          <td>{{ address.shippingorg }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_skype') }}</th>
          <td>{{ address.shippingskype }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_email') }}</th>
          <td>{{ address.shippingemail }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_phone') }}</th>
          <td>{{ address.shippingphone }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_address') }}</th>
          <td>{{ address.shippingaddress }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_postal_code') }}</th>
          <td>{{ address.shippingpostalcode }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_city') }}</th>
          <td>{{ address.shippingcity }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_state') }}</th>
          <td>{{ address.shippingprovince }}</td>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_country') }}</th>
          <td>{{ getCountry(address.shippingcountryid) }}</td>
        </tr>
        <tr>
          <th class="bg-blue-700 dark:bg-blue-400 py-1 text-white" colspan="2">
            {{ translate('shop.checkout.shipping_cost') }}
          </th>
        </tr>
        <tr>
          <th>{{ translate('shop.checkout.shipping_cost') }}</th>
          <td>{{ formatAmount(address.shippingcost, true) }}</td>
        </tr>
        </tbody>
      </table>
      <div v-if="order.items.length > 0"
           class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
        <table class="table-sm">
          <thead>
          <tr>
            <th>Item</th>
            <th v-if="Object.keys(order.items[0]).length === 6">SKU</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) of order.items" :key="index">
            <td class="break-all whitespace-normal w-48">
              <div class="flex items-center justify-center">
                <img :src="item.url" alt="" class="h-12"/>
                <div class="ml-3 break-all">{{ item.name }}</div>
              </div>
            </td>
            <td v-if="Object.keys(order.items[0]).length === 6">
              <p class="break-all">{{ item.sku }}</p>
            </td>
            <td>{{ formatAmount(item.price, true) }}</td>
            <td>{{ 'x ' + item.qty }}</td>
            <td>{{ formatAmount(item.price * item.qty, true) }}</td>
          </tr>
          <tr v-if="order.shipping">
            <td :colspan="Object.keys(order.items[0]).length === 6 ? 3 : 2" class="text-right">
              {{ translate('invoice.shipping_cost') }}:
            </td>
            <td colspan="2">{{ order.shipping.method + ' ' + formatAmount(order.shipping.cost, true) }}</td>
          </tr>
          <tr v-if="order.coupon">
            <td :colspan="Object.keys(order.items[0]).length === 6 ? 3 : 2" class="text-right">
              {{ translate('invoice.discount') }}:
            </td>
            <td class="text-red-500" colspan="2">-{{ formatAmount(order.coupon.discount, true) }}</td>
          </tr>
          <tr>
            <td :colspan="Object.keys(order.items[0]).length === 6 ? 3 : 2" class="text-right">
              <span class="font-bold">Total:</span>
            </td>
            <td colspan="2"><span class="font-bold">{{ cartTotal }}</span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import * as _ from 'lodash'

export default {
  name: 'OrderAddressModal',
  components: {
    Modal,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const { formatPrice } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      transaction: null,
      deliveryAddresses: [],
      order: {
        items: [],
        shipping: null,
        coupon: null
      }
    })

    // Computed
    const countries = computed(() => store.state.countries)
    const cartTotal = computed(() => {
      let total = 0
      if (state.order.items.length > 0) {
        state.order.items.map(item => {
          total += Number(item.qty) * Number(item.price)
        })
      }
      if (state.order.shipping) {
        total += Number(state.order.shipping.cost)
      }
      if (state.order.coupon) {
        total -= Number(state.order.coupon.discount)
      }
      return formatAmount(total, true)
    })

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const getCountry = (id) => {
      const country = _.find(countries.value, { id: Number(id) })
      return country ? country.name : ''
    }

    const formatAmount = (amount, isTransaction = false) => {
      const currency = (isTransaction && state.transaction) ? state.transaction.InputCurrency : 'EUR'
      return formatPrice(amount, currency)
    }

    onBeforeMount(() => {
      emitter.on('orderAddressModal', (args) => {
        state.transaction = args.transaction
        state.deliveryAddresses = args.deliveryAddresses
        state.order = args.order
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      cartTotal,
      closeModal,
      formatAmount,
      getCountry
    }
  }
}
</script>

<style scoped lang="scss">
.table-sm {
  tbody {
    tr {
      th {
        @apply pl-3;
      }
    }
  }
}
</style>
