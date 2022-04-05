<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <div class="title">
          <h5>{{ translate('pos.office.product_catalog') }}</h5>
        </div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="text-center w-full md:w-4/5 3xl:w-3/5 mx-auto">
            <a href="https://cointopay.com/examplePOS_CSV.csv" target="_blank"
               class="text-blue-500 hover:underline">Example Import Data</a>
            <div class="flex items-center justify-center my-2">
              <input @change="importFromCSV($event)" class="hidden" id="importCSV" type="file"/>
              <label class="btn btn-success w-32 lbl-file" for="importCSV">
                <span v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </span>
                <span>{{ translate('pos.office.import') }}</span>
              </label>
              <j-button @click="exportToCSV()" buttonStyle="success" size="w-32" class="ml-3">
                {{ translate('pos.office.export') }}
              </j-button>
            </div>
            <p class="mb-2">{{ translate('pos.office.import_from_shopify') }}</p>
            <form @submit.prevent="importFromShopify()" class="flex-space-between">
              <div class="flex items-center">
                <input :placeholder="translate('pos.office.shopify_link')" aria-label="url"
                       class="form-input w-full" type="url" v-model="form.url"/>
                <j-button :disabled="isProcessing || !isValidShopifyURL(form.url)" buttonStyle="success" size="w-32"
                          class="ml-3">
                  <span v-if="isProcessing" class="mr-3">
                    <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                  </span>
                  <span>{{ translate('pos.office.import') }}</span>
                </j-button>
              </div>
            </form>
            <p class="mt-2 text-left text-gray-500 text-sm">https://3sixteen.myshopify.com/products.json?limit=1000</p>
          </div>
        </div>
      </div>
      <!--Delete All Products-->
      <div class="card" v-if="products.length > 0">
        <div class="title">
          <h5>{{ translate('pos.delete_catalog') }}</h5>
        </div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="text-center">
            <j-button @click="deleteAllProducts()" buttonStyle="danger">
              {{ translate('pos.btn_delete_all_products') }}
            </j-button>
          </div>
        </div>
      </div>
      <!--Enable/Disable Ecommerce-->
      <div class="card">
        <div class="title">
          <h5>{{ translate('pos.e_commerce') }}</h5>
        </div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="row">
            <div class="col-md-12 text-center">
              <div class="w-full rounded shadow px-4 py-3 bg-yellow-500 mb-4 text-yellow-900 font-semibold"
                   v-if="showShippingWarning">
                {{ translate('pos.shipping_warning_msg') }}
              </div>
              <j-button @click="togglePOS(isPosEnabled ? 0 : 1)" :buttonStyle="`${isPosEnabled ? 'danger': 'success'}`"
                        class="mr-2">
                {{ translate(`${isPosEnabled ? 'pos.btn_disable' : 'pos.btn_enable'}`) }}
              </j-button>
              <div class="mt-3" v-if="isPosEnabled">
                <h5 class="font-bold text-lg mb-3">Shop Link</h5>
                <div class="flex items-center justify-center">
                  <router-link :to="{name: 'shop', params: {id: user.ID}}" class="mr-3" tag="a">
                    {{ siteUrl + '/shop/' + user.ID }}
                  </router-link>
                  <button v-tippy="{content: translate('pos.office.help')}">
                    <icon name="question-mark" classes="w-6 h-6 text-yellow-500"></icon>
                  </button>
                </div>
              </div>
              <div class="mt-3" v-if="isPosEnabled">
                <textarea class="form-input w-full md:w-3/5" rows="4" readonly aria-label=""
                          v-model="iframe"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--E-Commerce Coupons-->
      <div class="card">
        <div class="title">
          <h5>{{ translate('pos.coupons.list_title') }}</h5>
        </div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <Coupons></Coupons>
        </div>
      </div>
      <!--E-Commerce Shipping-->
      <div class="card">
        <div class="title">
          <h5>{{ translate('pos.shipping.title') }}</h5>
        </div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <Shipping-methods></Shipping-methods>
        </div>
      </div>
      <!--APPS-->
      <div class="card">
        <div class="title">POS Apps</div>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="flex items-center justify-center">
            <a href="https://play.google.com/store/apps/details?id=com.cointopay.pos" target="_blank">
              <img alt="Play store" src="@/assets/images/play_store.png" class="h-10"/></a>
            <a href="https://apps.apple.com/us/app/c-pos/id1459100341" target="_blank">
              <img alt="App store" src="@/assets/images/app_store.svg" class="h-10 ml-2"/></a>
          </div>
        </div>
      </div>

    </template>
  </pos-layout>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import Coupons from '@/components/account/pos/office/Coupons'
import ShippingMethods from '@/components/account/pos/office/ShippingMethods'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import { FETCH_SHOP_DATA, SAVE_CATEGORIES, SAVE_PRODUCTS, FETCH_SHIPPING_METHODS } from '@/store/keys'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import * as moment from 'moment'
import axios from 'axios'

export default {
  name: 'Office',
  components: {
    'pos-layout': POSLayout,
    Icon,
    JButton,
    Coupons,
    ShippingMethods
  },
  setup () {
    const translate = inject('translate')
    const toast = inject('toast')
    const http = inject('http')
    const swal = inject('swal')

    // Store
    const store = useStore()

    const {
      saveNotification,
      generateId
    } = compositionUtils()

    // State
    const state = reactive({
      form: {
        url: ''
      },
      siteUrl: window.location.protocol + '//' + window.location.host,
      isProcessing: false,
      isPosEnabled: false
    })

    // Computed
    const shippingMethods = computed(() => store.state.shippingMethods)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const user = computed(() => store.state.user)
    const products = computed(() => pos.value.products)
    const showShippingWarning = computed(() => {
      return shippingMethods.value.length === 0 && state.isPosEnabled === true
    })
    const iframe = computed(() => {
      // eslint-disable-next-line quotes
      return `<iframe src="https://cointopay.com/shop/17170" frameborder="0" height="550" name="Framename" scrolling="yes" style="width: 100%;" width="550"></iframe>`
    })

    // Methods
    const apiUrl = process.env.VUE_APP_API_URL
    const importFromCSV = (evt) => {
      state.isProcessing = true
      const file = evt.target.files[0]
      if (file && _.endsWith(file.name, '.csv')) {
        const reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = (evt) => {
          const result = evt.target.result
          const allTextLines = result.split(/\r\n|\n/)
          let data = []
          let key = null
          allTextLines.map(line => {
            const columns = line.split(',')
            if (columns.length > 1) {
              if (key.toLowerCase() === 'categories') {
                data.push({
                  id: columns[0],
                  name: columns[1],
                  categoryColourCode: columns[2]
                })
              } else {
                // Push to category
                if (data) {
                  data = JSON.parse(JSON.stringify(data))
                  const categoryIndex = _.findIndex(data, { id: columns[2] })
                  if (typeof data[categoryIndex].products === 'undefined') {
                    data[categoryIndex].products = []
                  }
                  data[categoryIndex].products.push({
                    id: columns[0],
                    itemName: columns[1],
                    categoryID: columns[2],
                    description: columns[3],
                    stock: columns[4],
                    sku: columns[5],
                    price: columns[6],
                    imageUri: columns[7]
                  })
                }
              }
            } else {
              const val = columns[0].toLowerCase()
              if (val === 'products' || val === 'categories') {
                key = columns[0]
              }
            }
          })
          if (data.length > 0) {
            const categoriesList = _.cloneDeep(pos.value.categories)
            const productsList = _.cloneDeep(pos.value.products)
            data.map(category => {
              const catIndex = _.findIndex(categoriesList, { id: category.id })
              const importedCategory = {
                id: category.id,
                name: category.name,
                categoryColourCode: category.categoryColourCode
              }
              if (catIndex === -1) {
                categoriesList.push(importedCategory)
              } else {
                categoriesList.splice(catIndex, 1, importedCategory)
              }
              if (category.products && category.products.length > 0) {
                category.products.map(product => {
                  const prodIndex = _.findIndex(productsList, { sku: product.sku })
                  if (prodIndex === -1) {
                    productsList.push(product)
                  } else {
                    productsList.splice(prodIndex, 1, product)
                  }
                })
              }
            })
            // Update categories
            store.dispatch(SAVE_CATEGORIES, {
              call: posCalls.value.categories,
              data: categoriesList
            })
            // Update products
            store.dispatch(SAVE_PRODUCTS, {
              call: posCalls.value.products,
              data: productsList
            })
            state.isProcessing = false
            toast.success('Products imported successfully!')
            saveNotification('Products imported successfully!')
          } else {
            state.isProcessing = false
            toast.error('Please provide a valid csv file')
            saveNotification('Please provide a valid csv file')
          }
        }
        reader.onerror = (error) => {
          state.isProcessing = false
          console.log(error)
        }
      } else {
        state.isProcessing = false
        toast.error('Please provide a valid csv file')
        saveNotification('Please provide a valid csv file')
      }
    }
    const exportToCSV = () => {
      const filename = moment().format('DD-MM-YYYY_H_m_A') + '_Cointopay_' + user.value.ID + '_catalog_export.csv'
      const data = []
      if (pos.value.categories.length > 0) {
        data.push(['Categories'])
        pos.value.categories.forEach(category => {
          data.push([
            category.id,
            category.name,
            category.categoryColourCode
          ])
        })
      }
      if (pos.value.products.length > 0) {
        data.push(['Products'])
        pos.value.products.forEach(product => {
          data.push([
            product.id,
            product.itemName,
            product.categoryID,
            product.description,
            product.stock,
            product.sku,
            product.price,
            product.imageUri
          ])
        })
      }
      const csvContent = 'data:text/csv;charset=utf-8,' + data.map(e => e.join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    }
    const importFromShopify = () => {
      const url = state.form.url
      if (url) {
        state.isProcessing = true
        axios.get(`${url}`).then(response => {
          const shopifyProducts = response.data.products
          // Delete old products if any
          const categories = _.cloneDeep(pos.value.categories)
          const category = _.find(categories, { name: 'Shopify' })
          let categoryId = null
          let products = _.cloneDeep(pos.value.products)
          if (category) {
            categoryId = category.id
          } else {
            // Create category
            categoryId = generateId(categories)
            categories.push({
              id: categoryId,
              name: 'Shopify',
              categoryColourCode: Math.floor(Math.random() * 16777215).toString(16)
            })
            store.dispatch(SAVE_CATEGORIES, {
              call: 'UPDATE',
              data: categories
            })
          }
          const p = []
          shopifyProducts.map(product => {
            if (product.variants) {
              product.variants.map(variant => {
                const image = product.images[0]
                p.push({
                  id: variant.id.toString(),
                  categoryID: categoryId,
                  itemName: product.title,
                  description: '',
                  sku: variant.sku,
                  price: variant.price,
                  stock: '9999999',
                  imageUri: image ? image.src : ''
                })
              })
            }
          })
          if (products.length > 0) {
            // Update products
            p.map(item => {
              const index = _.findIndex(products, { sku: item.sku })
              if (index !== -1) {
                products[index] = item
              } else {
                products.push(item)
              }
            })
          } else {
            products = p
          }
          store.dispatch(SAVE_PRODUCTS, {
            call: 'UPDATE',
            data: products
          }).then(response => {
            state.isProcessing = false
            state.form.url = ''
            toast.success('Products imported successfully!')
            saveNotification('Products imported successfully!')
          }).catch(error => {
            state.isProcessing = false
            if (error.toLowerCase() === 'update failed') {
              toast.warning('Import failed due to unsupported encoding')
              saveNotification('Import failed due to unsupported encoding')
            }
          })
        }, error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }
    const isValidShopifyURL = (string) => {
      // eslint-disable-next-line no-useless-escape
      const res = string.match(/(http(s)?):\/\/[^.\s]+(.myshopify)?\.com\/products.json/)
      return (res !== null)
    }
    const deleteAllProducts = () => {
      swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        customClass: {
          container: 'swal2-tailwind'
        }
      }).then((result) => {
        if (result.value) {
          // Delete all products
          store.dispatch(SAVE_PRODUCTS, {
            call: posCalls.value.products,
            data: []
          })
          toast.success('Products deleted successfully')
          saveNotification('Products deleted successfully')
        }
      })
    }
    const togglePOS = (status) => {
      const payload = {
        Call: 'SHOWPOS',
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        showpos: status,
        output: 'json'
      }
      http.get(`${apiUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        if (response.data.status_code === 200) {
          toast.success(status === 1 ? 'POS enabled successfully' : 'POS disabled successfully')
          state.isPosEnabled = status === 1
        } else {
          toast.warning(response.data.message)
          saveNotification(response.data.message)
        }
      }).catch(error => {
        toast.warning(error.message)
        saveNotification(error.message)
      })
    }

    onBeforeMount(() => {
      store.dispatch(FETCH_SHOP_DATA, {
        shopId: user.value.ID
      }).then(response => {
        if (response.categories !== 'nothing found') {
          state.isPosEnabled = true
        }
      }).catch(error => {
        console.log(error)
      })
      // Fetch Shipping Methods
      store.dispatch(FETCH_SHIPPING_METHODS)
    })

    return {
      translate,
      ...toRefs(state),
      isValidShopifyURL,
      user,
      importFromCSV,
      exportToCSV,
      importFromShopify,
      deleteAllProducts,
      products,
      showShippingWarning,
      togglePOS,
      iframe
    }
  }
}
</script>

<style scoped></style>
