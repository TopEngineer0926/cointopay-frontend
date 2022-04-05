<template>
  <template v-if="isGecko && !isProcessing && !isRefreshing && geckoCoin.data">
    <!-- Gecko Coin Info -->
    <div class="card">
      <div class="flex items-center justify-between">
        <h5 class="title">Coin info {{ selectedBalance.longname }}</h5>
        <span class="text-gray-700 dark:text-gray-400 mr-4"
              @click="isExpanded = !isExpanded">
          <icon v-if="!isExpanded" name="expand" classes="w-5 h-5"></icon>
          <icon v-if="isExpanded" name="collapse" classes="w-5 h-5"></icon>
        </span>
      </div>
      <hr v-if="isExpanded" class="border-gray-300 dark:border-gray-600"/>
      <div class="body" v-if="isExpanded">
        <p class="mb-3">{{ geckoCoin.data.description }}</p>
        <div
          class="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
          <table class="table-sm break-all">
            <tbody>
            <tr>
              <td style="width: 140px;">Rank</td>
              <td>#{{ geckoCoin.data.rank }}</td>
            </tr>
            <tr>
              <td>New</td>
              <td>{{ geckoCoin.data.is_new }}</td>
            </tr>
            <tr>
              <td>Active</td>
              <td>{{ geckoCoin.data.is_active }}</td>
            </tr>
            <tr>
              <td>Started at</td>
              <td>{{ geckoCoin.data.first_data_at }}</td>
            </tr>
            <tr>
              <td>Last updated</td>
              <td>{{ geckoCoin.data.last_data_at }}</td>
            </tr>
            <tr>
              <td>Website</td>
              <td>
                <div class="flex flex-wrap">
                  <label class="bg-gray-300 dark:bg-gray-700 rounded px-2 py-1 mr-2">
                    <a :href="geckoCoin.data.links.website[0]" target="_blank">
                      {{ formatUrlToName(geckoCoin.data.links.website[0]) }}
                    </a>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td>Explorers</td>
              <td>
                <div class="flex flex-wrap">
                  <label v-for="(url, index) in geckoCoin.data.links.explorer" :key="index"
                         class="mb-2 xl:mb-0 bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mr-2">
                    <a :href="url" target="_blank">{{ formatUrlToName(url) }}</a>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td>Community</td>
              <td>
                <div class="flex flex-wrap">
                  <label v-for="(item, index) in communityLinks()" :key="index"
                         class="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mr-2">
                    <a :href="item.url" target="_blank">{{ item.name }}</a>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td>Source Code</td>
              <td>
                <div class="flex flex-wrap">
                  <label v-for="(url, index) in geckoCoin.data.links.source_code" :key="index"
                         class="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mr-2">
                    <a :href="url" target="_blank">{{ formatUrlToSource(url) }}</a>
                  </label>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Tweets -->
    <div class="card" v-if="paginatedTweets.length > 0">
      <div class="flex items-center justify-between">
        <h5 class="title">Tweets {{ selectedBalance.longname }}</h5>
        <span class="text-gray-700 dark:text-gray-400 mr-4"
              @click="isExpandedTweets = !isExpandedTweets">
          <icon v-if="!isExpandedTweets" name="expand" classes="w-5 h-5"></icon>
          <icon v-if="isExpandedTweets" name="collapse" classes="w-5 h-5"></icon>
        </span>
      </div>
      <hr v-if="isExpandedTweets" class="border-gray-300 dark:border-gray-600"/>
      <div class="body" v-if="isExpandedTweets">
        <template v-for="(tweet, index) in paginatedTweets" :key="index">
          <div class="tweet flex-none" :class="[paginatedTweets.length > index+1 ? 'mb-4' : 'pb-2']">
            <div class="flex items-center mb-2">
              <div class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="tweet.user_image_link" alt="" class="w-12 h-12"/>
              </div>
              <a class="ml-3" :href="'https://twitter.com/' + tweet.user_name" target="_blank">
                @{{ tweet.user_name }}</a>
            </div>
            <div class="text-lg" v-html="urlify(tweet.status)"></div>
            <p class="text-lg py-2">
              {{ twitterDate(tweet.date) }}
            </p>
            <div class="border-t border-b border-gray-300 dark:border-gray-600 py-2 text-sm tweet-footer">
              <a :href="tweet.status_link + '/retweets'" class="mr-4" target="_blank">
                <span class="font-bold">{{ tweet.retweet_count }}</span>
                Retweets
              </a>
              <a :href="tweet.status_link + '/likes'" target="_blank">
                <span class="font-bold">{{ tweet.like_count }}</span>
                Likes
              </a>
            </div>
          </div>
        </template>
        <template v-if="paginatedTweets.length">
          <pagination :meta="meta" @page="updatePage"></pagination>
        </template>
      </div>
    </div>
  </template>
  <template v-if="isProcessing || isRefreshing">
    <div class="card">
      <div class="body">
        <pulse-skeleton></pulse-skeleton>
        <pulse-skeleton></pulse-skeleton>
      </div>
    </div>
  </template>
</template>

<script>
import Icon from '@/components/Icon'
import PulseSkeleton from '@/components/PulseSkeleton'
import Pagination from '@/components/common/Pagination'
import { computed, onBeforeMount, reactive, toRefs, watch } from 'vue'
import * as moment from 'moment'
import * as _ from 'lodash'
import axios from 'axios'

export default {
  name: 'Gecko',
  components: {
    Icon,
    PulseSkeleton,
    Pagination
  },
  props: ['geckoCoinsList', 'selectedBalance', 'isRefreshing'],
  setup (props) {
    const state = reactive({
      isExpanded: true,
      isExpandedTweets: true,
      isProcessing: true,
      isGecko: false,
      geckoCoin: {},
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 5,
        offset: 0
      }
    })

    // Computed
    const paginatedTweets = computed(() => {
      if (state.geckoCoin.twitter.length > 0) {
        return state.geckoCoin.twitter.slice(
          state.meta.offset,
          state.meta.currentPage * state.meta.limit
        )
      }
      return state.geckoCoin.twitter
    })

    // Watch
    watch(() => ({ ...props.selectedBalance }),
      (newValue, oldValue) => {
        if (newValue) {
          const coin = _.find(props.geckoCoinsList, {
            symbol: newValue.longname.toLowerCase()
          })
          const id = coin ? coin.id : newValue.id
          fetchGeckoCoinInfo(id)
        }
      })

    // Methods
    const formatUrlToName = (url) => {
      return url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
    }
    const formatUrlToSource = (url) => {
      if (_.includes(url, 'github.com')) {
        return 'Github'
      } else if (_.includes(url, 'bitbucket.com')) {
        return 'Bitbucket'
      } else if (_.includes(url, 'gitlab.com')) {
        return 'Gitlab'
      }
      return url
    }
    const communityLinks = () => {
      const twitter = _.find(state.geckoCoin.data.links_extended, {
        type: 'twitter'
      })
      const links = []
      if (typeof state.geckoCoin.data.links.facebook !== 'undefined') {
        links.push({
          name: 'facebook',
          url: state.geckoCoin.data.links.facebook[0]
        })
      }
      if (typeof state.geckoCoin.data.links.youtube !== 'undefined') {
        links.push({
          name: 'Youtube',
          url: state.geckoCoin.data.links.youtube[0]
        })
      }
      if (typeof state.geckoCoin.data.links.reddit !== 'undefined') {
        links.push({
          name: 'Reddit',
          url: state.geckoCoin.data.links.reddit[0]
        })
      }
      if (twitter) {
        links.push({
          name: 'Twitter',
          url: twitter.url
        })
      }
      return links
    }
    const urlify = (text) => {
      const tagRegex = /#([a-zA-Z0-9]+)/g
      const userRegex = /@([a-zA-Z0-9]+)/g
      const urlRegex = /(https?:\/\/[^\s]+)/g
      return text.replace(urlRegex, (url) => {
        return `<a target="_blank" href="${url}">${url}</a>`
      }).replace(tagRegex, (tag) => {
        tag = tag.replace('#', '')
        return `<a target="_blank" class="hashtag" href="https://twitter.com/#search?q=${tag}">${tag}</a>`
      }).replace(userRegex, (username) => {
        username = username.replace('@', '')
        return `<a target="_blank" href="https://twitter.com/${username}">${username}</a>`
      })
    }
    const twitterDate = (date) => {
      return moment(new Date(date)).format('H:m A . MMM D, YYYY')
    }
    // Fetch Gecko coin info
    const fetchGeckoCoinInfo = (id) => {
      // Reset
      state.meta = {
        currentPage: 1,
        totalPages: 0,
        limit: 5,
        offset: 0
      }
      state.isProcessing = true
      state.isGecko = true
      if (!isNaN(id)) {
        const url = 'https://cointopay.com/V2Processor?PaprikaCoinInfo&AltCoinID=' + id
        axios.get(url).then(response => {
          state.isProcessing = false
          state.geckoCoin.data = response.data.data[0]
          state.geckoCoin.twitter = []
        }).catch(error => {
          state.isProcessing = false
          state.geckoCoin = {}
          state.isGecko = false
          console.log(error)
        })
      } else {
        const url = 'https://api.coinpaprika.com/v1/coins/' + id
        Promise.all([axios.get(`${url}`), axios.get(`${url}/twitter`)]).then(response => {
          state.isProcessing = false
          state.geckoCoin.data = response[0].data
          const tweets = response[1].data
          // replace http links with https
          state.geckoCoin.twitter = tweets.map(t => {
            return {
              ...t,
              user_image_link: t.user_image_link.replace('http://', 'https://')
            }
          })
          state.meta.totalPages = Math.ceil(state.geckoCoin.twitter.length / state.meta.limit)
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }
    // Update page
    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }

    onBeforeMount(() => {
      const coin = _.find(props.geckoCoinsList, {
        symbol: props.selectedBalance.longname.toLowerCase()
      })
      const id = coin ? coin.id : props.selectedBalance.id
      fetchGeckoCoinInfo(id)
    })

    return {
      ...toRefs(state),
      formatUrlToName,
      formatUrlToSource,
      communityLinks,
      urlify,
      twitterDate,
      paginatedTweets,
      updatePage
    }
  }
}
</script>

<style scoped lang="scss">
.table-sm {
  tbody {
    tr {
      td:first-child {
        @apply pl-3 font-semibold;
      }
    }
  }
}

a {
  @apply hover:underline;
}

.tweet {
  :deep(a) {
    @apply text-blue-500 hover:underline;
  }

  .tweet-footer {
    a {
      @apply text-gray-700 dark:text-gray-400 hover:text-blue-500 hover:underline;
    }
  }
}
</style>
