<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <h5 class="title">{{ translate('dashboard.transactions_per_coin') }}</h5>
      <span class="text-gray-700 dark:text-gray-400 mr-4"
            @click="isExpanded = !isExpanded">
        <icon v-if="!isExpanded" name="expand" classes="w-5 h-5"></icon>
        <icon v-if="isExpanded" name="collapse" classes="w-5 h-5"></icon>
      </span>
    </div>
    <hr v-if="isExpanded" class="border-gray-300 dark:border-gray-600"/>
    <div class="body" v-if="isExpanded">
      <template v-if="chartTransactionsPerCoinOptions">
        <vue-highcharts :options="chartTransactionsPerCoinOptions"></vue-highcharts>
      </template>
    </div>
  </div>
</template>

<script>
import VueHighcharts from 'vue3-highcharts'
import Icon from '@/components/Icon'
import * as _ from 'lodash'
import { useStore } from 'vuex'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'

export default {
  name: 'ChartTransactions',
  components: {
    Icon,
    VueHighcharts
  },
  setup () {
    const translate = inject('translate')
    // Store
    const store = useStore()

    const state = reactive({
      chartTransactionsPerCoinOptions: null,
      isExpanded: true
    })

    // Computed
    const theme = computed(() => store.state.mode)
    const balances = computed(() => store.state.balances)

    // Watch
    watch(() => ({ ...balances.value }),
      (newVal, oldVal) => {
        if (newVal) {
          updateChart(newVal)
        }
      })
    watch(() => ({ ...theme.value }),
      (newMode, oldMode) => {
        if (newMode !== oldMode) {
          updateChart(balances.value)
        }
      })

    // Methods
    const getColor = (type) => {
      switch (type) {
        case 'legend':
          return theme.value === 'light' ? '#000000' : '#FFFFFF'
        case 'title':
          return theme.value === 'light' ? '#666666' : '#FFFFFF'
      }
    }
    const updateChart = (balances) => {
      const overview = _.find(balances, { id: 0 })
      const data = []
      balances = _.orderBy(balances, [(balance) => {
        return Number(balance.transaction_total)
      }], ['desc'])
      balances.forEach((balance, index) => {
        if (balance.id !== 0) {
          if (index < 5) {
            data.push([balance.name, Number(balance.transaction_total)])
          } else {
            const othersIndex = _.findIndex(data, (obj) => {
              return obj[0] === 'Others'
            })
            if (othersIndex === -1) {
              data.push(['Others', Number(balance.transaction_total)])
            } else {
              data[othersIndex][1] += Number(balance.transaction_total)
            }
          }
        }
      })
      if (overview) {
        state.chartTransactionsPerCoinOptions = {
          chart: {
            backgroundColor: 'transparent',
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
          },
          title: {
            text: overview.transaction_total + '<br/>' + translate('dashboard.transactions'),
            align: 'center',
            verticalAlign: 'middle',
            y: -40,
            style: {
              color: getColor('title')
            }
          },
          tooltip: {
            enabled: true
          },
          credits: {
            enabled: false
          },
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: false
              },
              showInLegend: true,
              size: '100%'
            }
          },
          legend: {
            align: 'center',
            layout: 'horizontal',
            itemStyle: {
              color: getColor('legend')
            }
          },
          series: [{
            type: 'pie',
            name: 'Total transactions',
            innerSize: '50%',
            data: data
          }]
        }
      }
    }

    onBeforeMount(() => {
      if (balances.value.length > 0) {
        updateChart(balances.value)
      }
    })

    return {
      translate,
      ...toRefs(state)
    }
  }
}
</script>

<style scoped></style>
