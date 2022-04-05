<template>
  <div class="bg-gray-700 p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="grid grid-cols-5">
        <div class="col-span-5 md:col-span-1 mb-4 md:mb-0">
          <img alt="Cointopay" src="@/assets/logo-light.svg"/>
        </div>
        <div class="col-span-5 md:col-span-1 text-white mb-4 md:mb-0">
          <h2 class="uppercase text-lg font-bold">{{ translate('misc.company') }}</h2>
          <ul class="list-disc list-inside">
            <li>
              <router-link class="hover:text-gray-300" tag="a" :to="{name: 'about'}">About us</router-link>
            </li>
            <li>
              <router-link class="hover:text-gray-300" tag="a" :to="{name: 'terms'}">Terms and Privacy</router-link>
            </li>
            <li>
              <a class="hover:text-gray-300" href="https://docs.cointopay.com" target="_blank">API docs</a>
            </li>
          </ul>
        </div>
        <div class="col-span-5 md:col-span-1 text-white mb-4 md:mb-0">
          <h2 class="uppercase text-lg font-bold">{{ translate('misc.services') }}</h2>
          <ul class="list-disc list-inside">
            <li>
              <router-link class="hover:text-gray-300" tag="a" :to="{name: 'payments'}">Payments</router-link>
            </li>
            <li>
              <a class="hover:text-gray-300" href="https://exchange.cointopay.com/" target="_blank">Trading</a>
            </li>
            <li>
              <router-link class="hover:text-gray-300" tag="a" :to="{name: 'newsletter'}">Newsletter</router-link>
            </li>
          </ul>
        </div>
        <div class="col-span-5 md:col-span-1 text-white mb-4 md:mb-0">
          <h2 class="uppercase text-lg font-bold">{{ translate('misc.social') }}</h2>
          <ul class="social">
            <li v-for="(network, index) in networks" :key="index">
              <a :class="nameToClass(network.name)"
                 :href="network.url"
                 class="m-1 w-12 h-12 border-2 border-white rounded flex items-center justify-center" target="_blank">
                <img :src="require(`@/assets/images/networks/${network.icon}.svg`)"
                     alt="" class="w20"/>
              </a>
            </li>
          </ul>
        </div>
        <div class="col-span-5 md:col-span-1 text-white mb-4 md:mb-0">
          <h2 class="uppercase text-lg font-bold">Apps</h2>
          <ul class="stores">
            <li>
              <a class="app relative"
                 href="https://play.google.com/store/apps/details?id=com.cointopay.app" target="_blank">
                <div class="absolute w-48 h-48 rounded p-2 shadow-xl bg-gray-50 z-10 bottom-1 left-0">
                  <QRCodeVue3
                    :width="qrOptions.width"
                    :height="qrOptions.height"
                    :qr-options="qrOptions.qrOptions"
                    :background-options="qrOptions.backgroundOptions"
                    :dots-options="qrOptions.dotsOptions"
                    :corners-dot-options="qrOptions.cornersDotOptions"
                    :corners-square-options="qrOptions.cornersSquareOptions"
                    value="https://play.google.com/store/apps/details?id=com.cointopay.app"></QRCodeVue3>
                </div>
                <img alt="Play store" src="@/assets/images/play_store.png"/>
              </a>
            </li>
            <li>
              <a class="app relative"
                 href="https://itunes.apple.com/us/app/ctp-wallet/id1450194783?ls=1&mt=8" target="_blank">
                <div class="absolute w-48 h-48 rounded p-2 shadow-xl bg-gray-50 z-10 bottom-1 left-0">
                  <QRCodeVue3
                    :width="qrOptions.width"
                    :height="qrOptions.height"
                    :qr-options="qrOptions.qrOptions"
                    :background-options="qrOptions.backgroundOptions"
                    :dots-options="qrOptions.dotsOptions"
                    :corners-dot-options="qrOptions.cornersDotOptions"
                    :corners-square-options="qrOptions.cornersSquareOptions"
                    value="https://itunes.apple.com/us/app/ctp-wallet/id1450194783?ls=1&mt=8"></QRCodeVue3>
                </div>
                <img alt="App store" src="@/assets/images/app_store.svg"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-gray-900 p-2 text-white">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="grid grid-cols-3">
        <div class="col-span-3 lg:col-span-1 flex items-center mb-3 md:mb-0">
          <!-- Language dropdown -->
          <lang-dropdown></lang-dropdown>
        </div>
        <div class="col-span-3 lg:col-span-1 text-left md:text-center mb-3 md:mb-0">
          <!-- TrustBox widget - Micro Review Count -->
          <div class="trustpilot-widget" data-locale="en-US" data-template-id="5419b6a8b0d04a076446a9ad"
               data-businessunit-id="5cd2fcc977f0fd0001a792c0" data-style-height="24px" data-style-width="100%"
               data-theme="dark">
            <a href="https://www.trustpilot.com/review/cointopay.com" target="_blank" rel="noopener">Trustpilot</a>
          </div>
          <!-- End TrustBox widget -->
        </div>
        <div class="col-span-3 lg:col-span-1 text-left md:text-right">
          &copy;{{ year }} Surplus17, Inc. All Rights Reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCodeVue3 from 'qrcode-vue3'
import { inject } from 'vue'
import qrCodeOptions from '@/qrOptions'
import LangDropdown from '@/components/navbar/LangDropdown'

export default {
  name: 'Footer',
  components: {
    QRCodeVue3,
    LangDropdown
  },
  setup () {
    const { qrOptions } = qrCodeOptions()
    const networks = [
      {
        name: 'twitter',
        url: 'https://twitter.com/Cointopay',
        icon: 'twitter'
      },
      {
        name: 'linkedin',
        url: 'https://www.linkedin.com/in/cointopay-international-42baa495/',
        icon: 'linkedin'
      },
      {
        name: 'facebook',
        url: 'https://www.facebook.com/CointopayInternational/',
        icon: 'facebook'
      },
      {
        name: 'pinterest',
        url: 'http://www.pinterest.com/ccryptop/pins/',
        icon: 'pinterest'
      },
      {
        name: 'reddit',
        url: 'https://www.reddit.com/r/Cointopay/',
        icon: 'reddit'
      },
      {
        name: 'youtube',
        url: 'https://www.youtube.com/channel/UC4zUepZUeuuS3tAoUXx93Kw/videos',
        icon: 'youtube'
      },
      {
        name: 'github',
        url: 'https://github.com/Cointopay',
        icon: 'github'
      },
      {
        name: 'rss',
        url: 'https://cointopay.com/RSS.jsp',
        icon: 'rss'
      }
    ]
    const year = new Date().getFullYear()
    // Providers
    const translate = inject('translate')

    // Methods
    const nameToClass = (value) => {
      return value.trim().toLowerCase().replace(/ /g, '-')
    }

    return {
      translate,
      qrOptions,
      networks,
      year,
      nameToClass
    }
  }
}
</script>

<style lang="scss" scoped>
ul.social {
  list-style-type: none;
  padding: 0;
  max-width: 260px;

  li {
    display: inline-block;

    a {
      &.twitter:hover {
        background: #099bcc;
        border-color: #099bcc;
      }

      &.linkedin:hover {
        background: #2e8cc2;
        border-color: #2e8cc2;
      }

      &.facebook:hover {
        background: #4672b3;
        border-color: #4672b3;
      }

      &.pinterest:hover {
        background: #c32524;
        border-color: #c32524;
      }

      &.reddit:hover {
        background: #ff4500;
        border-color: #ff4500;
      }

      &.youtube:hover {
        background: #cb322c;
        border-color: #cb322c;
      }

      &.github:hover {
        background: #333637;
        border-color: #333637;
      }

      &.rss:hover {
        background: #e97633;
        border-color: #e97633;
      }

      img {
        width: 24px;
      }
    }
  }
}

ul.stores {
  padding: 0;
  list-style-type: none;

  li {
    margin-bottom: 16px;
    display: block;
    cursor: pointer;

    a {
      position: relative;

      div {
        display: none;
        transition: all 0.3s ease-in-out;
      }

      &:hover {
        div {
          display: block;
        }
      }
    }

    img {
      width: 200px;

      @media (min-width: 768px) and (max-width: 960px) {
        width: 160px;
      }
    }
  }
}
</style>
