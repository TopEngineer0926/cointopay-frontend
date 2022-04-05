<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        Enter PIN {{ pin }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div>
        <form @submit.prevent="submit">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <p v-html="desc"></p>
              <div class="text-red-500 text-sm mr-4">{{ showError(errorBag, 'pin') }}</div>
            </div>
            <input v-model="form.pin" aria-label="PIN" class="form-input w-full" type="text"/>
          </div>
          <div class="text-right">
            <j-button :disabled="isProcessing">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('send.button') }}</span>
            </j-button>
          </div>
        </form>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'PinValidationModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    const toast = inject('toast')

    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      pin: null,
      desc: null,
      instantPayment: null,
      form: {
        pin: ''
      },
      rules: {
        pin: ['required']
      },
      errorBag: {},
      isProcessing: false
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        if (state.pin === this.form.pin) {
          state.isProcessing = true
          http.get(`${apiBaseUrl}/GetSendToAddress`, {
            params: state.instantPayment
          }).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              closeModal()
              toast.success(response.data)
            } else {
              toast.error(response.data)
            }
            saveNotification(response.data)
          }).catch(error => {
            state.isProcessing = false
            const errorMessage = typeof error.response === 'undefined' ? error.data : error.response.data
            toast.error(errorMessage)
            saveNotification(errorMessage)
          })
        } else {
          toast.error('Please enter a valid PIN')
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('pinValidationModal', (args) => {
        state.pin = args.pin
        state.desc = args.desc
        state.instantPayment = args.instantPayment
        // Reset
        state.form = {
          pin: ''
        }
        state.errorBag = {}
        // Show modal
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
