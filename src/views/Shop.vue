<template>
  <centered-layout>
    <template v-if="isProcessing">
      <product-skeleton :counter="8"></product-skeleton>
    </template>
    <template v-else>
      <div class="mb-3 flex items-center justify-between flex-col lg:flex-row">
        <p class="flex items-center" v-if="selectedShop">
          <router-link :to="{name: 'shop-detail', params: {id: shopId}}" tag="a" class="flex items-center mr-2">
            <img v-if="isAvatar(selectedShop.Avatar)" :src="selectedShop.Avatar"
                 alt="" class="w-8 h-8 rounded-full mr-2"/>
            <span @click="category = ''">{{ selectedShop.ShopTitle }}</span>
          </router-link>
          <span v-if="selectedCategory"> > Category > {{ selectedCategory.name }}</span>
          <span v-else> > Category > all</span>
        </p>
        <div class="flex items-center justify-between flex-col lg:flex-row">
          <select v-model="category" aria-label="Filter" class="form-select w-full lg:w-auto mr-0 lg:mr-3 mb-3 lg:mb-0">
            <option value="">Filter Products</option>
            <option v-for="(cat, index) of productCategories" :key="index" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <div class="relative w-full lg:w-auto">
            <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
            <input v-model="keyword" aria-label="Search..." placeholder="Search..."
                   class="form-input px-10 w-full lg:w-auto" type="text"/>
            <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                  @click="keyword = ''">
              <icon classes="w-5 h-5" name="close"></icon>
            </span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 xl:gap-3">
        <div :key="index"
             class="h-72 shadow bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900 rounded col-span-4 md:col-span-2 lg:col-span-1 p-4"
             v-for="(product, index) in paginatedProducts">
          <router-link :to="{name: 'product-detail', params: {shopId: shopId, id: product.id}}" tag="a">
            <img :src="product.imageUri" alt="" class="w-32 h-32 mx-auto object-contain"/>
          </router-link>
          <h5 class="text-center py-1 font-semibold">{{ product.itemName }}</h5>
          <p class="text-center font-semibold mb-3">{{ formatPrice(product.price, currency) }}</p>
          <div class="flex items-center justify-center mb-3">
            <star-rating :increment="0.1" :max-rating="5" :rating="getProductRatings(product.sku)"
                         :read-only="true" :show-rating="true" :star-size="20"
                         active-color="#ffd200" inactive-color="#d0d0d0"></star-rating>
          </div>
        </div>
      </div>
      <div v-if="shopId && shop && paginatedProducts.length === 0">
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="w-full rounded shadow px-4 py-3 bg-yellow-500 mb-4 text-yellow-900 font-semibold mt-3">
          No products found
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="meta.totalPages > 1" class="flex items-center justify-center mt-3">
        <button :disabled="meta.currentPage === 1" @click="paginate('prev')" class="btn btn-default mr-2">
          <icon name="chevron-left"></icon>
        </button>
        <span class="mr-2">{{ `${meta.currentPage} of ${meta.totalPages}` }}</span>
        <button :disabled="meta.currentPage === meta.totalPages" @click="paginate('next')" class="btn btn-default">
          <icon name="chevron-right"></icon>
        </button>
      </div>
    </template>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import ProductSkeleton from '@/components/ProductSkeleton'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import {
  FETCH_RATINGS,
  FETCH_SHOP_DATA,
  FETCH_SHOPS_LIST,
  SET_PRODUCTS_FILTERS,
  SET_SHOP_DATA,
  SET_SHOP_ID
} from '@/store/keys'
import { useRoute, useRouter } from 'vue-router'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import StarRating from 'vue-star-rating'

export default {
  name: 'Shop',
  components: {
    CenteredLayout,
    ProductSkeleton,
    StarRating,
    Icon
  },
  setup () {
    const toast = inject('toast')
    // Store
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const {
      saveNotification,
      formatPrice,
      copyToClipboard
    } = compositionUtils()
    // State
    const state = reactive({
      shop: null,
      category: '',
      keyword: '',
      selectedShop: null,
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 12,
        offset: 0
      },
      ratings: [],
      isProcessing: false
    })
    // Computed
    const shopId = computed(() => store.state.shopId)
    const shopsList = computed(() => store.state.shopsList)
    const productsFilters = computed(() => store.state.productsFilters)
    const altCoins = computed(() => store.state.altCoins)
    const currency = computed(() => {
      let currency = 'EUR'
      if (state.shop) {
        currency = state.shop.PayoutCurrencyShortName
        const altCoin = _.find(altCoins.value, { ShortName: currency })
        if (altCoin) {
          currency = altCoin.LongName
        }
      }
      return currency
    })
    const productCategories = computed(() => {
      let categories = _.cloneDeep(state.shop.categories)
      categories = categories.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.id === value.id
        ))
      )
      if (state.shop.products.length > 0) {
        return categories.filter(category => {
          return _.findIndex(state.shop.products, { categoryID: category.id }) !== -1
        })
      } else {
        return []
      }
    })
    const filteredProducts = computed(() => {
      if (state.shop) {
        return state.shop.products.filter(product => {
          const keyword = state.keyword.trim().toLowerCase()
          if (state.category && keyword) {
            return (product.categoryID === state.category &&
              (_.includes(product.itemName.toLowerCase(), keyword) ||
                _.includes(product.sku.toLowerCase(), keyword) ||
                _.includes(product.description.toLowerCase(), keyword)) && Number(product.stock) > 0
            )
          } else if (state.category) {
            return product.categoryID === state.category && Number(product.stock) > 0
          } else if (keyword) {
            return (_.includes(product.itemName.toLowerCase(), keyword) ||
                _.includes(product.sku.toLowerCase(), keyword) ||
                _.includes(product.description.toLowerCase(), keyword)) &&
              Number(product.stock) > 0
          } else {
            return Number(product.stock) > 0
          }
        })
      }
      return []
    })
    const paginatedProducts = computed(() => {
      if (filteredProducts.value.length > 0) {
        return filteredProducts.value.slice(state.meta.offset, state.meta.currentPage * state.meta.limit)
      }
      return filteredProducts.value
    })
    const selectedCategory = computed(() => {
      if (state.category) {
        return _.find(state.shop.categories, { id: state.category })
      }
      return null
    })

    // Watch
    watch(() => shopId.value,
      (newVal, oldVal) => {
        if (newVal) {
          state.selectedShop = _.find(shopsList.value, { ID: newVal.toString() })
        }
      })
    watch(() => state.keyword,
      (newVal, oldVal) => {
        state.meta = {
          ...state.meta,
          currentPage: 1,
          totalPages: filteredProducts.value ? Math.ceil(filteredProducts.value.length / state.meta.limit) : 0,
          offset: 0
        }
        updateProductsFilters({
          currentPage: 1,
          keyword: newVal,
          category: state.category
        })
      })
    watch(() => state.category,
      (newVal, oldVal) => {
        state.meta = {
          ...state.meta,
          currentPage: 1,
          totalPages: filteredProducts.value ? Math.ceil(filteredProducts.value.length / state.meta.limit) : 0,
          offset: 0
        }
        updateProductsFilters({
          currentPage: 1,
          keyword: state.keyword,
          category: newVal
        })
      })

    // Methods
    const isAvatar = (img) => {
      return _.startsWith(img, 'https://cointopay.com/M_Images')
    }
    const fetchProducts = () => {
      state.isProcessing = true
      store.dispatch(FETCH_SHOP_DATA, {
        shopId: shopId.value
      }).then(response => {
        state.isProcessing = false
        if (response.categories === 'nothing found') {
          toast.warning('Store for this merchant is not enabled')
          saveNotification('Store for this merchant is not enabled')
          router.push({ name: 'shop' })
        } else {
          state.shop = response
          const totalPages = state.shop.products ? Math.ceil(state.shop.products.length / state.meta.limit) : 0
          // Check if page parameter is present
          if (Object.keys(route.query).length > 0) {
            if (typeof route.query.page !== 'undefined') {
              const page = route.query.page
              if (page > 0 && page <= totalPages) {
                updateProductsFilters({
                  currentPage: page,
                  keyword: state.keyword,
                  category: state.category
                })
              }
            }
          }
          state.meta = {
            currentPage: productsFilters.value ? productsFilters.value.currentPage : 1,
            totalPages: state.shop.products ? totalPages : 0,
            limit: 12,
            offset: productsFilters.value ? (productsFilters.value.currentPage - 1) * state.meta.limit : 0
          }
        }
      }).catch(error => {
        state.isProcessing = false
        console.log(error)
      })
    }
    const fetchRatings = (shopId) => {
      store.dispatch(FETCH_RATINGS, shopId).then(ratings => {
        state.ratings = ratings
      })
    }
    const resetShopItems = () => {
      store.commit(SET_SHOP_DATA, {
        categories: [],
        products: []
      })
    }
    const updateProductsFilters = (filters = null) => {
      if (!filters) {
        filters = {
          currentPage: state.meta.currentPage,
          keyword: state.keyword,
          category: state.category
        }
      }
      store.commit(SET_PRODUCTS_FILTERS, filters)
    }
    const getProductRatings = (sku) => {
      let ratings = 0
      let counter = 0
      state.ratings.map(rating => {
        if (rating.SKU === sku) {
          counter += 1
          ratings = Number(ratings) + Number(rating.ReviewStars)
        }
      })
      return (counter > 0) ? ratings / counter : 0
    }
    const paginate = (type) => {
      let page = state.meta.currentPage
      if (type === 'next') {
        page = state.meta.currentPage < state.meta.totalPages ? state.meta.currentPage + 1 : state.meta.totalPages
      } else {
        page = state.meta.currentPage > 0 ? state.meta.currentPage - 1 : state.meta.totalPages
      }
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
      router.push({
        name: 'shop-detail',
        params: { id: shopId.value },
        query: { page: page }
      })
      updateProductsFilters()
      copyToClipboard(window.location.href, false)
    }

    onBeforeMount(() => {
      state.isProcessing = true
      if (shopId.value) {
        state.selectedShop = _.find(shopsList.value, { ID: shopId.value })
      }
      store.dispatch(FETCH_SHOPS_LIST).then(() => {
        if (Object.keys(route.params).length > 0) {
          if (typeof route.params.id !== 'undefined') {
            store.commit(SET_SHOP_ID, route.params.id)
            updateProductsFilters()
          } else {
            store.commit(SET_SHOP_ID, null)
          }
          if (route.params.categoryId) {
            state.category = route.params.categoryId
          }
          setTimeout(() => {
            if (shopId.value && state.selectedShop) {
              fetchProducts()
              fetchRatings(shopId.value)
            } else {
              toast.warning('Store for this merchant is not enabled')
              store.commit(SET_SHOP_ID, null)
              router.push({ name: 'shop' })
            }
          }, 50)
        } else {
          updateProductsFilters({
            currentPage: 1,
            keyword: '',
            category: ''
          })
          store.commit(SET_SHOP_ID, null)
          resetShopItems()
        }
      }).catch(() => {
      })
    })

    return {
      ...toRefs(state),
      currency,
      shopId,
      isAvatar,
      selectedCategory,
      productCategories,
      paginatedProducts,
      formatPrice,
      getProductRatings,
      paginate
    }
  }
}
</script>

<style scoped>

</style>
