<template>
  <centered-layout>
    <div class="grid grid-cols-3 gap-0 xl:gap-4">
      <div class="col-span-3 lg:col-span-2">
        <div class="card">
          <div class="title">
            <h5>{{ translate('shop.checkout.billing') }}</h5>
          </div>
          <hr class="border-gray-300 dark:border-gray-600"/>
          <div class="body">
            <form>
              <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_first_name') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingfirstname"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingfirstname') }}</div>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_last_name') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billinglastname"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billinglastname') }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">{{ translate('shop.checkout.organization') }}</label>
                  <input class="form-input w-full" type="text" v-model="form.billingorg"/>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_phone') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingphone"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingphone') }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_skype') }}
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingskype"/>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_email') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="email" v-model="form.billingemail"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingemail') }}</div>
                </div>
              </div>
              <div class="mb-2">
                <label class="block mb-1">
                  {{ translate('shop.checkout.billing_address') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <textarea class="form-input w-full" v-model="form.billingaddress"></textarea>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingaddress') }}</div>
              </div>
              <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_postal_code') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingpostalcode"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingpostalcode') }}</div>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_city') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingcity"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingcity') }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_state') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <input class="form-input w-full" type="text" v-model="form.billingprovince"/>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingprovince') }}</div>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.billing_country') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <select @change="updateShipping()" class="form-select w-full" v-model="form.billingcountryid">
                    <option value="">Select</option>
                    <option :key="index" :value="country.id" v-for="(country, index) of countriesList">
                      {{ country.name }}
                    </option>
                  </select>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingcountryid') }}</div>
                </div>
              </div>
              <!--Shipping Information-->
              <h5>{{ translate('shop.checkout.shipping') }}</h5>
              <hr class="my-2 border-gray-300 dark:border-gray-600"/>
              <label class="mb-1 flex items-center">
                <input type="checkbox" class="input-checkbox" v-model="differentFromBilling"/>
                <span class="ml-2">{{ translate('shop.checkout.different_from_billing') }}</span>
              </label>
              <div v-if="differentFromBilling">
                <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_first_name') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingfirstname"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingfirstname') }}</div>
                  </div>
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_last_name') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippinglastname"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippinglastname') }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.organization') }}
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingorg"/>
                  </div>
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_phone') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingphone"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingphone') }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">{{ translate('shop.checkout.shipping_skype') }}</label>
                    <input class="form-input w-full" type="text" v-model="form.shippingskype"/>
                  </div>
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_email') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="email" v-model="form.shippingemail"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingemail') }}</div>
                  </div>
                </div>
                <div class="mb-2">
                  <label class="block mb-1">
                    {{ translate('shop.checkout.shipping_address') }}
                    <span class="ml-1 text-red-500">*</span>
                  </label>
                  <textarea class="form-input w-full" v-model="form.shippingaddress"></textarea>
                  <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingaddress') }}</div>
                </div>
                <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_postal_code') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingpostalcode"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingpostalcode') }}</div>
                  </div>
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_city') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingcity"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingcity') }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-0 lg:gap-4 mb-2">
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_state') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <input class="form-input w-full" type="text" v-model="form.shippingprovince"/>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingprovince') }}</div>
                  </div>
                  <div class="col-span-2 lg:col-span-1">
                    <label class="block mb-1">
                      {{ translate('shop.checkout.shipping_country') }}
                      <span class="ml-1 text-red-500">*</span>
                    </label>
                    <select @change="updateShipping()" class="form-select w-full" v-model="form.shippingcountryid">
                      <option value="">Select</option>
                      <option :key="index" :value="country.id" v-for="(country, index) of countriesList">
                        {{ country.name }}
                      </option>
                    </select>
                    <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingcountryid') }}</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-span-3 lg:col-span-1">
        <div class="card">
          <div class="title">
            <h5>{{ translate('shop.checkout.cart.title') }}</h5>
          </div>
          <hr class="border-gray-300 dark:border-gray-600"/>
          <div class="body">
            <div :key="index" v-for="(item, index) of cart.items">
              <div class="flex items-center">
                <img :src="item.url" class="w-9 h-9 rounded-full" alt=""/>
                <div class="ml-2" style="flex-grow: 1;">
                  <p class="mb-1">{{ item.name }}</p>
                  <p class="mb-1 flex items-center justify-between">
                    <span>{{ `${formatPrice(item.price)} x ${item.qty}` }}</span>
                    <span class="font-bold">{{ formatPrice(item.price * item.qty) }}</span>
                  </p>
                </div>
              </div>
            </div>
            <hr class="border-gray-300 dark:border-gray-600 my-2"/>
            <div class="flex items-center">
              <input aria-label="discount code" class="form-input w-full rounded-r-none h-9" placeholder="Discount Code"
                     type="text" v-model="code">
              <button @click="validateCoupon()" class="btn btn-primary h-9 rounded-l-none" type="button">
                {{ translate('shop.checkout.cart.btn_apply') }}
              </button>
            </div>
            <div v-if="discountValue > 0">
              <span class="text-sm p-1 mt-2 bg-blue-500 hover:bg-blue-700 text-white rounded inline-flex items-center">
                {{ discountCode }}
                <button @click="removeCoupon()">
                  <icon name="close" classes="w-4 h-4 ml-2"></icon>
                </button>
              </span>
            </div>
            <hr class="border-gray-300 dark:border-gray-600 my-2"/>
            <div class="flex items-center justify-between font-semi-bold">
              <span>{{ translate('shop.checkout.cart.sub_total') }}</span>
              <span>{{ subTotal }}</span>
            </div>
            <div v-if="shippingMethods.length > 0">
              <hr class="border-gray-300 dark:border-gray-600 my-2"/>
              <ul class="shipping-list">
                <li :key="index" v-for="(sm, index) of shippingMethods">
                  <label class="flex items-center mb-1">
                    <input :checked="sm.method === shippingMethod.method" @change="updateCustomerShipping(sm)"
                           class="input-radio" name="shipping" type="radio">
                    <span class="ml-2">{{ `${sm.method} ${formatPrice(sm.cost)}` }}</span>
                  </label>
                </li>
              </ul>
              <div class="flex items-center justify-between font-semi-bold">
                <span>{{ translate('shop.checkout.cart.shipping_cost') }}</span>
                <span>{{ formatPrice(shippingMethod.cost, currency) }}</span>
              </div>
            </div>
            <hr class="border-gray-300 dark:border-gray-600 my-2"/>
            <div v-if="discountAmount > 0">
              <div class="flex items-center justify-between font-semi-bold text-red-500">
                <span>{{ translate('shop.checkout.cart.discount') }}</span>
                <span class="text-danger font-bold">-{{ formatPrice(discountAmount, currency) }}</span>
              </div>
              <hr class="border-gray-300 dark:border-gray-600 my-2"/>
            </div>
            <div class="flex items-center justify-between font-semi-bold">
              <span>{{ translate('shop.checkout.cart.total') }}</span>
              <span class="font-bold">{{ formatPrice(totalAmount, currency) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="title">
            <h5>{{ translate('shop.checkout.cart.payment') }}</h5>
          </div>
          <hr class="border-gray-300 dark:border-gray-600"/>
          <div class="body">
            <label class="mb-1 block">{{ translate('shop.checkout.select_currency') }}</label>
            <div class="mb-2" v-if="cart.items.length > 0 && altCoinsList.length > 0">
              <select aria-label="Select Payment Currency" class="form-select w-full" v-model="altCoinID">
                <option :key="index" :value="altCoin.id" v-for="(altCoin, index) of altCoinsList">
                  {{ altCoin.name }}
                </option>
              </select>
            </div>
            <div class="mt-4 text-right">
              <j-button :disabled="isProcessing" type="button" @click="processCart()">
                <div v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </div>
                <span>{{ translate('shop.checkout.process') }}</span>
              </j-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import { useRouter } from 'vue-router'
import { FETCH_SHOP_DATA, SAVE_PRODUCTS, SET_INVOICE, UPDATE_CART } from '@/store/keys'

export default {
  name: 'Checkout',
  components: {
    CenteredLayout,
    Icon,
    JButton
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    // Store
    const store = useStore()
    const router = useRouter()

    const {
      showError,
      validate
    } = validator()
    const { formatPrice } = compositionUtils()

    // State
    const state = reactive({
      countriesList: [],
      altCoinID: null,
      altCoinsList: [],
      form: {
        hasaddress: 1,
        billingfirstname: '',
        billinglastname: '',
        billingorg: '',
        billingphone: '',
        billingskype: '',
        billingemail: '',
        billingaddress: '',
        billingpostalcode: '',
        billingcity: '',
        billingprovince: '',
        billingcountryid: '',
        shippingfirstname: '',
        shippinglastname: '',
        shippingorg: '',
        shippingphone: '',
        shippingskype: '',
        shippingemail: '',
        shippingaddress: '',
        shippingpostalcode: '',
        shippingcity: '',
        shippingprovince: '',
        shippingcountryid: '',
        shippingcost: 0
      },
      differentFromBilling: false,
      code: '',
      errorBag: {},
      rules: {
        billingfirstname: ['required'],
        billinglastname: ['required'],
        billingphone: ['required'],
        billingemail: ['required', 'email'],
        billingaddress: ['required'],
        billingpostalcode: ['required'],
        billingcity: ['required'],
        billingprovince: ['required'],
        billingcountryid: ['required'],
        shippingfirstname: ['required'],
        shippinglastname: ['required'],
        shippingphone: ['required'],
        shippingemail: ['required', 'email'],
        shippingaddress: ['required'],
        shippingpostalcode: ['required'],
        shippingcity: ['required'],
        shippingprovince: ['required'],
        shippingcountryid: ['required']
      },
      messages: {
        billingfirstname: {
          required: 'Billing first name is required'
        },
        billinglastname: {
          required: 'Billing last name is required'
        },
        billingphone: {
          required: 'Billing phone is required'
        },
        billingemail: {
          required: 'Billing email is required',
          email: 'Please provide a valid email'
        },
        billingaddress: {
          required: 'Billing address is required'
        },
        billingpostalcode: {
          required: 'Billing postal code is required'
        },
        billingcity: {
          required: 'Billing city is required'
        },
        billingprovince: {
          required: 'Billing state/province is required'
        },
        billingcountryid: {
          required: 'Billing country is required'
        },
        shippingfirstname: {
          required: 'Shipping first name is required'
        },
        shippinglastname: {
          required: 'Shipping last name is required'
        },
        shippingphone: {
          required: 'Shipping phone is required'
        },
        shippingemail: {
          required: 'Shipping email is required',
          email: 'Please provide a valid email'
        },
        shippingaddress: {
          required: 'Shipping address is required'
        },
        shippingpostalcode: {
          required: 'Shipping postal code is required'
        },
        shippingcity: {
          required: 'Shipping city is required'
        },
        shippingprovince: {
          required: 'Shipping state/province is required'
        },
        shippingcountryid: {
          required: 'Shipping country is required'
        }
      },
      discountCode: '',
      discountValue: 0,
      discountAmount: 0,
      shippingMethods: [],
      shippingMethod: null,
      isProcessing: false
    })

    // Computed
    const countries = computed(() => store.state.countries)
    const cart = computed(() => store.state.cart)
    const shopId = computed(() => store.state.shopId)
    const shop = computed(() => store.state.shopData)
    const shopsList = computed(() => store.state.shopsList)
    const altCoins = computed(() => store.state.altCoins)
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
    const shopCurrencyShortName = () => {
      let currency = 'EUR'
      if (selectedShop.value) {
        currency = selectedShop.value.PayoutCurrencyShortName
      }
      return currency
    }
    const subTotal = computed(() => {
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
      if (state.shippingMethod) {
        total += Number(state.shippingMethod.cost)
      }
      if (state.discountValue) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        state.discountAmount = total * (Number(state.discountValue) / 100)
      }
      return total - state.discountAmount
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        Object.keys(newVal).forEach(key => {
          if (key.startsWith('billing')) {
            if (newVal[key] && newVal[key] !== oldVal[key]) {
              updateFormValue(key)
            }
          }
        })
      })
    watch(() => state.differentFromBilling,
      (newVal, oldVal) => {
        toggleShippingAddress(newVal)
      })
    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const validateCoupon = () => {
      if (state.code) {
        http.get(`${apiBaseUrl}/MarketAPI?POSDATA`, {
          params: {
            Call: 'SHOWPOS',
            KeyData: `${cart.value.merchantId}_coupon${state.code.trim()}`,
            MerchantID: cart.value.merchantId,
            APIKey: '_',
            output: 'json'
          }
        }).then(response => {
          if (response.status === 200) {
            const data = response.data
            if (data === 'nothing found') {
              toast.warning('Coupon code is not valid')
            } else {
              state.discountValue = Number(data)
              state.discountCode = state.code
              state.code = ''
            }
          }
        }).catch(errors => {
          console.log(errors)
        })
      }
    }
    const removeCoupon = () => {
      if (state.discountValue > 0) {
        state.discountValue = 0
        state.discountCode = ''
        state.discountAmount = 0
      }
    }
    const toggleShippingAddress = (differentFromBilling) => {
      if (!differentFromBilling) {
        state.form.shippingfirstname = state.form.billingfirstname
        state.form.shippinglastname = state.form.billinglastname
        state.form.shippingorg = state.form.billingorg
        state.form.shippingskype = state.form.billingskype
        state.form.shippingemail = state.form.billingemail
        state.form.shippingphone = state.form.billingphone
        state.form.shippingaddress = state.form.billingaddress
        state.form.shippingpostalcode = state.form.billingpostalcode
        state.form.shippingcity = state.form.billingcity
        state.form.shippingprovince = state.form.billingprovince
        state.form.shippingcountryid = state.form.billingcountryid
      } else {
        state.form.shippingfirstname = ''
        state.form.shippinglastname = ''
        state.form.shippingorg = ''
        state.form.shippingskype = ''
        state.form.shippingemail = ''
        state.form.shippingphone = ''
        state.form.shippingaddress = ''
        state.form.shippingpostalcode = ''
        state.form.shippingcity = ''
        state.form.shippingprovince = ''
        state.form.shippingcountryid = ''
      }
      updateShipping()
    }
    const updateShipping = () => {
      const countryId = (state.differentFromBilling) ? state.form.shippingcountryid : state.form.billingcountryid
      if (countryId) {
        const country = _.find(state.countriesList, { id: countryId })
        if (country && typeof country.shippingMethods !== 'undefined') {
          state.shippingMethods = country.shippingMethods
          state.shippingMethod = state.shippingMethods[0]
          state.form.shippingcost = state.shippingMethod.cost
        }
      } else {
        state.shippingMethods = []
        state.form.shippingcost = 0
      }
    }
    const updateFormValue = (key) => {
      if (!state.differentFromBilling) {
        const newKey = key.replace('billing', 'shipping')
        state.form[newKey] = state.form[key]
      }
    }
    const updateCustomerShipping = (option) => {
      state.shippingMethod = option
      state.form.shippingcost = option.cost
    }
    const hashString = (s) => {
      let h = 0
      const l = s.length
      let i = 0
      if (l > 0) {
        while (i < l) {
          h = (h << 5) - h + s.charCodeAt(i++) | 0
        }
      }
      return h
    }
    const processCart = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        let order = ''
        cart.value.items.map(item => {
          order += `${item.id}|${item.sku}|${item.name}|${item.url}|${item.price}|${item.qty}:::`
        })
        if (state.shippingMethod) {
          order += `${state.shippingMethod.method}|${state.shippingMethod.cost}:::`
        }
        if (state.discountAmount > 0) {
          order += `${state.discountValue}|${state.discountCode}|${state.discountAmount}`
        }
        if (totalAmount.value > 0) {
          state.isProcessing = true
          const payload = {
            MerchantID: cart.value.merchantId,
            Checkout: true,
            Amount: totalAmount.value,
            CustomerReferenceNr: order,
            inputCurrency: shopCurrencyShortName.value,
            AltCoinID: state.altCoinID,
            api: hashString(cart.value.merchantId),
            active: 1,
            hasAddress: 1,
            ...state.form,
            coupon: state.discountCode,
            output: 'json'
          }
          http.get(`${apiBaseUrl}/MerchantAPI`, {
            params: payload
          }).then(response => {
            const transaction = response.data
            state.isProcessing = false
            if (response.status === 200) {
              // Deduct quantity
              // Update products and favourites
              const products = _.cloneDeep(shop.value.products)
              products.filter(product => {
                const index = _.findIndex(cart.value.items, { sku: product.sku })
                if (index !== -1) {
                  const item = cart.value.items[index]
                  product.stock = (Number(product.stock) - item.qty).toString()
                }
              })
              store.dispatch(SAVE_PRODUCTS, {
                call: 'UPDATE',
                data: products,
                user: {
                  ID: cart.value.merchantId,
                  APIKey: '_'
                }
              }).catch(error => {
                console.log(error)
              })
              // Clear cart
              store.commit(UPDATE_CART, {
                items: [],
                merchantId: null
              })
              // Save invoice for latter use
              store.commit(SET_INVOICE, transaction)
              router.push({
                name: 'shop-invoice',
                params: { confirmCode: transaction.Security }
              })
            }
          }).catch(error => {
            console.log(error)
            this.isLoading = false
          })
        }
      }
    }

    onBeforeMount(() => {
      if (cart.value.items.length === 0) {
        router.push({ name: 'shop' })
      }
      if (cart.value.merchantId) {
        store.dispatch(FETCH_SHOP_DATA, { shopId: cart.value.merchantId }).catch(error => {
          console.log(error)
        })
        http.get(`${apiBaseUrl}/MarketAPI?POSDATA`, {
          params: {
            Call: 'SHOWPOS',
            MerchantID: cart.value.merchantId,
            APIKey: '_',
            KeyData: `${cart.value.merchantId}_shippings`,
            output: 'json'
          }
        }).then(response => {
          if (response.status === 200) {
            const data = response.data
            if (data.length > 0) {
              const countriesList = []
              data.map(item => {
                const index = _.findIndex(countriesList, { id: item.countryId })
                if (index !== -1) {
                  const optionIndex = _.findIndex(countriesList[index].shippingMethods, { method: item.shippingMethod })
                  if (optionIndex === -1) {
                    countriesList[index].shippingMethods.push({
                      method: item.shippingMethod,
                      cost: item.shippingCost
                    })
                  }
                } else {
                  countriesList.push({
                    id: item.countryId,
                    name: item.countryName,
                    shippingMethods: [
                      {
                        method: item.shippingMethod,
                        cost: item.shippingCost
                      }
                    ]
                  })
                }
              })
              state.countriesList = countriesList
            } else {
              state.countriesList = countries.value
            }
          }
        }).catch(errors => {
          console.log(errors)
        })
        http.get(`${apiBaseUrl}/CloneMasterTransaction`, {
          params: {
            MerchantID: cart.value.merchantId,
            output: 'json',
            JsonArray: ''
          }
        }).then(response => {
          if (response.status === 200) {
            state.altCoinsList = response.data.filter(coin => coin.id !== 0)
            state.altCoinID = state.altCoinsList.length > 0 ? state.altCoinsList[0].id : null
          }
        }).catch(error => {
          console.log(error)
        })
      }
    })

    return {
      translate,
      ...toRefs(state),
      cart,
      currency,
      altCoins,
      showError,
      formatPrice,
      validateCoupon,
      removeCoupon,
      subTotal,
      totalAmount,
      updateShipping,
      updateCustomerShipping,
      processCart
    }
  }
}
</script>

<style scoped></style>
