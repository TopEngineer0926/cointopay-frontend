<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('home.alert') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <p>{{ message }}</p>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import { inject, onBeforeMount, reactive, toRefs } from 'vue'

export default {
  name: 'MessageModal',
  components: {
    Modal,
    Icon
  },
  setup () {
    const translate = inject('translate')
    const emitter = inject('emitter')
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      message: ''
    })

    const closeModal = () => {
      state.show = false
    }

    onBeforeMount(() => {
      emitter.on('messageModal', (args) => {
        state.message = args.message

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
