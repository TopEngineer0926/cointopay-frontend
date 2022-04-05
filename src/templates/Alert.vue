<template>
  <div v-show="message" class="w-full mb-3 flex items-center justify-between p-3 rounded" :class="classes">
    <p class="flex-1">{{ message }}</p>
    <span class="ml-4 cursor-pointer" @click="clearMessage()">
      <icon classes="w-5 h-5" name="close"></icon>
    </span>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
import { computed } from 'vue'

export default {
  name: 'Alert',
  props: {
    message: {
      type: String,
      default: ''
    },
    alertType: {
      type: String,
      default: 'info'
    }
  },
  emits: ['clear'],
  components: {
    Icon
  },
  setup (props, { emit }) {
    const classes = computed(() => {
      let classes = 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-900'
      switch (props.alertType) {
        case 'danger':
          classes = 'bg-red-100 text-red-900'
          break
        case 'success':
          classes = 'bg-green-700 dark:bg-green-400 text-green-900'
          break
        case 'warning':
          classes = 'bg-orange-700 dark:bg-orange-400 text-orange-900'
          break
      }
      return classes
    })
    const clearMessage = () => {
      emit('clear')
    }
    return {
      clearMessage,
      classes
    }
  }
}
</script>

<style scoped>

</style>
