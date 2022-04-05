<template>
  <centered-layout>
    <div v-html="text"></div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import { inject, onBeforeMount, ref } from 'vue'

export default {
  name: 'Payments',
  components: {
    CenteredLayout
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')

    const text = ref('')

    onBeforeMount(() => {
      const apiBaseUrl = process.env.VUE_APP_API_URL
      http.get(`${apiBaseUrl}/V2Processor?Payments=&locale=EN`).then(response => {
        if (response.data.status_code === 200) {
          response.data.data.forEach(row => {
            text.value += row
          })
        }
      }).catch(error => {
        console.log(error)
      })
    })

    return {
      translate,
      text
    }
  }
}
</script>

<style scoped lang="scss">
:deep(a) {
  @apply text-blue-500 hover:underline;
}
</style>
