<template>
  <div class="text-right mb-3">
    <j-button @click="launchSaveCouponModal()">{{ translate('pos.coupons.btn_add') }}</j-button>
  </div>
  <div
    class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
    <table class="table-sm">
      <thead>
      <tr>
        <th class="whitespace-nowrap">{{ translate('pos.coupons.headings.coupon_code') }}</th>
        <th>{{ translate('pos.coupons.headings.discount') }}</th>
        <th class="w-32">{{ translate('pos.coupons.headings.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="index" v-for="(coupon, index) in coupons">
        <td>{{ formatCode(coupon.KeyData) }}</td>
        <td>{{ `${coupon.ValueData}%` }}</td>
        <td>
          <button @click="launchSaveCouponModal(coupon)" class="hover:text-blue-500 mr-2">
            <icon name="edit"></icon>
          </button>
          <button @click="deleteCoupon(coupon)" class="hover:text-red-500" type="button">
            <icon name="trash"></icon>
          </button>
        </td>
      </tr>
      <tr v-if="coupons.length === 0">
        <td colspan="3">{{ translate('pos.coupons.no_data') }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <!-- Save Coupon Modal -->
  <save-coupon-modal></save-coupon-modal>
</template>

<script>
import { computed, inject, onBeforeMount } from 'vue'
import SaveCouponModal from '@/components/account/pos/modals/office/SaveCouponModal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import { FETCH_COUPONS } from '@/store/keys'

export default {
  name: 'Coupons',
  components: {
    Icon,
    JButton,
    SaveCouponModal
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const swal = inject('swal')
    const toast = inject('toast')
    const emitter = inject('emitter')

    // Store
    const store = useStore()

    // Computed
    const user = computed(() => store.state.user)
    const coupons = computed(() => store.state.coupons)

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const formatCode = (code) => {
      return code.split('coupon')[1]
    }
    const deleteCoupon = (coupon) => {
      swal.fire({
        title: 'Coupon',
        text: 'Are you sure, want to delete this coupon?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        focusCancel: true,
        customClass: {
          container: 'swal2-tailwind'
        }
      }).then(({ value }) => {
        if (value && value === true) {
          // Delete coupon
          http.get(`${apiBaseUrl}/MarketAPI`, {
            params: {
              POSDATA: '',
              Call: 'DELETE',
              KeyData: coupon.KeyData,
              MerchantID: user.value.ID,
              APIKey: user.value.APIKey,
              output: 'json'
            }
          }).then(response => {
            if (response.status === 200) {
              toast.success('Coupon deleted successfully')
              store.dispatch(FETCH_COUPONS, {
                MerchantID: user.value.ID,
                APIKey: user.value.APIKey
              })
            }
          }).catch(errors => {
            console.log(errors)
          })
        }
      })
    }
    const launchSaveCouponModal = (coupon = null) => {
      emitter.emit('saveCouponModal', {
        coupon: coupon
      })
    }

    onBeforeMount(() => {
      store.dispatch(FETCH_COUPONS, {
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey
      })
    })

    return {
      translate,
      coupons,
      formatCode,
      deleteCoupon,
      launchSaveCouponModal
    }
  }
}
</script>

<style scoped lang="scss">
.table-sm {
  thead {
    tr {
      th:first-child {
        @apply pl-3;
      }
    }
  }

  tbody {
    tr {
      td:first-child {
        @apply pl-3;
      }
    }
  }
}
</style>
