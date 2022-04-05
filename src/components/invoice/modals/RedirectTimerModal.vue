<template>
  <modal :maxWidth="maxWidth" :header="false" :show="show" @close="closeModal()">
    <template #content>
      <div class="text-center">
        <img class="w-32 mx-auto" src="@/assets/images/success.png" alt=""/>
        <p class="text-2xl font-semibold text-green-700 dark:text-green-500 text-center mb-3">Redirecting in {{ counter }}</p>
        <a :href="invoice.RedirectTargetURL" class="text-blue-500 hover:underline inline-flex items-center">
          <span class="mr-2">Click here to Redirect</span>
          <icon name="arrow-right" classes="w-5 h-5"></icon>
        </a>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { inject, onBeforeMount, reactive, toRefs } from 'vue'

export default {
  name: 'RedirectTimerModal',
  components: {
    Modal,
    Icon
  },
  setup () {
    // Providers
    const emitter = inject('emitter')

    const state = reactive({
      show: false,
      maxWidth: 'sm',
      closeable: true,
      invoice: null,
      interval: null,
      timer: null,
      counter: 0
    })

    const closeModal = () => {
      state.show = false
      if (state.interval) {
        clearInterval(state.interval)
      }
      state.interval = null
    }

    onBeforeMount(() => {
      emitter.on('redirectTimerModal', (args) => {
        state.invoice = args.invoice
        state.counter = 20
        state.interval = setInterval(() => {
          state.counter--
          if (state.counter === 0) {
            clearInterval(state.interval)
            window.location.href = state.invoice.RedirectTargetURL
          }
        }, 1000)
        state.show = true
      })
    })

    return {
      ...toRefs(state),
      closeModal
    }
  }
}
</script>

<style scoped>

</style>
