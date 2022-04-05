<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <!--Billing Information-->
        <h5 class="font-semibold py-2 uppercase tracking-tight">{{ translate('shop.checkout.billing') }}</h5>
        <hr class="border-gray-300 dark:border-gray-600 mb-2"/>
        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_first_name') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingfirstname') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingfirstname"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_last_name') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billinglastname') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billinglastname"/>
          </div>

        </div>

        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.organization') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingorg') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingorg"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_phone') }}
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingPhone') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingphone"/>
          </div>

        </div>

        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_skype') }}
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingskype') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingskype"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_email') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingemail') }}</div>
            </div>
            <input class="form-input w-full" type="email" v-model="form.billingemail"/>
          </div>

        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>
              {{ translate('shop.checkout.billing_address') }}
              <span class="ml-1 text-red-500">*</span>
            </label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingaddress') }}</div>
          </div>
          <textarea class="form-input w-full" v-model="form.billingaddress" rows="2"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_postal_code') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingpostalcode') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingpostalcode"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_city') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingcity') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingcity"/>
          </div>

        </div>

        <div class="grid grid-cols-2 gap-1 md:gap-4">

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_state') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingprovince') }}</div>
            </div>
            <input class="form-input w-full" type="text" v-model="form.billingprovince"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.billing_country') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'billingcountryid') }}</div>
            </div>
            <select @change="updateShipping()" class="form-select w-full" v-model="form.billingcountryid">
              <option value="">Select</option>
              <option :key="index" :value="country.id" v-for="(country, index) of countries">
                {{ country.name }}
              </option>
            </select>
          </div>

        </div>

        <!--Shipping Information-->
        <h5 class="font-semibold py-2 uppercase tracking-tight">{{ translate('shop.checkout.shipping') }}</h5>
        <hr class="border-gray-300 dark:border-gray-600 mb-2"/>
        <label class="inline-flex items-center mb-2 cursor-pointer">
          <input type="checkbox" v-model="differentFromBilling"/>
          <span class="ml-3">{{ translate('shop.checkout.different_from_billing') }}</span>
        </label>
        <div class="mb-2" v-if="differentFromBilling">
          <div class="grid grid-cols-2 gap-1 md:gap-4">

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_first_name') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingfirstname') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingfirstname"/>
            </div>

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_last_name') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippinglastname') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippinglastname"/>
            </div>

          </div>

          <div class="grid grid-cols-2 gap-1 md:gap-4">

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('shop.checkout.organization') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingorg') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingorg"/>
            </div>

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_phone') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingphone') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingphone"/>
            </div>

          </div>

          <div class="grid grid-cols-2 gap-1 md:gap-4">

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('shop.checkout.shipping_skype') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingskype') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingskype"/>
            </div>

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_email') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingemail') }}</div>
              </div>
              <input class="form-input w-full" type="email" v-model="form.shippingemail"/>
            </div>

          </div>

          <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>
                {{ translate('shop.checkout.shipping_address') }}
                <span class="ml-1 text-red-500">*</span>
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingaddress') }}</div>
            </div>
            <textarea class="form-input w-full" v-model="form.shippingaddress" rows="2"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-1 md:gap-4">

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_postal_code') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">
                  {{ showError(errorBag, 'shippingpostalcode') }}
                </div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingpostalcode"/>
            </div>

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_city') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingcity') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingcity"/>
            </div>

          </div>

          <div class="grid grid-cols-2 gap-1 md:gap-4">

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_state') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingprovince') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.shippingprovince"/>
            </div>

            <div class="col-span-2 md:col-span-1 mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>
                  {{ translate('shop.checkout.shipping_country') }}
                  <span class="ml-1 text-red-500">*</span>
                </label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'shippingcountryid') }}</div>
              </div>
              <select @change="updateShipping()" class="form-select w-full" v-model="form.shippingcountryid">
                <option value="">Select</option>
                <option :key="index" :value="country.id" v-for="(country, index) of countries">
                  {{ country.name }}
                </option>
              </select>
            </div>

          </div>
        </div>

        <div v-if="shippingOptions.length > 0">
          <hr class="border-gray-300 dark:border-gray-600 mb-2"/>
          <ul class="pl-0">
            <li :key="index" v-for="(option, index) of shippingOptions" class="mb-2">
              <label>
                <input :checked="option.method === shippingOption.method"
                       @change="updateCustomerShipping(option)" name="shipping" type="radio">
                <span class="ml-3">{{ option.method + ' ' + formatPrice(option.cost) }}</span>
              </label>
            </li>
          </ul>
          <div class="flex items-center justify-between mb-2">
            <span>{{ translate('shop.checkout.cart.shipping_cost') }}</span>
            <span>{{ formatPrice(shippingOption.cost) }}</span>
          </div>
        </div>
        <div class="mb-2">
          <div class="flex items-center">
            <input class="form-input w-full rounded-r-none" placeholder="Discount Code" type="text"
                   v-model="couponCode">
            <j-button @click="validateCoupon()" type="button" class="rounded-l-none py-3">
              {{ translate('shop.checkout.cart.btn_apply') }}
            </j-button>
          </div>
        </div>
        <div v-if="discountValue > 0" class="mb-2">
          <div class="inline-flex items-center bg-yellow-500 text-gray-700 px-3 py-1 text-sm rounded">
            {{ discountCode }}
            <span class="cursor-pointer ml-3" @click="removeCoupon()">
              <icon name="close" classes="w-4 h-4 hover:text-gray-800"></icon>
            </span>
          </div>
        </div>
        <div v-if="discountAmount > 0" class="mb-3">
          <div class="flex items-center justify-between text-blue-500 font-semibold">
            <span>{{ translate('shop.checkout.cart.discount') }}</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold">{{ translate('shop.checkout.cart.total') }}</span>
          <span class="font-bold">{{ formatPrice(totalAmount) }}</span>
        </div>
        <div class="mt-2 text-right">
          <j-button :disabled="isProcessing" type="submit">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.products.charge.btn_charge') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import { SAVE_TICKETS } from '@/store/keys'
import { useRouter } from 'vue-router'

export default {
  name: 'DeliveryModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const http = inject('http')
    const toast = inject('toast')

    // Store
    const store = useStore()
    const router = useRouter()

    const {
      showError,
      validate
    } = validator()
    const {
      toFixed,
      saveNotification
    } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      ticket: null,
      currency: 'EUR',
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
      differentFromBilling: false,
      userAltCoins: [],
      shippingOption: null,
      shippingOptions: [],
      countries: [],
      couponCode: '',
      discountValue: 0,
      discountAmount: 0,
      discountCode: null,
      confirmHook: () => {
      },
      isProcessing: false
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const totalAmount = computed(() => {
      let total = 0
      if (state.ticket) {
        state.ticket.ticketProducts.map(product => {
          total = Number(total) + Number(product.productQuantity) * Number(product.productPrice)
        })
      }
      if (state.shippingOption) {
        total += Number(state.shippingOption.cost)
      }
      if (state.discountValue) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        state.discountAmount = total * (Number(state.discountValue) / 100)
      }
      return total - state.discountAmount
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const formatPrice = (value) => {
      return value ? (toFixed(value) + ' ' + state.currency) : ''
    }
    const toggleShippingAddress = () => {
      if (!state.differentFromBilling) {
        state.form = {
          ...state.form,
          shippingfirstname: state.form.billingfirstname,
          shippinglastname: state.form.billinglastname,
          shippingorg: state.form.billingorg,
          shippingskype: state.form.billingskype,
          shippingemail: state.form.billingemail,
          shippingphone: state.form.billingphone,
          shippingaddress: state.form.billingaddress,
          shippingpostalcode: state.form.billingpostalcode,
          shippingcity: state.form.billingcity,
          shippingprovince: state.form.billingprovince,
          shippingcountryid: state.form.billingcountryid
        }
      } else {
        state.form = {
          ...state.form,
          shippingfirstname: '',
          shippinglastname: '',
          shippingorg: '',
          shippingskype: '',
          shippingemail: '',
          shippingphone: '',
          shippingaddress: '',
          shippingpostalcode: '',
          shippingcity: '',
          shippingprovince: '',
          shippingcountryid: ''
        }
      }
      updateShipping()
    }
    const updateShipping = () => {
      const countryId = (state.differentFromBilling) ? state.form.shippingcountryid : state.form.billingcountryid
      if (countryId) {
        const country = _.find(state.countries, { id: countryId })
        if (country && typeof country.shippingOptions !== 'undefined') {
          state.shippingOptions = country.shippingOptions
          state.shippingOption = state.shippingOptions[0]
          state.form.shippingcost = state.shippingOption.cost
        }
      } else {
        state.shippingOptions = []
        state.form.shippingcost = 0
      }
    }
    const updateCustomerShipping = (option) => {
      state.shippingOption = option
      state.form.shippingcost = option.cost
    }
    const validateCoupon = () => {
      if (state.couponCode) {
        http.get(`${apiBaseUrl}/MarketAPI?POSDATA`, {
          params: {
            Call: 'SHOWPOS',
            KeyData: `${user.value.ID}_coupon${state.couponCode.trim()}`,
            MerchantID: user.value.ID,
            APIKey: '_',
            output: 'json'
          }
        }).then(response => {
          if (response.status === 200) {
            const data = response.data
            if (data === 'nothing found') {
              toast.warning('Coupon code is not valid')
              saveNotification('Coupon code is not valid')
            } else {
              state.discountValue = Number(data)
              state.discountCode = state.couponCode
              state.couponCode = ''
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
        state.discountCode = null
        state.discountAmount = 0
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        if (state.ticket && totalAmount.value > 0) {
          state.isProcessing = true
          const altCoin = _.find(state.userAltCoins, { name: state.ticket.currency })
          if (Object.keys(altCoin).length > 0) {
            let order = ''
            state.ticket.ticketProducts.map(item => {
              order += `${item.productId}|${item.productSku}|${item.productName}|${item.imageUrl}|${item.productPrice}|${item.productQuantity}:::`
            })
            if (state.shippingOption) {
              order += `${state.shippingOption.method}|${state.shippingOption.cost}:::`
            }
            if (state.discountAmount > 0) {
              order += `${state.discountValue}|${state.discountCode}|${state.discountAmount}`
            }
            const payload = {
              MerchantID: user.value.ID,
              Checkout: true,
              Amount: totalAmount.value,
              CustomerReferenceNr: order,
              inputCurrency: accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR',
              AltCoinID: altCoin.id,
              SecurityCode: user.value.SecurityCode,
              active: 1,
              hasAddress: 1,
              ...state.form,
              coupon: state.discountCode,
              output: 'json'
            }
            http.get(`${apiBaseUrl}/MerchantAPI`, {
              params: payload
            }).then(response => {
              state.isProcessing = false
              const activeTicket = _.cloneDeep(state.ticket)
              activeTicket.paymentRequest = response.data
              activeTicket.status = 'inprogress'
              const tickets = _.cloneDeep(pos.value.tickets)
              // Update tickets
              const ticketIndex = _.findIndex(tickets, { ticketId: activeTicket.ticketId })
              if (ticketIndex !== -1) {
                tickets.splice(ticketIndex, 1, activeTicket)
                store.dispatch(SAVE_TICKETS, {
                  call: posCalls.value.tickets,
                  data: tickets
                })
              }
              router.push({
                name: 'account-pos-invoice',
                params: { confirmCode: activeTicket.paymentRequest.Security }
              })
            }).catch(error => {
              state.isProcessing = false
              toast.error(error.response.data)
              saveNotification(error.response.data)
            })
          } else {
            toast.warning('Please select currency')
          }
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('deliveryModal', (args) => {
        state.ticket = args.ticket
        state.countries = args.countries
        state.userAltCoins = args.userAltCoins
        state.confirmHook = args.confirm
        state.currency = accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
        state.form = {
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
        }
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      showError,
      formatPrice,
      totalAmount,
      toggleShippingAddress,
      updateShipping,
      updateCustomerShipping,
      validateCoupon,
      removeCoupon,
      submit
    }
  }
}
</script>

<style scoped>

</style>
