<template>
  <div v-if="productRatings.length > 0">
    <div style="max-height: 500px"
         class="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
      <div :key="index" v-for="(rating, index) of productRatings">
        <div class="flex items-start review">
          <div class="avatar">
            {{ generateAvatar(rating.ReviewerName) }}
          </div>
          <div class="mb-3">
            <p class="font-semibold mb-1">{{ rating.ReviewerName }}</p>
            <div class="flex items-start md:items-center flex-col md:flex-row mb-2">
              <star-rating :increment="1" :max-rating="5" :rating="Number(rating.ReviewStars)"
                           :read-only="true" :show-rating="false" :star-size="20" active-color="#ffd200"
                           inactive-color="#d0d0d0"></star-rating>
              <p class="ml-0 md:ml-3 text-sm font-medium">
                {{ `${formatDT(rating.ReviewCreatedOn)} - ${rating.ReviewerEmail}` }}</p>
            </div>
            <p class="font-semibold">{{ rating.ReviewTitle }}</p>
            <p class="text-gray-500">{{ rating.ReviewDescription }}</p>
          </div>
        </div>
      </div>
    </div>
    <hr class="border-gray-300 dark:border-gray-600 mb-3"/>
    <form @submit.prevent="submit()">
      <div class="grid grid-cols-3 gap-2 lg:gap-4">
        <div class="col-span-3 md:col-span-1 mb-2">
          <label class="block mb-1">
            {{ translate('ratings.author') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <input class="form-input w-full" type="text" v-model="form.author">
          <div class="text-red-500 text-sm">{{ showError(errorBag, 'author') }}</div>
        </div>
        <div class="col-span-3 md:col-span-1 mb-2">
          <label class="block mb-1">
            {{ translate('ratings.email') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <input class="form-input w-full" type="email" v-model="form.email">
          <div class="text-red-500 text-sm">{{ showError(errorBag, 'email') }}</div>
        </div>
        <div class="col-span-3 md:col-span-1 mb-2">
          <label class="block mb-1">
            {{ translate('ratings.title') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <input class="form-input w-full" type="text" v-model="form.title">
          <div class="text-red-500 text-sm">{{ showError(errorBag, 'title') }}</div>
        </div>
      </div>
      <div class="mb-2">
        <label class="block mb-1">
          {{ translate('ratings.comment') }}
          <span class="ml-1 text-red-500">*</span>
        </label>
        <textarea class="form-input w-full" rows="3" v-model="form.comment"></textarea>
        <div class="text-red-500 text-sm">{{ showError(errorBag, 'comment') }}</div>
      </div>
      <div class="mb-2">
        <vue-recaptcha ref="vueRecaptcha" :siteKey="reCaptchaAPIKey"
                       size="normal" @expire="recaptchaExpired" :theme="theme"
                       @fail="recaptchaFailed" @verify="recaptchaVerified"></vue-recaptcha>
        <div class="text-red-500 text-sm">{{ showError(errorBag, 'reCaptcha') }}</div>
      </div>

      <star-rating :increment="1" :max-rating="5" :show-rating="false"
                   :star-size="20" active-color="#ffd200"
                   inactive-color="#d0d0d0" v-model:rating="form.rating"></star-rating>
      <div class="text-red-500 text-sm">{{ showError(errorBag, 'rating') }}</div>

      <div class="mt-4 text-right">
        <j-button :disabled="isProcessing">
          <div v-if="isProcessing" class="mr-3">
            <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
          </div>
          <span>{{ translate('ratings.btn_rate') }}</span>
        </j-button>
      </div>
    </form>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import StarRating from 'vue-star-rating'
import vueRecaptcha from 'vue3-recaptcha2'
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import { FETCH_RATINGS } from '@/store/keys'
import * as _ from 'lodash'

export default {
  name: 'ReviewRating',
  props: ['shopId', 'product'],
  components: {
    StarRating,
    vueRecaptcha,
    JButton,
    Icon
  },
  setup (props, { emit }) {
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    const vueRecaptcha = ref(null)
    const store = useStore()

    const {
      validate,
      showError
    } = validator()

    const {
      formatDT,
      saveNotification
    } = compositionUtils()

    const state = reactive({
      reCaptchaAPIKey: process.env.VUE_APP_GOOGLE_reCAPTCHA_SITE_KEY,
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
      errorBag: {},
      rules: {
        author: ['required'],
        email: ['required', 'email'],
        title: ['required'],
        comment: ['required'],
        rating: ['required', 'minValue:1'],
        reCaptcha: ['required']
      },
      messages: {
        author: {
          required: 'Please enter your full name'
        },
        email: {
          required: 'Please enter your email address',
          email: 'Email address is not valid'
        },
        title: {
          required: 'Review title is required'
        },
        comment: {
          required: 'Review text is required'
        },
        rating: {
          required: 'Please rate the product',
          minValue: 'Please rate the product'
        },
        reCaptcha: {
          required: 'Verify you are not a robot'
        }
      },
      productRatings: [],
      isProcessing: false
    })

    const theme = computed(() => store.state.mode)

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
    const generateAvatar = (str) => {
      return str ? str[0] : ''
    }
    const recaptchaVerified = (response) => {
      state.form.reCaptcha = response
    }
    const recaptchaExpired = () => {
      vueRecaptcha.value.reset()
      state.form.reCaptcha = ''
    }
    const recaptchaFailed = () => {
    }

    const fetchRatings = () => {
      store.dispatch(FETCH_RATINGS, props.shopId).then(ratings => {
        state.ratings = ratings
        state.productRatings = []
        state.counter = 0
        if (props.product) {
          state.ratings.map(rating => {
            if (rating.SKU === props.product.sku) {
              state.counter += 1
              state.productRatings.push(rating)
            }
          })
        }
        // Sort by date desc
        state.productRatings = _.orderBy(state.productRatings, 'ReviewCreatedOn', 'desc')
      })
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const payload = {
          ...state.form,
          merchantid: props.shopId,
          sku: props.product.sku,
          output: 'json'
        }
        http.get(`${apiBaseUrl}/MarketAPI`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          toast.success('Thank you for your review')
          saveNotification('Thank you for your review')
          fetchRatings()
          vueRecaptcha.value.reset()
          state.form = {
            rating: 0,
            sku: '',
            merchantid: '',
            author: '',
            email: '',
            title: '',
            comment: '',
            reCaptcha: ''
          }
          emit('fetchRatings')
        }).catch(error => {
          console.log(error)
          state.isProcessing = false
          vueRecaptcha.value.reset()
        })
      }
    }

    onBeforeMount(() => {
      fetchRatings()
    })

    return {
      translate,
      ...toRefs(state),
      vueRecaptcha,
      showError,
      theme,
      generateAvatar,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
      formatDT,
      submit
    }
  }
}
</script>

<style scoped lang="scss">
.avatar {
  @apply w-12 h-12 rounded-full border border-blue-700 dark:border-gray-600 bg-blue-500 text-white flex items-center justify-center font-bold text-lg uppercase mr-3;
}
</style>
