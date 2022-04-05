<template>
  <tab-set>
    <tab :name="translate('dashboard.report_incoming')">
      <div class="flex items-center">
        <j-button type="button" @click="downloadCSV(1)">
          <img alt="" class="w-5 h-5" src="@/assets/images/icon_file_csv.svg"/>&nbsp;Download .CSV
        </j-button>
        <router-link class="ml-3" tag="a" to="/webshop-overview">
          <icon classes="w-5 h-5 dark:text-gray-400" name="search"></icon>
        </router-link>
      </div>
    </tab>
    <tab :name="translate('dashboard.report_outgoing')">
      <div class="flex items-center">
        <j-button type="button" @click="downloadCSV(2)">
          <img alt="" class="w-5 h-5" src="@/assets/images/icon_file_csv.svg"/>&nbsp;Download .CSV
        </j-button>
        <router-link class="ml-3" tag="a" to="/webshop-overview">
          <icon classes="w-5 h-5 dark:text-gray-400" name="search"></icon>
        </router-link>
      </div>
    </tab>
  </tab-set>
</template>

<script>
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import { computed, inject } from 'vue'

export default {
  name: 'DownloadLinks',
  props: ['selectedBalance'],
  components: {
    TabSet,
    Tab,
    Icon,
    JButton
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')

    // Store
    const store = useStore()

    // Computed
    const user = computed(() => store.state.user)

    // Methods
    const createFileName = (altCoinID, type) => {
      const name = altCoinID === -1 ? 'ALL' : 'AltCoin' + altCoinID
      return `CSVExport-${name}-CSV-Type${type}.csv`
    }
    const downloadCSV = (exportType) => {
      const apiBaseUrl = process.env.VUE_APP_API_URL
      const altCoinID = props.selectedBalance ? props.selectedBalance.id : -1
      const payload = {
        Call: 'Export',
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        type: exportType,
        AltCoinID: altCoinID,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        const csv = response.data
        // Download the file as CSV
        const downloadLink = document.createElement('a')
        const blob = new Blob(['\ufeff', csv])
        downloadLink.href = URL.createObjectURL(blob)
        downloadLink.download = createFileName(altCoinID, exportType) // Name the file here
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }).catch(error => {
        console.log(error)
      })
    }

    return {
      translate,
      downloadCSV
    }
  }
}
</script>

<style scoped>

</style>
