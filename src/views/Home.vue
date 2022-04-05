<template>
  <div class="jumbotron text-white h-96" style="margin-top:60px;">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto text-center py-10 lg:py-20">
      <div class="w-72 md:w-4/5 lg:w-full mx-auto">
        <h1 class="font-bold text-3xl md:text-5xl mb-3 lg:mb-4">{{ translate('home.slogan') }}</h1>
        <p class="text-xl md:text-2xl">{{ translate('home.sub_slogan') }}</p>
      </div>
    </div>
  </div>
  <div class="bg-white dark:bg-gray-900 pb-4 px-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto pt-32 relative">
      <div class="bg-white dark:bg-gray-800 shadow rounded p-4 mb-4 -mt-64" v-if="news.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h1 class="font-bold text-2xl">News</h1>
          <div class="text-center" v-if="news.length > 0">
            <a class="btn btn-default btn-sm mr-2" @click="prev()">
              <icon name="chevron-left"></icon>
            </a>
            <a class="btn btn-default btn-sm" @click="next()">
              <icon name="chevron-right"></icon>
            </a>
          </div>
        </div>
        <h3 class="font-semibold mb-3">{{ news[currentNewsIndex].Title }}</h3>
        <div class="flex items-start flex-col md:flex-row">
          <div class="overflow-hidden w-full mb-3">
            <iframe width="100%" scrolling="no" id="newsFrame"></iframe>
          </div>
          <div v-if="news[currentNewsIndex].Picture || news[currentNewsIndex].Youtube.trim()"
               class="w-full md:w-1/5 ml-0 md:ml-4">
            <template v-if="news[currentNewsIndex].Picture">
              <img class="w-full object-cover cursor-pointer mb-3" :src="news[currentNewsIndex].Picture" alt=""
                   @click="fancyBox(news[currentNewsIndex].Picture)"/>
            </template>
            <template v-if="news[currentNewsIndex].Youtube.trim()">
              <img class="w-full object-cover cursor-pointer"
                   :src="getYoutubePlaceholder(news[currentNewsIndex].Youtube)"
                   alt="" @click="fancyBox(parseYoutubeLink(news[currentNewsIndex].Youtube))">
            </template>
          </div>
        </div>
        <p class="my-4">Created On: {{ formatDT(news[currentNewsIndex].CreatedOn) }}</p>
        <div class="text-center" v-if="news.length > 0">
          <a class="btn btn-default btn-sm mr-2" @click="prev()">
            <icon name="chevron-left"></icon>
          </a>
          <a class="btn btn-default btn-sm" @click="next()">
            <icon name="chevron-right"></icon>
          </a>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded p-4 mb-4">
        <h1 class="font-bold text-2xl mb-4">{{ translate('home.plugins.slogan') }}</h1>
        <div class="px-4 mb-4">
          <carousel :items-to-show="1" :autoplay="3000" :wrap-around="false" pause-autoplay-on-hover>
            <slide v-for="(slide, i) in slides" :key="i">
              <div class="text-center">
                <a target="_blank" class="h-48 flex items-center justify-center" :href="slide.link">
                  <img class="mx-auto max-h-48 max-w-full" :src="slide.image" alt=""/>
                </a>
                <a target="_blank" :href="slide.link"
                   class="font-medium mt-4 text-blue-500 hover:underline">{{ slide.description }}</a>
              </div>
            </slide>

            <template #addons>
              <navigation/>
            </template>
          </carousel>
        </div>
        <div class="text-center">
          <router-link tag="a" to="/payments" class="btn btn-primary">
            <span>{{ translate('home.plugins.learn_more') }}</span>
            <icon name="chevron-right" classes="w-4 h-4 ml-4"></icon>
          </router-link>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded p-4 mb-4">
        <h1 class="font-bold text-2xl mb-4">{{ translate('home.services.slogan') }}</h1>
        <ul class="services">
          <li :key="index" v-for="(service, index) in services" v-html="service"></li>
        </ul>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded">
        <tab-set>
          <tab name="Wallet & Trading app">
            <h1 class="font-bold text-2xl mb-4">{{ translate('home.apps.wallet.title') }}</h1>
            <p class="font-medium mb-3">{{ translate('home.apps.wallet.description') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2 md:col-span-1">
                <a class="btn btn-primary w-full" target="_blank"
                   href="https://play.google.com/store/apps/details?id=com.cointopay.app">
                  <img alt="" class="w-6 h-6" src="../assets/images/android.svg">
                  <span class="ml-4">Wallet for Android</span>
                </a>
              </div>
              <div class="col-span-2 md:col-span-1">
                <a class="btn btn-primary w-full" target="_blank"
                   href="https://itunes.apple.com/us/app/ctp-wallet/id1450194783?mt=8">
                  <img alt="" class="w-6 h-6" src="../assets/images/apple.svg">
                  <span class="ml-4">Wallet for iOS</span>
                </a>
              </div>
            </div>
          </tab>
          <tab name="POS app">
            <h1 class="font-bold text-2xl mb-4">{{ translate('home.apps.pos.title') }}</h1>
            <p class="font-medium mb-3">{{ translate('home.apps.pos.description') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2 md:col-span-1">
                <a class="btn btn-primary w-full" target="_blank"
                   href="https://play.google.com/store/apps/details?id=com.cointopay.pos">
                  <img alt="" class="w-6 h-6" src="../assets/images/android.svg">
                  <span class="ml-4">Wallet for Android</span>
                </a>
              </div>
              <div class="col-span-2 md:col-span-1">
                <a class="btn btn-primary w-full" target="_blank"
                   href="https://itunes.apple.com/us/app/c-pos/id1459100341?ls=1&mt=8">
                  <img alt="" class="w-6 h-6" src="../assets/images/apple.svg">
                  <span class="ml-4">Wallet for iOS</span>
                </a>
              </div>
            </div>
          </tab>
        </tab-set>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded  p-4 mt-4 text-center" v-if="!isLoggedIn">
        <router-link tag="a" :to="{name: 'signup'}" class="btn btn-success">
          {{ translate('home.signup') }}
        </router-link>
      </div>
    </div>
  </div>

<!-- Notifications Modal -->
  <message-modal></message-modal>
</template>

<script>
import Icon from '@/components/Icon'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import MessageModal from '@/components/home/modals/MessageModal'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import { useRoute } from 'vue-router'

export default {
  name: 'Home',
  components: {
    MessageModal,
    Icon,
    Carousel,
    Slide,
    Navigation,
    TabSet,
    Tab
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')

    // Store
    const store = useStore()
    const route = useRoute()

    const {
      formatDT,
      fancyBox
    } = compositionUtils()

    // State
    const state = reactive({
      news: [],
      currentNewsIndex: 0
    })

    // Computed
    const theme = computed(() => store.state.mode)
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const slides = computed(() => {
      return Object.keys(store.state.translations).length > 0 ? store.state.translations.home.plugins.sliders : []
    })
    const services = computed(() => {
      return Object.keys(store.state.translations).length > 0 ? store.state.translations.home.services.text : []
    })

    // Watch
    watch(() => state.currentNewsIndex,
      (newVal, oldVal) => {
        const news = state.news[newVal]
        if (news) {
          const iframe = document.getElementById('newsFrame')
          iframe.height = ''
          iframe.contentWindow.document.body.innerHTML = `<div style="${theme.value === 'dark' ? 'color:white' : ''}">${news.Post}</div>`
          setTimeout(() => {
            iframe.height = iframe.contentWindow.document.body.scrollHeight + 'px'
          }, 10)
        }
      })
    watch(() => theme.value,
      (newVal, oldVal) => {
        const news = state.news[state.currentNewsIndex]
        if (news) {
          const iframe = document.getElementById('newsFrame')
          iframe.contentWindow.document.body.innerHTML = `<div style="${newVal === 'dark' ? 'color:white' : ''}">${news.Post}</div>`
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchNews = () => {
      http.get(`${apiBaseUrl}/V2Processor`, {
        params: {
          News: '',
          locale: 'EN'
        }
      }).then(response => {
        if (response.status === 200) {
          state.news = response.data.data.filter(news => news.frontpage === '1')
          state.news = _.orderBy(state.news, ['CreatedOn'], ['desc'])
          if (state.news.length > 0) {
            state.currentNewsIndex = 0
            setTimeout(() => {
              const iframe = document.getElementById('newsFrame')
              iframe.contentWindow.document.body.innerHTML = `<div style="${theme.value === 'dark' ? 'color:white' : ''}">${state.news[0].Post}</div>`
              iframe.height = iframe.contentWindow.document.body.scrollHeight + 'px'
              iframe.contentDocument.body.style.fontFamily = 'Arial'
              iframe.contentDocument.body.style.margin = 0
            }, 50)
          }
        }
      }).catch(error => {
        console.log(error.response)
      })
    }
    const next = () => {
      if (state.currentNewsIndex < state.news.length - 1) {
        state.currentNewsIndex++
      }
    }
    const prev = () => {
      if (state.currentNewsIndex > 0) {
        state.currentNewsIndex--
      }
    }
    const getYoutubePlaceholder = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/default.jpg`
      }
      return ''
    }
    const parseYoutubeLink = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return `https://youtube.com/embed/${match[2]}`
      }
      return ''
    }

    onBeforeMount(() => {
      if (Object.keys(route.params).length > 0 && Object.keys(route.params).indexOf('message') !== -1) {
        const message = route.params.message
        setTimeout(function () {
          emitter.emit('messageModal', {
            message: message
          })
        }, 300)
      }
      fetchNews()
    })

    return {
      translate,
      ...toRefs(state),
      isLoggedIn,
      formatDT,
      next,
      prev,
      slides,
      services,
      fancyBox,
      parseYoutubeLink,
      getYoutubePlaceholder
    }
  }
}
</script>

<style scoped lang="scss">
.jumbotron {
  background-image: url("~@/assets/images/banner.jpg");
  background-size: 100% 100%;
}

:deep(.carousel__prev),
:deep(.carousel__next) {
  @apply bg-blue-500;
}

ul {
  &.services {
    list-style: none;

    li:before {
      content: '\2713';
      color: green;
      font-size: 18px;
      margin-right: 8px;
    }

    li {
      :deep(a) {
        @apply text-blue-500 hover:underline;
      }
    }
  }
}
</style>
