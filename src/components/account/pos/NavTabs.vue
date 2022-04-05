<template>
  <ul class="tab-set flex flex-wrap bg-blue-700 text-gray-100 -mb-px rounded-t">
    <li v-for="(nav, i) in navs" :key="i" class="flex-1">
      <router-link
        :class="`tab w-full ${active === nav.route ? 'active bg-blue-500' : ''}`"
        :to="{ name: nav.route}" tag="a">
        <span :class="`${active === nav.route  ? 'bg-blue-500' : ''}`">
          {{ translate(nav.name) }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script>
import { inject, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'NavTabs',
  setup () {
    const translate = inject('translate')
    const route = useRoute()

    const active = ref(null)
    const navs = ref([
      {
        name: 'pos.products.tabs.categories',
        route: 'account-pos-categories'
      },
      {
        name: 'pos.products.tabs.products',
        route: 'account-pos-products'
      },
      {
        name: 'pos.products.tabs.favourites',
        route: 'account-pos-favourites'
      }
    ])

    onBeforeMount(() => {
      active.value = route.name
    })

    return {
      translate,
      navs,
      active
    }
  }
}
</script>

<style lang="scss" scoped></style>
