<template>
  <centered-layout>
    <div v-html="text"></div>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import { inject, onBeforeMount, ref } from 'vue'

export default {
  name: 'Terms',
  components: {
    CenteredLayout
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')

    const text = ref(null)

    onBeforeMount(() => {
      const apiBaseUrl = process.env.VUE_APP_API_URL
      http.get(`${apiBaseUrl}/V2Processor?Terms=&locale=EN`).then(response => {
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
