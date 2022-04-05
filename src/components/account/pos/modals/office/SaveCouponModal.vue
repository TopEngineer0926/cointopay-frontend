<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.coupons.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.coupons.coupon_code') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'couponCode') }}</div>
          </div>
          <input class="form-input w-full" :readonly="coupon" type="text" v-model="form.couponCode"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.coupons.discount') + ' (%)' }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'discount') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.discount"/>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.coupons.btn_save') }}</span>
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
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import { FETCH_COUPONS } from '@/store/keys'

export default {
  name: 'SaveCouponModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')
    const http = inject('http')

    const store = useStore()

    const {
      showError,
      validate
    } = validator()
    const { saveNotification } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      coupon: null,
      form: {
        couponCode: '',
        discount: ''
      },
      errorBag: {},
      rules: {
        couponCode: ['required', 'regex:/^[a-zA-Z0-9]+$/'],
        discount: ['required', 'between:1,60']
      },
      messages: {
        couponCode: {
          required: 'Coupon code is required',
          regex: 'Only alphabets and numbers are allowed'
        },
        discount: {
          required: 'Please enter a valid discount',
          between: 'Discount should be a number between 1 and 60'
        }
      },
      isProcessing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const coupons = computed(() => store.state.coupons)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      }
    )

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const formData = state.form
        let isValid = true
        let coupon = null
        const couponCode = `${user.value.ID}_coupon${formData.couponCode}`
        if (state.coupon) {
          if (_.findIndex(coupons.value, coupon => {
            return (
              coupon.KeyData.toLowerCase() === couponCode.toLowerCase() &&
              coupon.ID.toString() !== state.coupon.ID.toString()
            )
          }) === -1) {
            coupon = {
              ...state.coupon,
              KeyData: couponCode,
              ValueData: formData.discount
            }
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Coupon code already exists!')
            saveNotification('Coupon code already exists!')
          }
        } else {
          if (_.findIndex(coupons.value, { KeyData: couponCode }) === -1) {
            coupon = {
              KeyData: couponCode,
              ValueData: formData.discount
            }
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Coupon code already exists!')
            saveNotification('Coupon code already exists!')
          }
        }
        if (isValid) {
          const payload = {
            POSDATA: '',
            Call: state.coupon ? 'UPDATE' : 'INSERT',
            KeyData: coupon.KeyData,
            ValueData: coupon.ValueData,
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            output: 'json'
          }
          http.get(`${apiBaseUrl}/MarketAPI`, {
            params: payload
          }).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              store.dispatch(FETCH_COUPONS, {
                MerchantID: user.value.ID,
                APIKey: user.value.APIKey
              })
              const message = state.coupon ? 'Coupon updated successfully' : 'Coupon added successfully'
              toast.success(message)
              saveNotification(message)
              closeModal()
            }
          }).catch(errors => {
            state.isProcessing = false
            console.log(errors)
          })
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('saveCouponModal', (args) => {
        state.coupon = args.coupon || null
        state.form = {
          couponCode: state.coupon ? state.coupon.KeyData.split('coupon')[1] : '',
          discount: state.coupon ? Number(state.coupon.ValueData) : ''
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      closeModal,
      submit
    }
  }
}
</script>

<style scoped>

</style>
