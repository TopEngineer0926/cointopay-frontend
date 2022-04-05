<template>
  <div class="card">
    <h5 class="title">{{ translate('account.menu.referrals') }}</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <p>{{ referralDescription }}</p>
    </div>
  </div>
</template>

<script>
import { computed, inject } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Referrals',
  setup () {
    // Providers
    const translate = inject('translate')
    // Store
    const store = useStore()

    // Computed
    const referralDescription = computed(() => {
      const description = store.state.translations.account.referrals.description
      const user = store.state.user
      return description.replace('[MerchantID]', user.ID)
    })

    return {
      translate,
      referralDescription
    }
  }
}
</script>

<style scoped></style>
