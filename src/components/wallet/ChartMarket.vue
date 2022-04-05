<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <h5 class="title">{{ selectedBalance.longname }}&nbsp;{{ translate('dashboard.chart_market_title') }}</h5>
      <span class="text-gray-700 dark:text-gray-400 mr-4"
            @click="isExpanded = !isExpanded">
        <icon v-if="!isExpanded" name="expand" classes="w-5 h-5"></icon>
        <icon v-if="isExpanded" name="collapse" classes="w-5 h-5"></icon>
      </span>
    </div>
    <hr v-if="isExpanded" class="border-gray-300 dark:border-gray-600"/>
    <div class="body" v-if="isExpanded">
      <template v-if="chartMarketOptions && !isProcessing && !isRefreshing">
        <vue-highcharts :options="chartMarketOptions"></vue-highcharts>
      </template>
      <template v-if="isProcessing || isRefreshing">
        <pulse-skeleton></pulse-skeleton>
        <pulse-skeleton></pulse-skeleton>
      </template>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
import VueHighcharts from 'vue3-highcharts'
import { useStore } from 'vuex'
import PulseSkeleton from '../PulseSkeleton'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import * as _ from 'lodash'

export default {
  name: 'ChartMarket',
  props: ['selectedBalance', 'isRefreshing'],
  components: {
    Icon,
    PulseSkeleton,
    VueHighcharts
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    // Store
    const store = useStore()

    const state = reactive({
      chartMarketOptions: null,
      marketChartData: [],
      isProcessing: false,
      isExpanded: true
    })

    // Computed
    const mode = computed(() => store.state.mode)
    const accountInfo = computed(() => store.state.accountInfo)
    const refreshData = computed(() => store.state.refreshData)

    // Watch
    watch(() => _.cloneDeep(props.selectedBalance),
      (newVal, oldVal) => {
        if (newVal) {
          fetchMarketChartData()
        }
      })
    watch(() => mode.value,
      (newMode, oldMode) => {
        updateMarketChart(state.marketChartData)
      })
    watch(() => refreshData.value,
      (newVal, oldVal) => {
        if (newVal.marketChat !== null && newVal.marketChat !== oldVal.marketChat && !props.isRefreshing) {
          fetchMarketChartData()
        }
      })
    // Methods
    const fetchMarketChartData = () => {
      if (props.selectedBalance) {
        state.isProcessing = true
        const symbol = accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
        const url = `https://app.cointopay.com/CointoJsonChart?file=${props.selectedBalance.shortname}${symbol}.json`
        http.get(url).then(response => {
          state.isProcessing = false
          const data = []
          const currency = props.selectedBalance.longname + '/' + symbol
          data.push({
            type: 'spline',
            name: currency,
            data: response.data,
            shadow: true,
            tooltip: {
              valueDecimals: 8
            }
          })
          state.marketChartData = data
          updateMarketChart(state.marketChartData)
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }
    const getColor = (type) => {
      switch (type) {
        case 'legend':
          return mode.value === 'light' ? '#000000' : '#FFFFFF'
        case 'title':
          return mode.value === 'light' ? '#666666' : '#FFFFFF'
        case 'line':
          return mode.value === 'light' ? '#666666' : '#333358'
      }
    }
    const updateMarketChart = (data) => {
      state.chartMarketOptions = {
        type: 'spline',
        title: {
          text: '1 ' + props.selectedBalance.longname,
          style: {
            color: getColor('title')
          }
        },
        chart: {
          zoomType: 'xy',
          backgroundColor: 'transparent'
        },
        credits: {
          enabled: false
        },
        xAxis: {
          type: 'datetime',
          title: {
            text: ''
          },
          labels: {
            style: {
              color: getColor('title')
            }
          }
        },
        yAxis: {
          gridLineColor: getColor('line'),
          title: {
            text: 'Currency Amount',
            style: {
              color: getColor('title')
            }
          },
          labels: {
            style: {
              color: getColor('title')
            }
          }
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false
            }
          }
        },
        legend: {
          itemStyle: {
            color: getColor('legend')
          }
        },
        series: data,
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }
          ]
        }
      }
    }

    onBeforeMount(() => {
      fetchMarketChartData()
    })

    return {
      translate,
      ...toRefs(state)
    }
  }
}
</script>

<style scoped>
.vue-highcharts {
  width: 100%;
}
</style>
