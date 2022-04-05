<template>
  <centered-layout>
    <template v-if="isProcessing">
      <product-skeleton :counter="8"></product-skeleton>
    </template>
    <template v-else>
      <div class="mb-3 flex items-center justify-end flex-col lg:flex-row">
        <select aria-label="Filter" class="form-select w-full lg:w-auto mr-0 lg:mr-3 mb-3 lg:mb-0" v-model="country">
          <option value="">All Countries</option>
          <option :key="index" :value="c.id" v-for="(c, index) of countriesList">{{ c.name }}</option>
        </select>
        <select aria-label="Filter" class="form-select w-full lg:w-auto mr-0 lg:mr-3 mb-3 lg:mb-0" v-model="category">
          <option value="">Filter Shops</option>
          <option :key="index" :value="cat" v-for="(cat, index) of shopCategories">{{ cat }}</option>
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
      <div class="grid grid-cols-4 gap-2 xl:gap-3">
        <div :key="index"
             class="h-72 shadow bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900 rounded col-span-4 md:col-span-2 lg:col-span-1 p-4"
             v-for="(shop, index) in paginatedShopsList">
          <router-link :to="{name: 'shop-detail', params: {id: shop.ID}}" tag="a">
            <div>
              <img v-show="isAvatar(shop.Avatar)" :src="shop.Avatar" alt="" class="w-32 h-32 mx-auto object-contain"/>
              <p v-show="!isAvatar(shop.Avatar)" class="font-bold text-9xl uppercase text-blue-500 text-center">
                {{ generateAvatar(shop.ShopTitle) }}</p>
            </div>
            <h5 class="text-center py-1 font-semibold">{{ shop.ShopTitle }}</h5>
          </router-link>
          <p @click="category = shop.POSCATEGORY" class="text-center cursor-pointer font-semibold"
             v-if="shop.POSCATEGORY.toLowerCase() !== 'n/a'">{{ shop.POSCATEGORY }}</p>
          <div class="flex justify-center">
            <star-rating :increment="1" :max-rating="5" :rating="Number(shop.POSTrust)"
                         :read-only="true" :show-rating="false" :star-size="20"
                         active-color="#ffd200" inactive-color="#d0d0d0"></star-rating>
          </div>
          <ul class="text-center social pt-2" v-if="shop.SocialOn === '1'">
            <li v-if="shop.SocialURL !== 'null' && shop.SocialURL !== ''">
              <a :href="shop.SocialURL" class="socialUrl" target="_blank">
                <icon name="link"></icon>
              </a>
            </li>
            <li v-if="shop.SocialFacebook !== 'null' && shop.SocialFacebook !== ''">
              <a :href="shop.SocialFacebook" class="facebook" target="_blank">
                <img :src="require(`@/assets/images/networks/facebook.svg`)" alt="Facebook"/>
              </a>
            </li>
            <li v-if="shop.SocialTwitter !== 'null' && shop.SocialTwitter !== ''">
              <a :href="shop.SocialTwitter" class="twitter" target="_blank">
                <img :src="require(`@/assets/images/networks/twitter.svg`)" alt="Twitter"/>
              </a>
            </li>
            <li v-if="shop.SocialReddit !== 'null' && shop.SocialReddit !== ''">
              <a :href="shop.SocialReddit" class="reddit" target="_blank">
                <img :src="require(`@/assets/images/networks/reddit.svg`)" alt="Reddit"/>
              </a>
            </li>
            <li v-if="shop.SocialLinkedIn !== 'null' && shop.SocialLinkedIn !== ''">
              <a :href="shop.SocialLinkedIn" class="linkedin" target="_blank">
                <img :src="require(`@/assets/images/networks/linkedin.svg`)" alt="LinkedIn"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="paginatedShopsList.length === 0">
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="w-full rounded shadow px-4 py-3 bg-yellow-500 mb-4 text-yellow-900 font-semibold mt-3">
          No shop available
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
import Icon from '@/components/Icon'
import ProductSkeleton from '@/components/ProductSkeleton'
import { useStore } from 'vuex'
import { computed, onBeforeMount, reactive, toRefs } from 'vue'
import * as _ from 'lodash'
import { FETCH_SHOPS_LIST } from '@/store/keys'
import StarRating from 'vue-star-rating'

export default {
  name: 'Shops',
  components: {
    CenteredLayout,
    Icon,
    StarRating,
    ProductSkeleton
  },
  setup () {
    const store = useStore()
    // State
    const state = reactive({
      country: '',
      category: '',
      keyword: '',
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 12,
        offset: 0
      },
      isProcessing: false
    })

    // Computed
    const countries = computed(() => store.state.countries)
    const shopsList = computed(() => store.state.shopsList)
    const countriesList = computed(() => {
      let countriesList = []
      if (shopsList.value.length > 0) {
        shopsList.value.map(shop => {
          if (shop.ShippingOptions.length > 0) {
            shop.ShippingOptions.map(item => {
              const index = _.findIndex(countries.value, { id: item.countryId })
              if (index === -1) {
                countriesList.push({
                  id: item.countryId,
                  name: item.countryName
                })
              }
            })
          } else {
            countriesList = countries.value
          }
        })
      }
      return countriesList
    })
    const shopCategories = computed(() => store.state.shopCategories)
    const filteredShopsList = computed(() => {
      let shops = _.cloneDeep(shopsList.value)
      if (state.country) {
        shops = shops.filter(shop => {
          if (shop.ShippingOptions.length > 0) {
            return _.findIndex(shop.ShippingOptions, { countryId: state.country }) !== -1
          }
          return true
        })
      }
      return shops.filter(shop => {
        const keyword = state.keyword.trim().toLowerCase()
        if (keyword && state.category) {
          return _.includes(shop.ShopTitle.toLowerCase(), keyword) &&
            shop.POSCATEGORY.toLowerCase() === state.category.toLowerCase()
        } else if (state.category) {
          return shop.POSCATEGORY.toLowerCase() === state.category.toLowerCase()
        } else if (keyword) {
          return _.includes(shop.ShopTitle.toLowerCase(), keyword)
        }
        return shops
      })
    })
    const paginatedShopsList = computed(() => {
      if (filteredShopsList.value.length > 0) {
        return filteredShopsList.value.slice(state.meta.offset * state.meta.limit, state.meta.currentPage * state.meta.limit)
      }
      return []
    })

    // Methods
    const isAvatar = (img) => {
      return _.startsWith(img, 'https://cointopay.com/M_Images')
    }
    const generateAvatar = (name) => {
      name = name.split(/[\s+]/g)
      name = name.filter(Boolean)
      let avatar = ''
      name.map(part => {
        avatar += part[0]
      })
      return avatar
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
    }

    onBeforeMount(() => {
      state.isProcessing = true
      store.dispatch(FETCH_SHOPS_LIST).then(() => {
        state.isProcessing = false
        state.meta = {
          currentPage: 1,
          totalPages: shopsList.value ? Math.ceil(shopsList.value.length / state.meta.limit) : 0,
          limit: 12,
          offset: 0
        }
      }).catch(() => {
        state.isProcessing = false
      })
    })

    return {
      ...toRefs(state),
      countriesList,
      shopsList,
      shopCategories,
      filteredShopsList,
      paginatedShopsList,
      isAvatar,
      generateAvatar,
      paginate
    }
  }
}
</script>

<style scoped lang="scss">
.social {
  padding-left: 0;

  li {
    display: inline-block;

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: 2px solid #ffffff;
      border-radius: 4px;
      margin: 4px;

      &.socialUrl {
        background: #099bcc;
        border-color: #099bcc;
        text-decoration: none;
        color: #ffffff;
      }

      &.twitter {
        background: #099bcc;
        border-color: #099bcc;
      }

      &.linkedin {
        background: #2e8cc2;
        border-color: #2e8cc2;
      }

      &.facebook {
        background: #4672b3;
        border-color: #4672b3;
      }

      &.reddit {
        background: #ff4500;
        border-color: #ff4500;
      }

      img {
        width: 24px;
      }
    }
  }
}
</style>
