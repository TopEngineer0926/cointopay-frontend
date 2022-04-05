<template>
  <centered-layout>
    <h1 class="font-bold text-xl mb-3">{{ translate('about.title') }}</h1>
    <div v-html="text"></div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import { inject, onBeforeMount, ref } from 'vue'

export default {
  name: 'AboutUs',
  components: {
    CenteredLayout
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')

    const text = ref(null)

    onBeforeMount(() => {
      const apiBaseUrl = process.env.VUE_APP_API_URL
      http.get(`${apiBaseUrl}/V2Processor?About=&locale=EN`).then(response => {
        const data = response.data.data
        text.value = data.join('')
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
:deep(h3) {
  @apply font-semibold text-lg;
}
</style>
