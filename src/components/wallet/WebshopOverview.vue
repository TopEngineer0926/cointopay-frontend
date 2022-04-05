<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <h5 class="title">{{ translate('dashboard.webshop') }}</h5>
        <router-link v-if="isOverview" class="text-gray-700 dark:text-gray-400" tag="a" to="/webshop-overview">
          <icon name="search"></icon>
        </router-link>
      </div>
      <span v-if="isRevenueChart && chartRevenueOptions" class="text-gray-700 dark:text-gray-400 mr-4"
            @click="isExpanded = !isExpanded">
        <icon v-if="!isExpanded" name="expand" classes="w-5 h-5"></icon>
        <icon v-if="isExpanded" name="collapse" classes="w-5 h-5"></icon>
      </span>
    </div>
    <hr v-if="isExpanded || isRefreshing" class="border-gray-300 dark:border-gray-600"/>
    <div class="body" v-if="isExpanded || isRefreshing">
      <template v-if="isRevenueChart && chartRevenueOptions && !isProcessing && !isRefreshing">
        <vue-highcharts :options="chartRevenueOptions" type="chart"></vue-highcharts>
      </template>
      <template v-if="isProcessing || isRefreshing">
        <div class="h-72 pt-4 max-w-full text-center overflow-hidden">
          <graph-skeleton></graph-skeleton>
          <graph-skeleton></graph-skeleton>
          <graph-skeleton></graph-skeleton>
          <graph-skeleton></graph-skeleton>
          <graph-skeleton></graph-skeleton>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import GraphSkeleton from '@/components/GraphSkeleton'
import VueHighcharts from 'vue3-highcharts'
import { useStore } from 'vuex'
import Icon from '@/components/Icon'
import moment from 'moment'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'

export default {
  name: 'WebshopOverview',
  props: ['isOverview', 'altCoinID', 'isRefreshing'],
  components: {
    GraphSkeleton,
    Icon,
    VueHighcharts
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')

    // Store
    const store = useStore()

    const state = reactive({
      isRevenueChart: false,
      revenueChartData: [],
      isExpanded: true,
      xAxisData: [],
      chartRevenueOptions: null,
      isProcessing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const mode = computed(() => store.state.mode)
    const refreshData = computed(() => store.state.refreshData)

    // Watch
    watch(() => props.altCoinID,
      (newID, oldID) => {
        if (newID !== oldID) {
          fetchRevenueChartData()
        }
      })
    watch(() => mode.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          updateRevenueChart(state.revenueChartData)
        }
      })

    watch(() => refreshData.value,
      (newVal, oldVal) => {
        if (newVal.webShopOverview !== null && newVal.webShopOverview !== oldVal.webShopOverview) {
          fetchRevenueChartData()
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchRevenueChartData = () => {
      state.isProcessing = true
      const inputCurrency = accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'TransactionChart',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          inputCurrency: inputCurrency,
          AltCoinID: props.altCoinID,
          output: 'json'
        }
      }).then(response => {
        state.isProcessing = false
        // Charts
        if (response.data.result === 'success') {
          state.revenueChartData = response.data.data
          updateRevenueChart(state.revenueChartData)
        } else {
          state.isRevenueChart = false
          state.isExpanded = false
        }
      }).catch(() => {
        state.isProcessing = false
      })
    }
    const updateRevenueChart = (data) => {
      state.xAxisData = []
      const categories = []
      const transactionsData = []
      const revenueData = []
      const transactionLabels = []
      data.forEach(record => {
        categories.push(moment(new Date(record[2])).format('DD MMM'))
        state.xAxisData.push(moment(new Date(record[2])).format('YYYY-MM-DD'))
        transactionsData.push(record[0])
        revenueData.push(record[3])
        transactionLabels.push(record[4])
      })
      state.isRevenueChart = data.length > 0
      state.isExpanded = state.isRevenueChart
      state.chartRevenueOptions = {
        chart: {
          backgroundColor: 'transparent'
        },
        title: {
          text: ''
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: true,
          align: 'left',
          verticalAlign: 'top',
          x: -10,
          y: -10,
          itemStyle: {
            color: getColor('legend')
          }
        },
        tooltip: {
          shared: true,
          formatter: function () {
            let tooltip = ''
            if (typeof this.points !== 'undefined') {
              tooltip = this.points[0].x
              this.points.forEach((point, index) => {
                tooltip += '<br/><span style="color: ' + point.color + '">' +
                  point.series.name + ': <b>' + point.y
                if (index === 1) {
                  tooltip += ' ' + transactionLabels[point.point.index]
                }
                tooltip += '</b></span>'
              })
            }
            return tooltip
          }
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false
            },
            cursor: 'pointer',
            point: {
              events: {
                click: function (e) {
                  state.keyword = state.xAxisData[e.point.index]
                }
              }
            }
          }
        },
        xAxis: {
          categories: categories,
          gridLineWidth: 0,
          title: {
            text: ''
          },
          minorTickLength: 0,
          tickLength: 0
        },
        yAxis: [
          {
            // Primary yAxis
            gridLineWidth: 0,
            labels: {
              format: '{value}',
              style: {
                color: '#89B92E'
              }
            },
            title: {
              text: 'Revenue',
              style: {
                color: '#89B92E'
              }
            },
            opposite: true
          },
          {
            // Secondary yAxis
            gridLineWidth: 0,
            title: {
              text: 'Transactions',
              style: {
                color: '#446BB3'
              }
            },
            labels: {
              format: '{value}',
              style: {
                color: '#446BB3'
              }
            }
          }
        ],
        colors: ['#446BB3', '#89B92E'],
        series: [
          {
            type: 'column',
            yAxis: 1,
            name: 'Transactions per day',
            data: transactionsData
          },
          {
            type: 'spline',
            yAxis: 0,
            name: 'Revenue per day',
            data: revenueData
          }
        ]
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

    onBeforeMount(() => {
      fetchRevenueChartData()
    })

    return {
      translate,
      ...toRefs(state)
    }
  }
}
</script>

<style scoped></style>
