<template>
  <modal :closeable="closeable" :max-width="maxWidth" :show="show" @close="close">
    <div v-if="header" class="p-4">
      <div class="text-lg font-semibold">
        <slot name="title"></slot>
      </div>
    </div>
    <hr v-if="header" class="border-gray-300 dark:border-gray-600"/>
    <div class="p-4">
      <slot name="content"></slot>
    </div>
  </modal>
</template>

<script>
import Modal from '@/templates/Modal'

export default {
  emits: ['close'],
  components: {
    Modal
  },
  props: {
    show: {
      default: false
    },
    maxWidth: {
      default: '2xl'
    },
    closeable: {
      default: true
    },
    header: {
      default: true
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
