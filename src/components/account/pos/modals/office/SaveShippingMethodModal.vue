<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.shipping.title') }}</span>
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
            <label>{{ translate('pos.shipping.country') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'countryId') }}</div>
          </div>
          <select @change="updateCountryName()" class="form-select w-full" v-model="form.countryId">
            <option :key="index" :value="country.id" v-for="(country, index) of countries">
              {{ country.name }}
            </option>
          </select>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.shipping.shipping_method') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'shippingMethod') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.shippingMethod"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.shipping.shipping_cost') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'shippingCost') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.shippingCost"/>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.shipping.btn_save') }}</span>
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
import { SAVE_SHIPPING_METHODS } from '@/store/keys'

export default {
  name: 'SaveShippingMethodModal',
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

    const store = useStore()

    const {
      showError,
      validate
    } = validator()
    const {
      generateId
    } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      shippingMethod: null,
      form: {
        countryId: '',
        countryName: '',
        shippingCost: '',
        shippingMethod: ''
      },
      errorBag: {},
      rules: {
        countryId: ['required'],
        countryName: ['required'],
        shippingCost: ['required'],
        shippingMethod: ['required']
      },
      messages: {
        countryId: {
          required: 'Please select country'
        },
        countryName: {
          required: 'Please select country'
        },
        shippingCost: {
          required: 'Please provide a shipping cost'
        },
        shippingMethod: {
          required: 'Please provide a shipping method'
        }
      },
      isProcessing: false
    })

    // Computed
    const countries = computed(() => store.state.countries)
    const shippingMethods = computed(() => store.state.shippingMethods)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      }
    )

    // Methods
    const closeModal = () => {
      state.show = false
    }
    const updateCountryName = () => {
      const country = _.find(countries.value, { id: Number(state.form.countryId) })
      if (country) {
        state.form.countryName = country.name
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const formData = state.form
        const shippingMethodsList = _.cloneDeep(shippingMethods.value)
        if (state.shippingMethod) {
          const index = _.findIndex(shippingMethods.value, { id: state.shippingMethod.id })
          shippingMethodsList[index] = {
            id: shippingMethodsList[index].id,
            ...formData
          }
        } else {
          shippingMethodsList.push({
            id: generateId(shippingMethodsList, 'id'),
            ...formData
          })
        }
        store.dispatch(SAVE_SHIPPING_METHODS, shippingMethodsList).then(response => {
          state.isProcessing = false
          toast.success('Shipping options saved successfully')
          closeModal()
        }).catch(errors => {
          state.isProcessing = false
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('saveShippingMethodModal', (args) => {
        state.shippingMethod = args.shippingMethod || null
        state.form = {
          countryId: state.shippingMethod ? state.shippingMethod.countryId : '',
          countryName: state.shippingMethod ? state.shippingMethod.countryName : '',
          shippingCost: state.shippingMethod ? state.shippingMethod.shippingCost : '',
          shippingMethod: state.shippingMethod ? state.shippingMethod.shippingMethod : ''
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      countries,
      showError,
      closeModal,
      updateCountryName,
      submit
    }
  }
}
</script>

<style scoped>

</style>
