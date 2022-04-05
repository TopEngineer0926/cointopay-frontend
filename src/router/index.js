import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import Login from '@/views/Login'
import Home from '../views/Home'
import {
  FETCH_LANGUAGES,
  FETCH_TRANSFER_WISE_CONFIG,
  FETCH_TRANSLATIONS,
  SET_APP_VERSION,
  SET_CURRENT_ROUTE
} from '@/store/keys'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/message/:message',
    name: 'message',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: 'signup' */ '@/views/Signup.vue')
  },
  {
    path: '/recover-password',
    name: 'recover-password',
    component: () => import(/* webpackChunkName: 'recover-password' */ '@/views/ForgotPassword.vue')
  },
  {
    path: '/wallet/:ln?',
    name: 'wallet',
    component: () => import(/* webpackChunkName: 'wallet' */ '@/views/Wallet.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/:action?',
    name: 'account',
    component: () => import(/* webpackChunkName: 'account' */ '@/views/Account.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/categories',
    name: 'account-pos-categories',
    component: () => import(/* webpackChunkName: 'account-pos-categories' */ '@/views/pos/Categories.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/products',
    name: 'account-pos-products',
    component: () => import(/* webpackChunkName: 'account-pos-products' */ '@/views/pos/Products.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/favourites',
    name: 'account-pos-favourites',
    component: () => import(/* webpackChunkName: 'account-pos-favourites' */ '@/views/pos/Favourites.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/tickets',
    name: 'account-pos-tickets',
    component: () => import(/* webpackChunkName: 'account-pos-tickets' */ '@/views/pos/Tickets.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/ticket/:ticketId',
    name: 'account-pos-ticket',
    component: () => import(/* webpackChunkName: 'account-pos-ticket' */ '@/views/pos/Ticket.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/recipients',
    name: 'account-pos-recipients',
    component: () => import(/* webpackChunkName: 'account-pos-recipients' */ '@/views/pos/Recipients.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/employees',
    name: 'account-pos-employees',
    component: () => import(/* webpackChunkName: 'account-pos-employees' */ '@/views/pos/Employees.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/office',
    name: 'account-pos-office',
    component: () => import(/* webpackChunkName: 'account-pos-office' */ '@/views/pos/Office.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import(/* webpackChunkName: 'shop' */ '@/views/Shops.vue')
  },
  {
    path: '/shop/:id',
    name: 'shop-detail',
    component: () => import(/* webpackChunkName: 'shop-detail' */ '@/views/Shop.vue')
  },
  {
    path: '/shop/:id/categories/:categoryId',
    name: 'shop-detail-category',
    component: () => import(/* webpackChunkName: 'shop-detail-category' */ '@/views/Shop.vue')
  },
  {
    path: '/shop/:shopId/products/:id',
    name: 'product-detail',
    component: () => import(/* webpackChunkName: 'product-detail' */ '@/views/ProductDetail.vue')
  },
  {
    path: '/shop/cart',
    name: 'cart',
    component: () => import(/* webpackChunkName: 'cart' */ '@/views/Cart.vue')
  },
  {
    path: '/shop/checkout',
    name: 'checkout',
    component: () => import(/* webpackChunkName: 'checkout' */ '@/views/Checkout.vue')
  },
  {
    path: '/shop/invoice/:confirmCode',
    name: 'shop-invoice',
    component: () => import(/* webpackChunkName: 'shop-invoice' */ '@/views/ShopInvoice.vue')
  },
  {
    path: '/account/pos/invoice/:confirmCode',
    name: 'account-pos-invoice',
    component: () => import(/* webpackChunkName: 'account-pos-invoice' */ '@/views/pos/Invoice.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/account/pos/invoice/success/:ticketId',
    name: 'account-pos-invoice-success',
    component: () => import(/* webpackChunkName: 'account-pos-invoice-success' */ '@/views/pos/Success.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/invoice/:confirmCode',
    name: 'invoice',
    component: () => import(/* webpackChunkName: 'invoice' */ '@/views/Invoice.vue')
  },
  {
    path: '/invoice/confirmed',
    name: 'confirmed',
    component: () => import(/* webpackChunkName: "confirmed" */ '@/views/Confirmed.vue')
  },
  {
    path: '/invoice/failed',
    name: 'failed',
    component: () => import(/* webpackChunkName: "failed" */ '@/views/Failed.vue')
  },
  {
    path: '/webshop-overview',
    name: 'webshop-overview',
    component: () => import(/* webpackChunkName: 'webshop-overview' */ '@/views/WebshopOverview.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: 'about' */ '@/views/AboutUs.vue')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import(/* webpackChunkName: 'terms' */ '@/views/Terms.vue')
  },
  {
    path: '/payments',
    name: 'payments',
    component: () => import(/* webpackChunkName: 'payments' */ '@/views/Payments.vue')
  },
  {
    path: '/newsletter',
    name: 'newsletter',
    component: () => import(/* webpackChunkName: 'newsletter' */ '@/views/Newsletter.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior () {
    window.scrollTo(0, 0)
  }
})

router.beforeEach((to, from, next) => {
  // Set current route
  if (['login', 'signup', 'recover-password'].indexOf(to.name) === -1) {
    store.commit(SET_CURRENT_ROUTE, to.fullPath)
  }
  const version = '2.0.0'
  const appVersion = store.getters.appVersion
  if (appVersion === null || appVersion !== version) {
    store.commit(SET_APP_VERSION, version)
    // Update localstorage with updated data
    store.dispatch(FETCH_LANGUAGES).catch(() => {
    })
    store.dispatch(FETCH_TRANSLATIONS).catch(() => {
    })
    // Get transferwise config
    store.dispatch(FETCH_TRANSFER_WISE_CONFIG).catch(() => {
    })
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isLoggedIn) {
      return next({ name: 'login' })
    }
  }
  next()
})
export default router
