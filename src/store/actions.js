import {
  FETCH_ACCOUNT_INFO,
  FETCH_ADDRESS_BOOK,
  FETCH_ALT_COINS,
  FETCH_COUNTRIES,
  FETCH_COUPONS,
  FETCH_INPUT_CURRENCIES,
  FETCH_LANGUAGES,
  FETCH_POS_DATA, FETCH_RATINGS,
  FETCH_SHIPPING_METHODS,
  FETCH_SHOP_DATA,
  FETCH_SHOPS_LIST,
  FETCH_TRANSFER_WISE_CONFIG,
  FETCH_TRANSLATIONS,
  LOGOUT,
  PERSIST_AUTH,
  REMOVE_ACCOUNT,
  SAVE_ACCOUNT_INFO,
  SAVE_CATEGORIES,
  SAVE_EMPLOYEES,
  SAVE_PRODUCTS,
  SAVE_RECEIPT_ITEMS,
  SAVE_RECEIPTS,
  SAVE_SHIPPING_METHODS,
  SAVE_TICKETS,
  SET_ADDRESS_BOOK,
  SET_ALL_ALT_COINS,
  SET_ALT_COINS,
  SET_COUNTRIES,
  SET_COUPONS,
  SET_INPUT_CURRENCIES,
  SET_LANGUAGES,
  SET_LOCALE,
  SET_LOGGED_IN,
  SET_POS,
  SET_POS_CALLS,
  SET_SHIPPING_METHOD_ACTION,
  SET_SHIPPING_METHODS,
  SET_SHOP_CATEGORIES,
  SET_SHOP_DATA,
  SET_SHOPS_LIST,
  SET_TRANSFER_WISE_CONFIG,
  SET_TRANSLATIONS,
  SET_USER,
  SET_WEB_LOGGED_IN_EMPLOYEE,
  UNSET_LOGGED_IN,
  UPDATE_ACCOUNT_INFO
} from './keys'
import instance from '../libs/axios'
import * as _ from 'lodash'
import moment from 'moment'

const apiBaseUrl = process.env.VUE_APP_API_URL

export default {
  [FETCH_LANGUAGES] ({
    commit,
    dispatch
  }) {
    instance.get(`${apiBaseUrl}/V2Processor?List`).then(response => {
      const languages = response.data
      delete languages.Languages
      commit(SET_LANGUAGES, languages)
      // Get locale data
      dispatch(FETCH_TRANSLATIONS)
    }).catch(response => {
    })
  },
  [FETCH_TRANSLATIONS] ({
    getters,
    commit
  }, locale = null) {
    const baseUrl = window.location.protocol + '//' + window.location.host
    const appVersion = getters.appVersion
    if (locale === null) {
      locale = getters.locale.toLowerCase()
    }
    const localeFile = `${baseUrl}/${appVersion}/locale/locale_${locale}.json`
    instance.get(`${localeFile}`).then(response => {
      commit(SET_TRANSLATIONS, response.data)
    }).catch(response => {
    })
  },
  [PERSIST_AUTH] ({ commit }, user) {
    return new Promise((resolve, reject) => {
      commit(SET_LOGGED_IN)
      commit(SET_USER, user)
      resolve()
    })
  },
  [FETCH_ACCOUNT_INFO] ({
    commit,
    getters,
    dispatch
  }) {
    return new Promise((resolve, reject) => {
      const user = getters.user
      const params = {
        Call: 'Accountdetail',
        MerchantID: user.ID,
        APIKey: user.APIKey,
        output: 'json'
      }
      instance.get(`${apiBaseUrl}/v2REAPI`, {
        params: params,
        withCredentials: true
      }).then(response => {
        resolve(response.data)
        if (response.data.status_code === 200) {
          commit(SAVE_ACCOUNT_INFO, response.data.data)
          if (Object.keys(response.data.data).length > 0) {
            // Update locale
            commit(SET_LOCALE, response.data.data.Locale)
            dispatch(FETCH_TRANSLATIONS)
          }
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  [FETCH_INPUT_CURRENCIES] ({ commit }) {
    return new Promise((resolve, reject) => {
      instance.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'inputCurrencyList',
          MerchantID: 0,
          APIKey: '_',
          output: 'json'
        }
      }).then(response => {
        if (response.status === 200) {
          const inputCurrencies = _.orderBy(response.data, [coin => coin.Name.toLowerCase()], 'asc')
          commit(SET_INPUT_CURRENCIES, inputCurrencies)
          resolve(inputCurrencies)
        }
      }).catch(error => {
        reject(error.response)
      })
    })
  },
  [FETCH_ALT_COINS] ({ commit }) {
    instance.get(`${apiBaseUrl}/v2REAPI`, {
      params: {
        Call: 'COIN-LIST',
        MerchantID: 0,
        APIKey: '_',
        output: 'json'
      }
    }).then(response => {
      commit(SET_ALL_ALT_COINS, response.data)
      const data = response.data.filter(record => {
        return [3, 4, 6, 7].indexOf(record.ID) === -1
      })
      commit(SET_ALT_COINS, data)
    }).catch(response => {
    })
  },
  [FETCH_TRANSFER_WISE_CONFIG] ({
    commit,
    getters
  }) {
    const baseUrl = window.location.protocol + '//' + window.location.host
    const appVersion = getters.appVersion
    const configFile = baseUrl + '/' + appVersion + '/config.json'
    instance.get(`${configFile}`).then(response => {
      commit(SET_TRANSFER_WISE_CONFIG, response.data)
    }).catch(response => {
    })
  },
  [FETCH_COUNTRIES] ({ commit }) {
    const baseUrl = window.location.protocol + '//' + window.location.host
    const countriesFile = baseUrl + '/countries.json'
    instance.get(`${countriesFile}`).then(response => {
      commit(SET_COUNTRIES, response.data)
    }).catch(response => {
    })
  },
  [FETCH_ADDRESS_BOOK] ({
    commit,
    getters
  }) {
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const user = getters.user
    const payload = {
      POSDATA: '',
      Call: 'SHOW',
      KeyData: `AddressBook_${user.ID}`,
      MerchantID: user.ID,
      APIKey: user.APIKey,
      output: 'json'
    }
    instance.get(`${apiBaseUrl}/MarketAPI`, {
      params: payload
    }).then(response => {
      if (response.data !== 'nothing found') {
        commit(SET_ADDRESS_BOOK, response.data)
      }
    }).catch(error => {
      console.log(error)
    })
  },
  [UPDATE_ACCOUNT_INFO] ({
    commit,
    getters,
    dispatch
  }, payload) {
    let formattedObj = {
      ID: payload.ID,
      shoptitle: payload.ShopTitle,
      ownernickname: payload.OwnerNickName,
      email: payload.Email,
      apikey: payload.APIkey,
      locale: payload.Locale,
      autonomy: payload.Autonomy,
      chargingmethod: payload.ChargingMethod,
      transactionconfirmurl: payload.TransactionConfirmURL,
      transactionfailurl: payload.TransactionFailURL,
      ECWIDID: payload.ECWID,
      ShopifyAPIKey: payload.ShopifyAPIKey,
      ShopifyPassword: payload.ShopifyPassword,
      ShopifyURL: payload.ShopifyURL,
      PreferredCoinID: payload.PreferredCoinID,
      SWAPPreferredCoinID: payload.SWAPPreferredCoinID === true ? 1 : 0,
      SelectedAltcoins: payload.SelectedAltCoins,
      AltCoinFiatPayOutExcludes: payload.AltCoinFiatPayOutExcludes,
      FlexibilityPercentage: payload.FlexibilityPercentage,
      payoutschema: payload.PayoutSchema,
      payoutto: payload.PayoutTo,
      PayoutIBAN: payload.PayoutIBAN,
      PayoutBIC: payload.PayoutBIC,
      BusinessAccount: payload.BusinessAccount,
      PayoutBankName: payload.PayoutBankName,
      PayoutBankLegalEntityIdentifier: payload.PayoutBankLegalEntityIdentifier,
      PayoutBankAddress: payload.PayoutBankAddress,
      PayoutBankCity: payload.PayoutBankCity,
      PayoutBankState: payload.PayoutBankState,
      PayoutBankCountry: payload.PayoutBankCountry,
      PayoutBankPostalCode: payload.PayoutBankPostalCode,
      PayoutFirstName: payload.PayoutFirstName,
      PayoutLastName: payload.PayoutLastName,
      PayoutFullName: payload.PayoutFullName,
      PayoutBirthDate: moment(new Date(payload.PayoutBirthDate)).format(
        'YYYY/MM/DD'
      ),
      PEP: payload.PEP,
      PayoutName: payload.PayoutName,
      PayoutAddress: payload.PayoutAddress,
      PayoutPostalCode: payload.PayoutPostalCode,
      PayoutCity: payload.PayoutCity,
      PayoutState: payload.PayoutState,
      PayoutCountry: payload.PayoutCountry,
      Emailnotifications: Number(payload.Emailnotifications),
      PayoutCurrencyShortName: payload.PayoutCurrencyShortName,
      PayPalEnable: payload.PayPalEnable,
      PayPalEmail: payload.PayPalEmail,
      '2FAEnabled': payload['2FAEnabled'],
      TFA: payload['2FA'],
      SocialOn: payload.SocialOn,
      SocialURL: payload.SocialURL,
      SocialFacebook: payload.SocialFacebook,
      SocialTwitter: payload.SocialTwitter,
      SocialLinkedIn: payload.SocialLinkedIn,
      SocialReddit: payload.SocialReddit,
      face: payload.Avatar,
      ProfileEdit: true,
      Locale: payload.Locale,
      PayoutIdentityType: payload.PayoutIdentityType,
      PayoutIdentityCardNr: payload.PayoutIdentityCardNr,
      PayoutIdentityCountry: payload.PayoutIdentityCountry,
      V2: '',
      output: 'json'
    }
    if (typeof payload.Password !== 'undefined' && payload.Password !== '') {
      formattedObj = Object.assign(formattedObj, {
        ownerpassword: payload.Password
      })
    }
    const encodeForm = data => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&')
    }
    return new Promise((resolve, reject) => {
      instance.post(`${apiBaseUrl}/Register`, encodeForm(formattedObj), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      }).then(response => {
        if (response.status === 200) {
          commit(SAVE_ACCOUNT_INFO, response.data.data)
          if (Object.keys(response.data.data).length > 0) {
            // Update locale
            commit(SET_LOCALE, response.data.data.Locale)
            dispatch(FETCH_TRANSLATIONS)
          }
          // Update user API Key
          const user = {
            ...getters.user,
            APIKey: response.data.data.APIkey
          }
          commit(SET_USER, user)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  [REMOVE_ACCOUNT] (payload) {
    return new Promise((resolve, reject) => {
      instance.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload,
        withCredentials: true
      }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  [SAVE_EMPLOYEES] ({
    getters,
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload.data)
      // Clear password for master user
      let pin = ''
      const index = _.findIndex(data, { isParentUser: 'true' })
      if (index !== -1) {
        pin = data[index].PIN
        data[index].PIN = ''
      }
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_users`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        // Updated
        const pos = getters.pos
        pos.users = payload.data
        // Set parent user password
        const index = _.findIndex(pos.users, { isParentUser: 'true' })
        if (index !== -1) {
          pos.users[index].PIN = pin
        }
        commit(SET_POS, pos)
        // Update pos call
        const posCall = {
          ...getters.posCalls,
          users: 'UPDATE'
        }
        commit(SET_POS_CALLS, posCall)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [FETCH_POS_DATA] ({
    getters,
    commit,
    dispatch
  }, payload) {
    const extractData = (data, index) => {
      return (data[index].data && data[index].data !== 'nothing found') ? data[index].data : []
    }
    return new Promise((resolve, reject) => {
      const user = getters.user
      if (Object.keys(user).length > 0) {
        const pos = _.cloneDeep(getters.pos)
        const url = apiBaseUrl + '/MarketAPI'
        const categoriesKey = `${user.ID}_categories`
        const productsKey = `${user.ID}_products`
        const receiptsKey = `${user.ID}_receipts`
        const receiptItemsKey = `${user.ID}_receiptItems`
        const usersKey = `${user.ID}_users`
        const ticketKey = `${user.ID}_tickets`
        // Fetch pos data
        Promise.all([
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: categoriesKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          }),
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: productsKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          }),
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: usersKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          }),
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: receiptsKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          }),
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: receiptItemsKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          }),
          instance.get(url, {
            params: {
              POSDATA: '',
              Call: 'SHOW',
              KeyData: ticketKey,
              MerchantID: user.ID,
              APIKey: user.APIKey
            }
          })
        ]).then(response => {
          if (response) {
            const posCalls = {
              categories: response[0].data === 'nothing found' ? 'INSERT' : 'UPDATE',
              products: response[1].data === 'nothing found' ? 'INSERT' : 'UPDATE',
              users: response[2].data === 'nothing found' ? 'INSERT' : 'UPDATE',
              receipts: response[3].data === 'nothing found' ? 'INSERT' : 'UPDATE',
              receiptItems: response[4].data === 'nothing found' ? 'INSERT' : 'UPDATE',
              tickets: response[5].data === 'nothing found' ? 'INSERT' : 'UPDATE'
            }
            const posData = getters.pos
            if (response[0].data === 'Invalid API Key') {
              const error = 'Invalid API Key'
              reject(error)
            }
            // categories
            pos.categories = extractData(response, 0)
            // products
            pos.products = extractData(response, 1)
            pos.products = pos.products.map(product => {
              return {
                ...product,
                itemName: decodeURIComponent(product.itemName),
                sku: decodeURIComponent(product.sku)
              }
            })
            // users
            pos.users = extractData(response, 2)
            if (Object.keys(payload).length > 0) {
              const index = _.findIndex(pos.users, { isParentUser: 'true' })
              if (index === -1) {
                const user = {
                  ID: pos.users ? pos.users.length + 1 : 1,
                  PIN: payload.Password,
                  USERNAME: payload.User,
                  isLoggedIn: 'true',
                  isParentUser: 'true'
                }
                pos.users.push(user)
                commit(SET_WEB_LOGGED_IN_EMPLOYEE, user)
                // Save users
                dispatch(SAVE_EMPLOYEES, {
                  call: posCalls.users,
                  data: _.cloneDeep(pos.users)
                }).catch(error => {
                  console.log(error)
                })
              } else {
                if (payload.Password) {
                  pos.users[index].PIN = payload.Password
                  if (getters.webLoggedInEmployee === null) {
                    pos.users[index].isLoggedIn = 'true'
                    commit(SET_WEB_LOGGED_IN_EMPLOYEE, pos.users[index])
                  }
                }
              }
            } else {
              const index = _.findIndex(posData.users, { isParentUser: 'true' })
              if (index !== -1 && posData.users[index].PIN) {
                pos.users[index].PIN = posData.users[index].PIN
              }
            }
            // receipts
            pos.receipts = extractData(response, 3)
            // receiptItems
            pos.receiptItems = extractData(response, 4)
            // tickets
            if (response[5].data && response[5].data !== 'nothing found') {
              let tickets = response[5].data
              const accountInfo = getters.accountInfo
              let inputCurrency = 'EUR'
              if (accountInfo) {
                let currency = accountInfo.PayoutCurrencyShortName
                const coins = getters.altCoins
                if (coins.length > 0) {
                  currency = _.find(coins, { ShortName: currency })
                  if (currency) {
                    inputCurrency = currency.LongName
                  }
                }
              }
              // Tickets
              tickets = tickets.map(ticket => {
                if (ticket.status !== 'paid') {
                  if (typeof ticket.isActive === 'boolean') {
                    ticket.isActive = ticket.isActive.toString()
                  }
                  return {
                    ...ticket,
                    inputCurrency: inputCurrency
                  }
                }
                return ticket
              })
              pos.tickets = tickets
            } else {
              pos.tickets = []
            }
            commit(SET_POS, pos)
            // Save pos Call
            commit(SET_POS_CALLS, posCalls)
            resolve(pos)
          }
        }).catch(error => {
          reject(error)
        })
      } else {
        resolve()
      }
    })
  },
  [SAVE_TICKETS] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload.data)
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_tickets`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')

      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        // Updated
        const pos = getters.pos
        pos.tickets = payload.data
        commit(SET_POS, pos)
        // Update pos call
        const posCall = {
          ...getters.posCalls,
          tickets: 'UPDATE'
        }
        commit(SET_POS_CALLS, posCall)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [SAVE_CATEGORIES] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload.data)
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_categories`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        // Updated
        const pos = {
          ...getters.pos,
          categories: data
        }
        commit(SET_POS, pos)
        // Update pos call
        const posCalls = {
          ...getters.posCalls,
          categories: 'UPDATE'
        }
        commit(SET_POS_CALLS, posCalls)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [SAVE_PRODUCTS] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      let data = _.cloneDeep(payload.data)
      if (data.length > 0) {
        data = data.map(product => {
          return {
            ...product,
            itemName: encodeURIComponent(product.itemName),
            sku: encodeURIComponent(product.sku)
          }
        })
      }
      const user = typeof payload.user !== 'undefined' ? payload.user : getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_products`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        if (response.data.toLowerCase() === 'update failed') {
          reject(response.data)
        } else {
          if (user.APIKey !== '_') {
            // Updated
            const pos = {
              ...getters.pos,
              products: payload.data
            }
            commit(SET_POS, pos)
            // Update pos call
            const posCalls = {
              ...getters.posCalls,
              products: 'UPDATE'
            }
            commit(SET_POS_CALLS, posCalls)
          }
          resolve()
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  [SAVE_RECEIPTS] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload.data)
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_receipts`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        // Updated
        const pos = {
          ...getters.pos,
          receipts: payload.data
        }
        commit(SET_POS, pos)
        // Update pos call
        const posCalls = {
          ...getters.posCalls,
          receipts: 'UPDATE'
        }
        commit('setPosCall', posCalls)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [SAVE_RECEIPT_ITEMS] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload.data)
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', payload.call)
      fd.append('KeyData', `${user.ID}_receiptItems`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        // Updated
        const pos = {
          ...getters.pos,
          receiptItems: payload.data
        }
        commit(SET_POS, pos)
        // Update pos call
        const posCalls = {
          ...getters.posCalls,
          receiptItems: 'UPDATE'
        }
        commit('setPosCall', posCalls)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [FETCH_SHOP_DATA] ({
    getters,
    commit
  }, params) {
    return new Promise((resolve, reject) => {
      Promise.all([
        instance.get(`${apiBaseUrl}/MarketAPI`, {
          params: {
            POSDATA: '',
            Call: 'SHOWPOS',
            KeyData: `${params.shopId}_categories`,
            MerchantID: params.shopId,
            showpos: 1
          }
        }),
        instance.get(`${apiBaseUrl}/MarketAPI`, {
          params: {
            POSDATA: '',
            Call: 'SHOWPOS',
            KeyData: `${params.shopId}_products`,
            MerchantID: params.shopId,
            showpos: 1
          }
        })
      ]).then(response => {
        let products = response[1].data
        if (products !== 'nothing found' && products.length > 0) {
          products = products.map(product => {
            return {
              ...product,
              itemName: decodeURIComponent(product.itemName),
              sku: decodeURIComponent(product.sku)
            }
          })
        }
        const shop = {
          categories: response[0].data,
          products: products
        }
        commit(SET_SHOP_DATA, shop)
        resolve(shop)
      }).catch(error => {
        reject(error)
      })
    })
  },
  [FETCH_COUPONS] ({ commit }, payload) {
    instance.get(`${apiBaseUrl}/MarketAPI`, {
      params: {
        POSDATA: '',
        Call: 'SHOWPOS',
        MerchantID: payload.MerchantID,
        KeyData: '',
        APIKey: payload.APIKey,
        output: 'json'
      }
    }).then(response => {
      if (response.status === 200) {
        if (response.data !== 'nothing found') {
          commit(SET_COUPONS, response.data)
        }
      }
    }).catch(error => {
      console.log(error)
    })
  },
  [FETCH_SHIPPING_METHODS] ({
    commit,
    getters
  }) {
    const user = getters.user
    instance.get(`${apiBaseUrl}/MarketAPI`, {
      params: {
        POSDATA: '',
        Call: 'SHOW',
        MerchantID: user.ID,
        KeyData: `${user.ID}_shippings`,
        APIKey: user.APIKey
      }
    }).then(response => {
      if (response.status === 200) {
        if (response.data !== 'nothing found') {
          commit(SET_SHIPPING_METHODS, response.data)
          commit(SET_SHIPPING_METHOD_ACTION, 'UPDATE')
        } else {
          commit(SET_SHIPPING_METHODS, [])
        }
      }
    }).catch(error => {
      console.log(error)
    })
  },
  [SAVE_SHIPPING_METHODS] ({
    commit,
    getters
  }, payload) {
    return new Promise((resolve, reject) => {
      const data = _.cloneDeep(payload)
      const user = getters.user
      const fd = new FormData()
      fd.append('Call', getters.shippingMethodAction)
      fd.append('KeyData', `${user.ID}_shippings`)
      fd.append('ValueData', JSON.stringify(data))
      fd.append('MerchantID', Number(user.ID))
      fd.append('APIKey', user.APIKey)
      fd.append('output', 'json')
      instance.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        commit(SET_SHIPPING_METHODS, payload)
        commit(SET_SHIPPING_METHOD_ACTION, 'UPDATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  [FETCH_SHOPS_LIST] ({
    commit
  }) {
    return new Promise((resolve, reject) => {
      instance.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'shops',
          MerchantID: 1,
          APIKey: '_',
          output: 'json'
        }
      }).then(response => {
        if (response.status === 200) {
          let shops = response.data
          if (shops.length > 0) {
            const categories = []
            shops = shops.filter(shop => shop.SHOWPOS === '1')
            shops.map(shop => {
              if (shop.POSCATEGORY) {
                if (shop.POSCATEGORY.toLowerCase() !== 'n/a') {
                  const index = categories.indexOf(shop.POSCATEGORY)
                  if (index === -1) {
                    categories.push(shop.POSCATEGORY)
                  }
                }
              } else {
                shop.POSCATEGORY = 'N/A'
              }
              shop.ShippingOptions = shop.ShippingOptions ? shop.ShippingOptions : []
            })
            commit(SET_SHOP_CATEGORIES, categories)
          }
          commit(SET_SHOPS_LIST, shops)
        }
        resolve()
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },
  [FETCH_RATINGS] ({
    commit,
    getters
  }, merchantID) {
    return new Promise((resolve, reject) => {
      instance.get(`${apiBaseUrl}/MarketAPI`, {
        params: {
          rating: '',
          list: 1,
          merchantid: merchantID
        }
      }).then(response => {
        resolve(response.data.data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  [LOGOUT] ({ commit }) {
    return new Promise((resolve, reject) => {
      instance.get(`${apiBaseUrl}/Login`, {
        params: {
          logout: true,
          output: 'json'
        },
        withCredentials: true
      }).then(response => {
        commit(UNSET_LOGGED_IN)
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}
