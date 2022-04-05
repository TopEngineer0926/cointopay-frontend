export default {
  mode: (state) => state.mode,
  appVersion: (state) => state.appVersion,
  languages: (state) => {
    const languages = state.languages
    Object.keys(languages).filter(key => {
      if (key === 'NL') {
        delete languages[key]
      }
    })
    return languages
  },
  locale: (state) => state.locale,
  translations: (state) => state.translations,
  currentRoute: (state) => state.currentRoute,
  isLoggedIn: (state) => state.isLoggedIn,
  user: (state) => state.user,
  accountInfo: (state) => state.accountInfo,
  notifications: (state) => state.notifications,
  inputCurrencies: (state) => state.inputCurrencies,
  balances: (state) => state.balances,
  altCoins: (state) => state.altCoins,
  converter: (state) => state.converter,
  countries: (state) => state.countries,
  transferWiseConfig: (state) => state.transferWiseConfig,
  addressBook: (state) => state.addressBook,
  refreshData: (state) => state.refreshData,
  pos: (state) => state.pos,
  posCalls: (state) => state.posCalls,
  webLoggedInEmployee: (state) => state.webLoggedInEmployee
}
