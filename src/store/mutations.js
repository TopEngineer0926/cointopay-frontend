import {
  SAVE_ACCOUNT_INFO,
  SET_ADDRESS_BOOK,
  SET_ALL_ALT_COINS,
  SET_ALT_COINS,
  SET_APP_VERSION,
  SET_BALANCES,
  SET_CONVERTER,
  SET_COUNTRIES,
  SET_COUPONS,
  SET_CURRENT_ROUTE,
  SET_INPUT_CURRENCIES,
  SET_INVOICE,
  SET_LANGUAGES,
  SET_LOCALE,
  SET_LOGGED_IN, SET_LOGIN_TYPE,
  SET_MODE,
  SET_NOTIFICATIONS,
  SET_POS,
  SET_POS_CALLS,
  SET_PRODUCTS_FILTERS,
  SET_REFRESH_DATA,
  SET_SHIPPING_METHOD_ACTION,
  SET_SHIPPING_METHODS,
  SET_SHOP_CATEGORIES,
  SET_SHOP_DATA,
  SET_SHOP_ID,
  SET_SHOPS_LIST,
  SET_TRANSFER_WISE_CONFIG,
  SET_TRANSLATIONS,
  SET_USER,
  SET_WEB_LOGGED_IN_EMPLOYEE,
  UNSET_LOGGED_IN,
  UPDATE_CART
} from './keys'

export default {
  [SET_MODE] (state, payload) {
    state.mode = payload
  },
  [SET_APP_VERSION] (state, payload) {
    state.appVersion = payload
  },
  [SET_LANGUAGES] (state, payload) {
    state.languages = payload
  },
  [SET_TRANSLATIONS] (state, payload) {
    state.translations = payload
  },
  [SET_LOCALE] (state, payload) {
    state.locale = payload
  },
  [SET_LOGGED_IN] (state) {
    state.isLoggedIn = true
  },
  [UNSET_LOGGED_IN] (state) {
    state.isLoggedIn = false
  },
  [SET_LOGIN_TYPE] (state, payload) {
    state.isSocialLogin = payload
  },
  [SET_USER] (state, payload) {
    state.user = payload
  },
  [SAVE_ACCOUNT_INFO] (state, payload) {
    state.accountInfo = payload
  },
  [SET_NOTIFICATIONS] (state, payload) {
    state.notifications = payload
  },
  [SET_CURRENT_ROUTE] (state, payload) {
    state.currentRoute = payload
  },
  [SET_INPUT_CURRENCIES] (state, payload) {
    state.inputCurrencies = payload
  },
  [SET_BALANCES] (state, payload) {
    state.balances = payload
  },
  [SET_ALL_ALT_COINS] (state, payload) {
    state.allAltCoins = payload
  },
  [SET_ALT_COINS] (state, payload) {
    state.altCoins = payload
  },
  [SET_CONVERTER] (state, payload) {
    state.converter = payload
  },
  [SET_TRANSFER_WISE_CONFIG] (state, payload) {
    state.transferWiseConfig = payload
  },
  [SET_COUNTRIES] (state, payload) {
    state.countries = payload
  },
  [SET_ADDRESS_BOOK] (state, payload) {
    state.addressBook = payload
  },
  [SET_REFRESH_DATA] (state, payload) {
    state.refreshData = payload
  },
  [SET_POS] (state, payload) {
    state.pos = payload
  },
  [SET_POS_CALLS] (state, payload) {
    state.posCalls = payload
  },
  [SET_SHOP_DATA] (state, payload) {
    state.shopData = payload
  },
  [SET_COUPONS] (state, payload) {
    state.coupons = payload
  },
  [SET_SHIPPING_METHODS] (state, payload) {
    state.shippingMethods = payload
  },
  [SET_SHIPPING_METHOD_ACTION] (state, payload) {
    state.shippingMethodAction = payload
  },
  [SET_SHOP_CATEGORIES] (state, payload) {
    state.shopCategories = payload
  },
  [SET_SHOPS_LIST] (state, payload) {
    state.shopsList = payload
  },
  [SET_SHOP_ID] (state, payload) {
    state.shopId = payload
  },
  [SET_PRODUCTS_FILTERS] (state, payload) {
    state.productsFilters = payload
  },
  [UPDATE_CART] (state, payload) {
    state.cart = payload
  },
  [SET_INVOICE] (state, payload) {
    state.invoice = payload
  },
  [SET_WEB_LOGGED_IN_EMPLOYEE] (state, payload) {
    state.webLoggedInEmployee = payload
  }
}
