<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('buy.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div v-html="responseData"></div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { reactive, inject, onBeforeMount, toRefs } from 'vue'

export default {
  name: 'BuyReceiptModal',
  components: {
    Modal,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      responseData: null
    })

    const closeModal = () => {
      state.show = false
    }

    onBeforeMount(() => {
      emitter.on('buyReceiptModal', (args) => {
        state.responseData = args.responseData
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal
    }
  }
}
</script>

<style scoped></style>
