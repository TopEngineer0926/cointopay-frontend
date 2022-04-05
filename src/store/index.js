import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default createStore({
  state: {
    mode: 'light',
    appVersion: '2.0.0',
    isLoggedIn: false,
    isSocialLogin: false,
    locale: 'EN',
    languages: {},
    translations: {},
    countries: {},
    currentRoute: '',
    user: null,
    accountInfo: null,
    notifications: [],
    inputCurrencies: [],
    balances: [],
    altCoins: [],
    allAltCoins: [],
    converter: {
      source: 1,
      sourceAltCoinId: 1,
      target: 0,
      targetAltCoinId: 625
    },
    transferWiseConfig: [],
    addressBook: {
      crypto: {},
      transferwise: {}
    },
    refreshData: {
      webShopOverview: null,
      marketChat: null
    },
    pos: {
      categories: [],
      products: [],
      favourites: [],
      tickets: [],
      receipts: [],
      receiptItems: [],
      users: []
    },
    posCalls: {
      categories: '',
      products: '',
      tickets: '',
      receipts: '',
      receiptItems: '',
      users: ''
    },
    webLoggedInEmployee: null,
    shopsList: [],
    shopCategories: [],
    shopId: '',
    shopData: {
      categories: [],
      products: []
    },
    coupons: [],
    shippingMethods: [],
    shippingMethodAction: 'INSERT',
    productsFilters: {
      currentPage: 1,
      keyword: '',
      category: ''
    },
    cart: {
      items: [],
      merchantId: null
    },
    invoice: null
  },
  plugins: [vuexLocal.plugin],
  getters,
  mutations,
  actions,
  modules: {}
})
