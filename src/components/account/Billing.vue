<template>
  <div class="card">
    <h5 class="title">Fees paid by</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex">
        <label class="mr-4 flex items-center">
          <input :checked="isChecked(1)" @click="payFee(1)" name="fee" type="radio" value="1">
          <span class="ml-2">Merchant</span>
        </label>
        <label class="mr-4 flex items-center">
          <input :checked="isChecked(2)" @click="payFee(2)" name="fee" type="radio" value="2">
          <span class="ml-2">Customer</span>
        </label>
        <label class="flex items-center">
          <input :checked="isChecked(3)" @click="payFee(3)" name="fee" type="radio" value="3">
          <span class="ml-2">Shared</span>
        </label>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="body">
      <p>A fee of 1.0102 percent is added to each incoming transaction.</p>
      <div class="flex items-center">
        <p>Lifetime member status:</p>
        <div v-html="getStatus"></div>
      </div>
      <div class="mt-2">
        <router-link tag="a" to="/webshop-overview">
          {{ translate('account.billing.overview_confirmed_transactions') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, inject, onBeforeMount, ref } from 'vue'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'Billing',
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    // Store
    const store = useStore()

    const { saveNotification } = compositionUtils()

    const status = ref(0)

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const getStatus = computed(() => {
      const statusClass = (status.value === -1) ? 'bg-red-700 dark:bg-red-500' : 'bg-green-500'
      const label = (status.value === -1) ? 'false' : 'true'
      return `<label class="ml-3 text-white text-sm px-2 py-1 rounded ${statusClass}">${label}</label>`
    })

    // Methods
    const isChecked = (val) => {
      return Number(accountInfo.value.FeesPaidBy) === val
    }
    const payFee = (type) => {
      const apiBaseUrl = process.env.VUE_APP_API_URL
      const payload = {
        Call: 'FeesPaid',
        Type: type,
        MerchantID: accountInfo.value.ID,
        APIKey: accountInfo.value.APIkey,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        if (response.data.status_code === 200) {
          toast.success(response.data.message)
          saveNotification(response.data.message)
        }
      }).catch(error => {
        toast.error(error.data.message)
        saveNotification(error.data.message)
      })
    }

    onBeforeMount(() => {
      if (accountInfo.value) {
        status.value = Number(accountInfo.value.LifetimeMember)
      }
    })

    return {
      translate,
      isChecked,
      payFee,
      getStatus
    }
  }
}
</script>

<style scoped lang="scss">
a {
  @apply text-blue-500 hover:underline;
}
</style>
