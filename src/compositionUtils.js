import { LOGOUT, SAVE_ACCOUNT_INFO, SET_BALANCES, SET_NOTIFICATIONS, SET_USER } from './store/keys'
import { useStore } from 'vuex'
import { computed, inject } from 'vue'
import * as _ from 'lodash'
import { Fancybox } from '@fancyapps/ui/src/Fancybox/Fancybox'
import Facebook from './libs/Facebook'

const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022.min')

export default function () {
  const toast = inject('toast')
  const store = useStore()

  const transactionStatuses = [
    {
      value: 'waiting',
      label: 'Waiting'
    },
    {
      value: 'payout',
      label: 'Payout'
    },
    {
      value: 'paid',
      label: 'Paid'
    },
    {
      value: 'expired',
      label: 'Expired'
    },
    {
      value: 'scheduled',
      label: 'Scheduled'
    },
    {
      value: 'vtoken-active',
      label: 'vToken-Active'
    },
    {
      value: 'vtoken-claimed',
      label: 'vToken-Claimed'
    },
    {
      value: 'ltr-open',
      label: 'LTR-open'
    },
    {
      value: 'ltr-expired',
      label: 'LTR-expired'
    },
    {
      value: 'ltr-closed',
      label: 'LTR-closed'
    },
    {
      value: 'awaiting-fiat',
      label: 'Awaiting-fiat'
    },
    {
      value: 'underpaid',
      label: 'Underpaid'
    }
  ]

  const cartStatusesList = (status = null) => {
    const statuses = [
      {
        id: 1,
        value: 'Not Set'
      },
      {
        id: 2,
        value: 'Processing'
      },
      {
        id: 3,
        value: 'Processed'
      },
      {
        id: 4,
        value: 'Shipped'
      },
      {
        id: 5,
        value: 'Reversed'
      },
      {
        id: 6,
        value: 'Refunded'
      },
      {
        id: 7,
        value: 'Completed'
      },
      {
        id: 8,
        value: 'Waiting'
      }
    ]
    if (status) {
      return _.find(statuses, { id: Number(status) })
    }
    return statuses
  }

  // Generate icon url
  const generateIconUrl = (name) => {
    if (!name) {
      return ''
    }
    const iconName = name.toLowerCase()
    return `https://s3-eu-west-1.amazonaws.com/cointopay/img/${iconName}_dash2.png`
  }
  // Save notification to vuex store
  const saveNotification = (msg) => {
    const notifications = computed(() => store.state.notifications)
    notifications.value.splice(0, 0, {
      message: msg
    })
    store.commit(SET_NOTIFICATIONS, notifications)
  }
  // Copy data to clipboard
  const copyToClipboard = (val, isShowAlert = true) => {
    navigator.clipboard.writeText(val).then(function () {
      if (isShowAlert) {
        toast.success('Copied to clipboard')
      }
    }, function (err) {
      console.error('Async: Could not copy text: ', err)
    })
  }

  const toFixed = (num) => {
    return Number(num).toFixed(8)
  }

  // Format date time
  const formatDT = (dateTime) => {
    if (dateTime === null || dateTime === '-') {
      return '-'
    }
    dateTime = dateTime.replace(/-/g, '/')
    return moment(new Date(dateTime)).locale(store.state.locale).format('LLL')
  }

  // Format price
  const formatPrice = (value, currency = 'EUR') => {
    if (!value) {
      return ''
    }
    const currencies = {
      VPO: 'EUR'
    }
    currency = Object.keys(currencies).indexOf(currency) !== -1 ? currencies[currency] : currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // Check if provided string is a valid url
  const isValidUrl = (str) => {
    const a = document.createElement('a')
    a.href = str
    return a.host && a.host !== window.location.host
  }

  const lowercase = (val) => {
    return val ? val.toLowerCase() : val
  }

  // Generate id
  const generateId = (items, key = 'ID') => {
    if (items.length > 0) {
      const item = _.maxBy(items, item => {
        return Number(item[key])
      })
      return (Number(item[key]) + 1).toString()
    }
    return '1'
  }

  const fancyBox = (url) => {
    Fancybox.show([{
      thumb: url,
      src: url
    }], {})
  }

  // Logout
  const terminateSession = () => {
    return new Promise((resolve, reject) => {
      store.dispatch(LOGOUT).then((response) => {
        if (response.toLowerCase() === 'success') {
          if (store.state.isSocialLogin) {
            // logout from facebook
            const facebook = new Facebook(process.env.VUE_APP_FACEBOOK_ID)
            if (facebook) {
              facebook.initialize().then((response) => {
              }).catch((error) => {
                console.log(error)
              })
              facebook.signOut().then(() => {
              })
            }
          }
          const state = store.state
          const newState = {}
          const initialState = {
            ...state,
            isLoggedIn: false,
            isSocialLogin: false,
            currentRoute: '',
            user: null,
            accountInfo: null,
            addressBook: {
              crypto: {},
              transferwise: {}
            },
            notifications: [],
            balances: [],
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
          }
          Object.keys(state).forEach(key => {
            newState[key] = initialState[key]
          })
          store.replaceState(newState)
          store.commit(SET_USER, null)
          store.commit(SAVE_ACCOUNT_INFO, null)
          store.commit(SET_BALANCES, [])
          resolve()
        }
      }).catch((error) => {
        reject(error)
      })
    })
  }

  return {
    transactionStatuses,
    cartStatusesList,
    generateIconUrl,
    saveNotification,
    copyToClipboard,
    toFixed,
    formatDT,
    formatPrice,
    isValidUrl,
    lowercase,
    generateId,
    fancyBox,
    terminateSession
  }
}
