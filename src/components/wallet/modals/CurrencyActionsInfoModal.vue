<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('dashboard.help') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <!-- Send -->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.send') }}</h5>
      <p class="mb-2">{{ translate('dashboard.send_description') }}</p>
      <!-- Receive -->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.receive') }}</h5>
      <p class="mb-2">{{ translate('dashboard.receive_description') }}</p>
      <!--LTR-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.ltr') }}</h5>
      <p class="mb-2">{{ translate('dashboard.ltr_description') }}</p>
      <!--Swap-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.swap') }}</h5>
      <p class="mb-2">{{ translate('dashboard.swap_description') }}</p>
      <!--vToken-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.vtoken') }}</h5>
      <p class="mb-2">{{ translate('dashboard.vtoken_description') }}</p>
      <!--Buy-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.buy') }}</h5>
      <p class="mb-2">{{ translate('dashboard.buy_description') }}</p>
      <!--Payout-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.payout') }}</h5>
      <p class="mb-2">{{ translate('dashboard.payout_description') }}</p>
      <!--Trade-->
      <h5 class="font-semibold text-lg">{{ translate('dashboard.trade') }}</h5>
      <p>{{ translate('dashboard.trade_description') }}</p>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { inject, onBeforeMount, reactive, toRefs } from 'vue'

export default {
  name: 'CurrencyActionsInfoModal',
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
      closeable: true
    })

    // Methods
    const closeModal = () => {
      state.show = false
    }

    onBeforeMount(() => {
      emitter.on('currencyActionsInfoModal', () => {
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
