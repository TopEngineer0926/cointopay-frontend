<template>
  <div class="p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto" style="min-height: calc(100vh - 351px);">
      <div v-if="locale">
        <div class="w-full rounded shadow px-4 py-3 bg-green-100 mb-4 text-green-900 font-semibold">
          {{ translate('invoice.confirmed_message') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, inject, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { FETCH_TRANSLATIONS, SET_LOCALE } from '@/store/keys'

export default {
  name: 'Confirmed',
  setup () {
    const translate = inject('translate')

    const store = useStore()
    const route = useRoute()

    const locale = computed(() => store.state.locale)

    onBeforeMount(() => {
      if (Object.keys(route.query).length > 0) {
        const locale = route.query.Locale || route.query.locale
        store.commit(SET_LOCALE, locale.toUpperCase())
      } else {
        store.commit(SET_LOCALE, 'EN')
      }
      setTimeout(() => {
        store.dispatch(FETCH_TRANSLATIONS)
      }, 200)
    })

    return {
      translate,
      locale
    }
  }
}
</script>

<style scoped>

</style>
