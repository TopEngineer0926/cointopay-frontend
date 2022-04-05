<template>
  <div class="card">
    <h5 class="title">{{ translate('account.menu.payments') }}</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <form @submit.prevent="submit()">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.payment_urls.confirm') }}
            <span class="text-red-500 text-sm">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.transactionSuccessUrl"/>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'transactionSuccessUrl') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.payment_urls.fail') }}
            <span class="ml-1 text-red-500 text-sm">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.transactionFailUrl"/>
            <p class="text-xs whitespace-normal break-all">{{ translate('account.payment_urls.description') }}</p>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'transactionFailUrl') }}</div>
          </div>

        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.email_notifications') }}
            <span class="ml-1 text-red-500 text-sm">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select class="form-select w-full" v-model="form.Emailnotifications">
              <option value="0">Disable</option>
              <option value="1">Enable</option>
            </select>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'Emailnotifications') }}</div>
          </div>
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('account.button_update') }}</span>
          </j-button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'PaymentUrls',
  components: {
    JButton,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const toast = inject('toast')
    // Store
    const store = useStore()

    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      form: {
        transactionSuccessUrl: '',
        transactionFailUrl: '',
        Emailnotifications: '0'
      },
      errorBag: {},
      rules: {
        transactionSuccessUrl: ['required'],
        transactionFailUrl: ['required'],
        Emailnotifications: ['required']
      },
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules)
        }
      }
    )

    // Methods
    const cleanValue = (value) => {
      if (value === 'null' || value === null) {
        return ''
      }
      return value
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        if (accountInfo.value) {
          const payload = { ...accountInfo.value }
          payload.TransactionConfirmURL = state.form.transactionSuccessUrl
          payload.TransactionFailURL = state.form.transactionFailUrl
          payload.Emailnotifications = state.form.Emailnotifications
          state.isProcessing = true
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Payment urls updated successfully')
              saveNotification('Payment urls updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }

    onBeforeMount(() => {
      state.form = {
        transactionSuccessUrl: cleanValue(accountInfo.value.TransactionConfirmURL),
        transactionFailUrl: cleanValue(accountInfo.value.TransactionFailURL),
        Emailnotifications: accountInfo.value.Emailnotifications
      }
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      submit
    }
  }
}
</script>

<style scoped></style>
