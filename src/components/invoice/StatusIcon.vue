<template>
  <icon v-if="status === 'waiting'" name="spinner" classes="w-6 h-6 mr-3 text-blue-500"></icon>
  <icon v-if="status === 'paid'" name="check-circle" classes="w-8 h-8 mr-3 text-green-500"></icon>
  <icon v-if="status === 'underpaid'" name="check-circle" classes="w-8 h-8 mr-3 text-yellow-500"></icon>
  <icon v-if="status === 'expired'" name="x-circle" classes="w-8 h-8 mr-3 text-red-500"></icon>
</template>

<script>
import Icon from '@/components/Icon'
import { computed } from 'vue'

export default {
  name: 'StatusIcon',
  props: ['invoice'],
  components: {
    Icon
  },
  setup (props) {
    const status = computed(() => props.invoice && props.invoice.Status.toLowerCase())

    return {
      status
    }
  }
}
</script>

<style scoped>

</style>
