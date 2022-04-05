<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <nav-tabs></nav-tabs>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="flex items-center justify-end mb-3 flex-col lg:flex-row">
            <span
              class="hover:text-blue-500 mb-3 lg:mb-0 ml-0 lg:ml-3 cursor-pointer w-full lg:w-auto"
              @click="isBarcodeScanner = !isBarcodeScanner">
              <icon name="barcode"></icon>
            </span>
            <select aria-label="Select Category" class="form-select w-full mb-3 lg:mb-0 ml-0 lg:ml-3 w-full lg:w-72"
                    v-model="categoryId">
              <option value>Select Category</option>
              <option :key="index" :value="category.id" v-for="(category, index) in categories">
                {{ category.name }}
              </option>
            </select>
            <div class="relative mb-3 lg:mb-0 ml-0 lg:ml-3 w-full lg:w-auto">
              <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
              <input v-model="keyword" aria-label="Search..." class="form-input px-10 w-full lg:w-auto" type="text"/>
              <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                    @click="keyword = ''">
                <icon classes="w-5 h-5" name="close"></icon>
              </span>
            </div>
          </div>
          <div class="mx-auto mb-3 w-40" v-if="isBarcodeScanner">
            <StreamBarcodeReader @decode="onDecode" @error="onError"></StreamBarcodeReader>
          </div>
          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-sm mb-2">
              <thead>
              <tr>
                <th>Category</th>
                <th>Image</th>
                <th @click="sort('itemName')" class="cursor-pointer" style="max-width: 150px;">
                  <div class="flex items-center">
                    Name
                    <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                          v-if="sortKey === 'itemName'">
                      <icon name="sort" classes="w-4 h-4"></icon>
                    </span>
                  </div>
                </th>
                <th class="whitespace-nowrap">SKU / EAN / Barcode / QR</th>
                <th>Quantity</th>
                <th @click="sort('price')" class="cursor-pointer">
                  <div class="flex items-center">
                    Price
                    <span :class="`ml-4 transform transition-all ${order === 'asc' ? 'rotate-180' : ''}`"
                          v-if="sortKey === 'price'">
                      <icon name="sort" classes="w-4 h-4"></icon>
                    </span>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              <template v-if="filteredFavourites.length > 0">
                <tr :key="index" v-for="(product, index) in paginatedFavourites">
                  <td>
                    <div @click="categoryId = product.categoryID" class="cursor-pointer flex items-center">
                      <div :style="'background: #' + getCategoryColorCode(product.categoryID)"
                           class="inline-block w-5 h-5 rounded-full mr-3"></div>
                      {{ getCategoryName(product.categoryID) }}
                    </div>
                  </td>
                  <td>
                    <div class="w-12 h-12 rounded-full overflow-hidden">
                      <img :src="product.imageUri" alt="" class="w-12 h-12 object-cover"
                           @click="fancyBox(product.imageUri)"/>
                    </div>
                  </td>
                  <td @click="launchAddToCartModal(product)" class="cursor-pointer whitespace-normal"
                      style="width: 150px;">
                    <p class="break-all">{{ product.itemName }}</p>
                  </td>
                  <td @click="launchAddToCartModal(product)" class="cursor-pointer">{{ product.sku }}</td>
                  <td @click="launchAddToCartModal(product)" class="cursor-pointer">{{ product.stock }}</td>
                  <td @click="launchAddToCartModal(product)" class="cursor-pointer">
                    {{ `${product.price} ${currency}` }}
                  </td>
                  <td>
                    <div class="flex items-center space-x-1">
                      <button @click="launchAddToCartModal(product)"
                              class="hover:text-blue-500" type="button">
                        <icon name="shopping-cart"></icon>
                      </button>
                      <button @click="markFavourite(product, index)">
                        <icon name="heart"
                              :classes="`w-6 h-6 hover:text-red-500 ${isFavourite(product) ? 'text-red-500' : ''}`"></icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td colspan="7" class="text-center">{{ translate('address_book.empty') }}</td>
                </tr>
              </template>
              </tbody>
            </table>
          </div>
          <template v-if="filteredFavourites.length > 0">
            <pagination :meta="meta" @page="updatePage"></pagination>
          </template>
        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Add To Cart Modal -->
  <add-to-cart-modal></add-to-cart-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import NavTabs from '@/components/account/pos/NavTabs'
import Icon from '@/components/Icon'
import Pagination from '@/components/common/Pagination'
import AddToCartModal from '@/components/account/pos/modals/products/AddToCartModal'
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { computed, inject, onBeforeMount, onMounted, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SET_POS } from '@/store/keys'
import { useRoute } from 'vue-router'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'Favourites',
  components: {
    NavTabs,
    'pos-layout': POSLayout,
    Icon,
    Pagination,
    StreamBarcodeReader,
    AddToCartModal
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const toast = inject('toast')
    const emitter = inject('emitter')
    // Store
    const store = useStore()
    const route = useRoute()

    const { fancyBox } = compositionUtils()

    // State
    const state = reactive({
      employee: null,
      keyword: '',
      categoryId: '',
      sortKey: null,
      order: 'asc',
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 25,
        offset: 0
      },
      isBarcodeScanner: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const altCoins = computed(() => store.state.altCoins)
    const pos = computed(() => store.state.pos)
    const filteredFavourites = computed(() => {
      if (state.keyword || state.categoryId) {
        const keyword = state.keyword.trim().toLowerCase()
        return pos.value.favourites.filter(product => {
          if (state.categoryId && keyword) {
            return (product.categoryID === state.categoryId &&
              (_.includes(product.itemName.toLowerCase(), keyword) ||
                _.includes(product.sku.toLowerCase(), keyword) ||
                _.includes(product.description.toLowerCase(), keyword) ||
                Number(product.price) === Number(keyword)
              )
            )
          } else if (state.categoryId) {
            return product.categoryID === state.categoryId
          } else if (keyword) {
            return (
              _.includes(product.itemName.toLowerCase(), keyword) ||
              _.includes(product.sku.toLowerCase(), keyword) ||
              _.includes(product.description.toLowerCase(), keyword) ||
              Number(product.price) === Number(keyword)
            )
          }
        })
      }
      return pos.value.favourites
    })
    const paginatedFavourites = computed(() => {
      if (filteredFavourites.value && filteredFavourites.value.length > 0) {
        let filteredFavouritesList = _.cloneDeep(filteredFavourites.value)
        filteredFavouritesList = filteredFavouritesList.map(p => {
          return {
            ...p,
            price: Number.parseFloat(p.price)
          }
        })
        filteredFavouritesList = _.orderBy(filteredFavouritesList, state.sortKey, state.order)
        return filteredFavouritesList.slice(state.meta.offset, state.meta.currentPage * state.meta.limit)
      }
      return filteredFavourites.value
    })
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

    // Watch
    watch(() => state.keyword,
      (newVal, oldVal) => {
        state.meta = {
          ...state.meta,
          currentPage: 1,
          totalPages: Math.ceil(filteredFavourites.value.length / state.meta.limit),
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
    const getCategoryName = (id) => {
      const category = _.find(pos.value.categories, { id: id })
      return category ? category.name : ''
    }
    const getCategoryColorCode = (id) => {
      const category = _.find(pos.value.categories, { id: id })
      return category ? category.categoryColourCode : ''
    }
    const isFavourite = (product) => {
      if (product.sku) {
        return _.findIndex(pos.value.favourites, { sku: product.sku }) !== -1
      } else if (product.id) {
        return _.findIndex(pos.value.favourites, { id: product.id }) !== -1
      }
      return false
    }
    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }
    // Mark favourite
    const markFavourite = (product) => {
      const favourites = _.cloneDeep(pos.value.favourites)
      let index = -1
      if (product.sku) {
        index = _.findIndex(favourites, { sku: product.sku })
      } else if (product.id) {
        index = _.findIndex(favourites, { id: product.id })
      }
      if (index === -1) {
        favourites.push(product)
        toast.success('Product marked favourite successfully')
      } else {
        favourites.splice(index, 1)
        toast.success('Product unmarked favourite successfully')
      }
      const posData = _.cloneDeep(pos.value)
      posData.favourites = favourites
      store.commit(SET_POS, posData)
    }
    const onDecode = (result) => {
      state.keyword = result
      state.isBarcodeScanner = false
      const product = _.find(pos.value.favourites, { sku: result })
      if (product) {
        launchAddToCartModal(product)
      }
    }
    const onError = (error) => {
      console.log(error)
    }
    const launchAddToCartModal = (product) => {
      if (Number(product.stock) > 0) {
        emitter.emit('addToCartModal', {
          product: product,
          currency: currency.value,
          employee: state.employee
        })
      } else {
        toast.warning('Product out of stock')
      }
    }

    onBeforeMount(() => {
      state.employee = _.find(pos.value.users, { isLoggedIn: 'true' })
      state.meta = {
        ...state.meta,
        currentPage: 1,
        totalPages: Math.ceil(filteredFavourites.value.length / state.meta.limit),
        offset: 0
      }
    })

    onMounted(() => {
      if (Object.keys(route.query).length > 0 && typeof route.query.category_id !== 'undefined') {
        state.categoryId = route.query.category_id
      }
    })

    return {
      translate,
      ...toRefs(state),
      filteredFavourites,
      paginatedFavourites,
      categories: pos.value.categories,
      sort,
      updatePage,
      getCategoryName,
      getCategoryColorCode,
      isFavourite,
      currency,
      markFavourite,
      onDecode,
      onError,
      launchAddToCartModal,
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
