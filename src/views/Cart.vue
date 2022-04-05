<template>
  <centered-layout>
    <div class="h-full" v-if="cart.items.length === 0">
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <p class="mb-4 font-semibold text-lg">{{ translate('pos.cart.empty_cart') }}</p>
          <router-link :to="{name: 'shop-detail', params: {id: shopId}}" class="btn btn-primary" tag="a">
            {{ translate('pos.cart.continue_shopping') }}
          </router-link>
        </div>
      </div>
    </div>
    <div class="card" v-if="cart.items.length > 0 && shop && shop.products.length > 0">
      <div class="body">
        <div
          class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
          <table class="table-sm mb-2">
            <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr :key="index" v-for="(item, index) of cart.items">
              <td>
                <div class="flex items-center">
                  <img class="w-12 h-12 rounded-full mr-3" :src="item.url" alt=""
                       @click="fancyBox(item.url)"/>
                  <p class="mb-0 ml-1">{{ item.name }}</p>
                </div>
              </td>
              <td>{{ formatPrice(item.price, currency) }}</td>
              <td>
                <div class="items-center">
                  <span class="mr-3">x</span>
                  <input :max="maxQty(item)" @change="updateCart(item, index)" aria-label="qty"
                         class="form-input w-36" min="1" type="number" v-model="item.qty"/>
                </div>
              </td>
              <td>{{ formatPrice(item.price * item.qty, currency) }}</td>
              <td class="text-right">
                <div class="pr-3">
                  <button @click="removeItem(index)" class="hover:text-red-500">
                    <icon name="trash"></icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="text-right" colspan="5">
                <span class="font-bold pr-3">Total: {{ cartTotal }}</span>
              </td>
            </tr>
            <tr>
              <td>
                <button @click="clearCart()" class="btn btn-danger">
                  {{ translate('pos.cart.clear_cart') }}
                </button>
              </td>
              <td class="text-right" colspan="4">
                <router-link :to="{name: 'shop-detail', params: {id: shopId}}" class="btn btn-default" tag="a">
                  {{ translate('pos.cart.continue_shopping') }}
                </router-link>
                <router-link :disabled="totalAmount === 0" tag="a" :to="{name: 'checkout'}"
                             class="btn btn-primary ml-2 mr-3">
                  {{ translate('pos.cart.checkout') }}
                </router-link>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import Icon from '@/components/Icon'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import { UPDATE_CART } from '@/store/keys'

export default {
  name: 'Cart',
  components: {
    CenteredLayout,
    Icon
  },
  setup () {
    const translate = inject('translate')
    const toast = inject('toast')
    const store = useStore()

    const {
      formatPrice,
      fancyBox
    } = compositionUtils()

    // Computed
    const altCoins = computed(() => store.state.altCoins)
    const shopsList = computed(() => store.state.shopsList)
    const shopId = computed(() => store.state.shopId)
    const shop = computed(() => store.state.shopData)
    const cart = computed(() => store.state.cart)
    const selectedShop = computed(() => {
      let shop = null
      if (shopId.value) {
        shop = _.find(shopsList.value, { ID: shopId.value })
      }
      return shop
    })
    const currency = computed(() => {
      let currency = 'EUR'
      if (selectedShop.value) {
        currency = selectedShop.value.PayoutCurrencyShortName
        const altCoin = _.find(altCoins.value, { ShortName: currency })
        if (altCoin) {
          currency = altCoin.LongName
        }
      }
      return currency
    })
    const cartTotal = computed(() => {
      let total = 0
      if (cart.value.items.length > 0) {
        cart.value.items.map(item => {
          total += Number(item.qty) * Number(item.price)
        })
      }
      return formatPrice(total, currency.value)
    })
    const totalAmount = computed(() => {
      let total = 0
      if (cart.value.items.length > 0) {
        cart.value.items.map(item => {
          total += Number(item.qty) * Number(item.price)
        })
      }
      return total
    })

    // Methods
    const maxQty = (item) => {
      const product = _.find(shop.value.products, { id: item.id })
      if (product) {
        return Number(product.stock) - Number(item.qty)
      }
      return 0
    }
    const updateCart = (item, index) => {
      const activeCart = _.cloneDeep(cart.value)
      const oldItem = _.find(activeCart.items, { id: item.id })
      if (Number(item.qty) === 0) {
        activeCart.items[index].qty = oldItem.qty
        toast.error('Invalid quantity entered. The previous value will be restored.')
      } else if (Number(item.qty) > maxQty(item)) {
        activeCart.items[index].qty = oldItem.qty
        toast.error('Invalid quantity entered. The previous value will be restored.')
      }
      store.commit(UPDATE_CART, activeCart)
    }
    const removeItem = (index) => {
      const activeCart = _.cloneDeep(cart.value)
      activeCart.items.splice(index, 1)
      store.commit(UPDATE_CART, activeCart)
    }
    const clearCart = () => {
      store.commit(UPDATE_CART, {
        items: [],
        merchantId: null
      })
    }

    return {
      translate,
      shopId,
      cart,
      currency,
      formatPrice,
      cartTotal,
      totalAmount,
      shop,
      maxQty,
      updateCart,
      removeItem,
      clearCart,
      fancyBox
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
