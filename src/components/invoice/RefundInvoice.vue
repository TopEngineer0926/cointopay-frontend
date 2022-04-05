<template>
  <div class="mt-4">
    <form @submit.prevent="submit()">
      <div class="flex items-center flex-col md:flex-row">
        <div class="w-full md:flex-1 mr-0 md:mr-3">
          <div class="text-right mb-1" v-if="hasErrors">
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'address') }}</div>
          </div>
          <input v-model="form.address" class="form-input w-full"
                 placeholder="Refund address (crypto/coin address)" type="text"/>
        </div>
        <div class="mt-3 md:mt-0">
          <label class="mb-1 block" v-if="hasErrors">&nbsp;</label>
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('invoice.add') }}</span>
          </j-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, reactive, toRefs, watch } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'RefundInvoice',
  props: ['invoice'],
  components: {
    JButton,
    Icon
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    const {
      showError,
      validate
    } = validator()
    const { saveNotification } = compositionUtils()

    const state = reactive({
      form: {
        address: ''
      },
      errorBag: {},
      rules: {
        address: ['required']
      },
      isProcessing: false
    })
    // Computed
    const hasErrors = computed(() => Object.keys(state.errorBag).length > 0)

    // Watch
    watch(() => ({ ...state.form }),
      () => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const params = {
          Call: 'Refund',
          MerchantID: 1,
          APIKey: '_',
          RefundAddress: state.form.address,
          ConfirmCode: props.invoice.Security,
          output: 'json'
        }

        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: params
        }).then(response => {
          state.isProcessing = false
          if (response.data.result === 'success') {
            toast.success('Refund address added successfully')
            saveNotification('Refund address added successfully')
          } else {
            toast.error(response.data.message)
          }
          state.form.address = ''
          state.errorBag = {}
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    return {
      translate,
      ...toRefs(state),
      showError,
      hasErrors,
      submit
    }
  }
}
</script>

<style scoped></style>
