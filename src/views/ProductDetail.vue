<template>
  <centered-layout>
    <div v-if="product && selectedShop">
      <div class="mb-3">
        <h5 class="font-semibold">
          <router-link :to="{name: 'shop-detail', params: {id: shopId}}" tag="a" class="text-blue-500 hover:underline">
            {{ selectedShop.ShopTitle }}
          </router-link>
          <span> > </span>
          <router-link :to="{name: 'shop-detail-category', params: { id: shopId, categoryId: category.id }}" tag="a"
                       class="text-blue-500 hover:underline">
            {{ category.name }}
          </router-link>
          > {{ product.itemName }}
        </h5>
      </div>
      <div class="grid grid-cols-3 gap-2 lg:gap-3">
        <div class="col-span-3 md:col-span-2">
          <div class="flex items-start overflow-hidden mb-3 md:mb-4">
            <img class="hidden md:block w-36 mr-3 cursor-pointer" :src="product.imageUri" alt=""
                 @click="fancyBox(product.imageUri)"/>
            <div class="flex-1">
              <img :src="product.imageUri" alt="" class="cursor-pointer" @click="fancyBox(product.imageUri)"/>
            </div>
          </div>
          <tab-set>
            <tab name="Description">
              <p>{{ product.description }}</p>
            </tab>
            <tab name="Reviews">
              <review-rating :shopId="shopId" :product="product" @fetchRatings="fetchRatings"></review-rating>
            </tab>
          </tab-set>
        </div>
        <div class="col-span-3 md:col-span-1">
          <div class="shadow bg-gray-100 dark:bg-gray-700 rounded p-4">
            <h3 class="font-bold text-lg mb-3">{{ product.itemName }}</h3>
            <p class="text-sm text-gray-400">SKU: {{ product.sku }}</p>
            <p>{{ product.description }}</p>
            <p class="font-bold">{{ formatPrice(product.price) }}</p>
            <div class="text-sm mt-8 flex items-center justify-between mb-3">
              <span>Qty: {{ `${availableStock} ${translate('pos.cart.available')}` }}</span>
              <input :max="maxQty" aria-label="quantity" class="form-input w-36" min="1" type="number" v-model="qty"/>
            </div>
            <j-button @click="addToCart()" class="w-full mb-3">
              <span>{{ translate(isExistsInCart ? 'pos.cart.update_cart' : 'pos.cart.add_to_cart') }}</span>
            </j-button>

            <router-link :to="{name: 'shop-detail', params: {id: shopId}}" class="btn btn-primary w-full mb-3" tag="a">
              {{ translate('pos.cart.continue_shopping') }}
            </router-link>
            <router-link class="btn btn-primary w-full mb-3" tag="a" :to="{name: 'cart'}" v-if="isExistsInCart">
              {{ translate('pos.cart.checkout') }}
            </router-link>
            <div class="flex items-center">
              <div class="text-center mr-3">
                <p class="font-bold text-2xl">{{ totalRatings.toFixed(1) }}</p>
                <star-rating :increment="0.1" :max-rating="5" :rating="Number(totalRatings)"
                             :read-only="true" :show-rating="false" :star-size="20" active-color="#ffd200"
                             inactive-color="#d0d0d0"></star-rating>
                <p class="mt-2">
                  <icon name="user"></icon>
                  {{ counter }} total
                </p>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <icon name="star" classes="w-5 h-5 mr-2"></icon>
                    5
                  </div>
                  <div class="bg-gray-300 dark:bg-gray-600 w-full h-8 mx-3">
                    <div :style="'width:' + getPercentageWidth(5)" class="h-8 bg-green-700 z-10"></div>
                  </div>
                  {{ getRatingCount(5) }}
                </div>
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <icon name="star" classes="w-5 h-5 mr-2"></icon>
                    4
                  </div>
                  <div class="bg-gray-300 dark:bg-gray-600 w-full h-8 mx-3">
                    <div :style="'width:' + getPercentageWidth(4)" class="h-8 bg-green-500"></div>
                  </div>
                  {{ getRatingCount(4) }}
                </div>
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <icon name="star" classes="w-5 h-5 mr-2"></icon>
                    3
                  </div>
                  <div class="bg-gray-300 dark:bg-gray-600 w-full h-8 mx-3">
                    <div :style="'width:' + getPercentageWidth(3)" class="h-8 bg-yellow-500"></div>
                  </div>
                  {{ getRatingCount(3) }}
                </div>
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <icon name="star" classes="w-5 h-5 mr-2"></icon>
                    2
                  </div>
                  <div class="bg-gray-300 dark:bg-gray-600 w-full h-8 mx-3">
                    <div :style="'width:' + getPercentageWidth(2)" class="h-8 bg-orange-500"></div>
                  </div>
                  {{ getRatingCount(2) }}
                </div>
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <icon name="star" classes="w-5 h-5 mr-2"></icon>
                    1
                  </div>
                  <div class="bg-gray-300 dark:bg-gray-600 w-full h-8 mx-3">
                    <div :style="'width:' + getPercentageWidth(1)" class="h-8 bg-red-500"></div>
                  </div>
                  {{ getRatingCount(1) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import ReviewRating from '@/components/shop/ReviewRating'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { useRoute, useRouter } from 'vue-router'
import { FETCH_RATINGS, FETCH_SHOP_DATA, FETCH_SHOPS_LIST, SAVE_PRODUCTS, SET_SHOP_ID, UPDATE_CART } from '@/store/keys'
import compositionUtils from '@/compositionUtils'
import StarRating from 'vue-star-rating'

export default {
  name: 'ProductDetail',
  components: {
    CenteredLayout,
    StarRating,
    Icon,
    JButton,
    TabSet,
    Tab,
    ReviewRating
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const swal = inject('swal')
    // Store
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const {
      saveNotification,
      formatPrice,
      fancyBox
    } = compositionUtils()
    // State
    const state = reactive({
      productId: null,
      qty: 1,
      form: {
        rating: 0,
        sku: '',
        merchantid: '',
        author: '',
        email: '',
        title: '',
        comment: '',
        reCaptcha: ''
      },
      ratings: [],
      productRatings: [],
      totalRatings: 0,
      counter: 0,
      isProcessing: false
    })

    // Computed
    const shopId = computed(() => store.state.shopId)
    const shop = computed(() => store.state.shopData)
    const shopsList = computed(() => store.state.shopsList)
    const cart = computed(() => store.state.cart)
    const altCoins = computed(() => store.state.altCoins)
    const selectedShop = computed(() => {
      if (shopId.value) {
        return _.find(shopsList.value, { ID: shopId.value })
      }
      return null
    })
    const product = computed(() => {
      if (state.productId) {
        return _.find(shop.value.products, { id: state.productId })
      }
      return null
    })
    const cartItem = computed(() => {
      return _.find(cart.value.items, { id: product.value.id })
    })
    const category = computed(() => {
      return _.find(shop.value.categories, { id: product.value.categoryID })
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
    const maxQty = computed(() => {
      let qty = Number(product.value.stock)
      if (cartItem.value) {
        qty -= Number(cartItem.value.qty)
      }
      return qty
    })
    const availableStock = computed(() => {
      let qty = Number(product.value.stock) - state.qty
      if (cartItem.value) {
        qty -= Number(cartItem.value.qty)
      }
      return qty
    })
    const isExistsInCart = computed(() => {
      return _.findIndex(cart.value.items, { id: product.value.id }) !== -1
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchRatings = (id = null) => {
      store.dispatch(FETCH_RATINGS, id || shopId.value).then(ratings => {
        state.ratings = ratings
        state.productRatings = []
        state.counter = 0
        let totalRatings = 0
        if (product.value) {
          state.ratings.map(rating => {
            if (rating.SKU === product.value.sku) {
              state.counter += 1
              state.productRatings.push(rating)
              totalRatings = Number(totalRatings) + Number(rating.ReviewStars)
            }
          })
        }
        state.totalRatings = (state.counter > 0) ? totalRatings / state.counter : 0
        // Sort by date desc
        state.productRatings = _.orderBy(state.productRatings, 'ReviewCreatedOn', 'desc')
      })
    }
    const getRatingCount = (count) => {
      return state.productRatings.filter(rating => Number(rating.ReviewStars) === count).length
    }
    const getPercentageWidth = (count) => {
      const ratingsCount = getRatingCount(count)
      if (state.counter > 0 && ratingsCount > 0) {
        const width = ratingsCount / state.counter * 100
        return `${width}%`
      }
      return 0
    }
    const addToCart = () => {
      if (state.qty > 0 && state.qty <= Number(product.value.stock)) {
        let activeCart = _.cloneDeep(cart.value)
        if (activeCart.items.length === 0) {
          activeCart.merchantId = null
        }
        if (activeCart.merchantId !== null && activeCart.merchantId.toString() !== shopId.value.toString()) {
          swal.fire({
            title: 'You can only add items from same merchant',
            text: 'Do you want to order your current shopping cart items?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            customClass: {
              container: 'swal2-tailwind'
            }
          }).then((result) => {
            if (result.dismiss === 'cancel') {
              router.push('/shop/cart')
            } else if (result.value) {
              http.get(`${apiBaseUrl}/MarketAPI`, {
                params: {
                  POSDATA: '',
                  Call: 'SHOWPOS',
                  KeyData: `${activeCart.merchantId}_products`,
                  MerchantID: activeCart.merchantId,
                  showpos: 1
                }
              }).then(response => {
                const products = response.data
                if (activeCart.items) {
                  activeCart.items.map(item => {
                    if (Object.keys(item).length === 6) {
                      const index = _.findIndex(products, { sku: item.sku })
                      if (index !== -1) {
                        products[index].stock = Number(products[index].stock) + Number(item.qty)
                      }
                    } else {
                      const index = _.findIndex(products, { id: item.id })
                      if (index !== -1) {
                        products[index].stock = Number(products[index].stock) + Number(item.qty)
                      }
                    }
                  })
                  store.dispatch(SAVE_PRODUCTS, {
                    Call: 'UPDATE',
                    data: products,
                    user: {
                      ID: activeCart.merchantId,
                      APIKey: '_'
                    }
                  }).then(() => {
                    activeCart = {
                      items: [],
                      merchantId: shopId.value
                    }
                    store.commit(UPDATE_CART, cart)
                    setTimeout(() => {
                      updateCart(cart)
                    }, 300)
                  })
                }
              })
            }
          })
        } else {
          updateCart(activeCart)
        }
      } else {
        toast.error('Please provide correct quantity')
      }
    }
    const updateCart = (cart) => {
      if (cart.merchantId === null || cart.merchantId.toString() === shopId.value.toString()) {
        const index = _.findIndex(cart.items, { id: product.value.id })
        if (index !== -1) {
          cart.items[index].qty = Number(cart.items[index].qty) + Number(state.qty)
        } else {
          cart.items.push({
            id: product.value.id,
            sku: product.value.sku,
            name: product.value.itemName,
            url: product.value.imageUri,
            price: product.value.price,
            qty: state.qty
          })
          cart.merchantId = shopId.value
        }
        store.commit(UPDATE_CART, cart)
        toast.success('Item added to the cart successfully')
      }
    }

    onBeforeMount(() => {
      if (Object.keys(route.params).length > 0) {
        const shopId = route.params.shopId
        fetchRatings(shopId)
        store.commit(SET_SHOP_ID, shopId)
        state.productId = route.params.id
        if (shop.value.categories.length === 0) {
          state.isProcessing = true
          // Get shop list and then shop products
          store.dispatch(FETCH_SHOPS_LIST).then(() => {
            store.dispatch(FETCH_SHOP_DATA, {
              shopId: shopId
            }).then(response => {
              state.isProcessing = false
              if (response.categories === 'nothing found') {
                toast.warning('Store for this merchant is not enabled')
                saveNotification('Store for this merchant is not enabled')
                router.push({ name: 'shop' })
              }
            }).catch(error => {
              state.isProcessing = false
              console.log(error)
            })
          }).catch(() => {
            state.isProcessing = false
          })
        }
      }
      if (product.value && Number(product.value.stock) === 0) {
        router.push({
          path: '/shop',
          params: { id: shopId.value }
        })
      }
    })

    return {
      translate,
      ...toRefs(state),
      selectedShop,
      currency,
      category,
      product,
      shopId,
      formatPrice,
      availableStock,
      maxQty,
      fancyBox,
      isExistsInCart,
      getRatingCount,
      getPercentageWidth,
      addToCart,
      fetchRatings
    }
  }
}
</script>

<style scoped lang="scss">

</style>
