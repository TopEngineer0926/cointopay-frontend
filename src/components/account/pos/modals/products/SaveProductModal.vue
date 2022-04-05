<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.products.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.products.select_category') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'categoryId') }}</div>
          </div>
          <select class="form-select w-full" v-model="form.categoryId">
            <option value>Select Category</option>
            <option :key="index" :value="category.id" v-for="(category, index) in categories">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.products.name') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'name') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.name"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.products.description') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'description') }}</div>
          </div>
          <textarea class="form-input w-full" rows="4" v-model="form.description"></textarea>
        </div>
        <div class="mb-2">
          <div class="grid grid-cols-2 gap-1 md:gap-4">
            <div class="col-span-1">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('pos.products.quantity') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'quantity') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.quantity"/>
            </div>
            <div class="col-span-1">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('pos.products.price') }}&nbsp;({{ currency }})</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'price') }}</div>
              </div>
              <input class="form-input w-full" type="text" v-model="form.price"/>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.products.sku') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'sku') }}</div>
          </div>
          <div class="flex items-center justify-between">
            <input class="form-input w-full" type="text" v-model="form.sku"/>
            <span class="hover:text-blue-500 ml-3 cursor-pointer"
                  @click="isBarcodeScanner = !isBarcodeScanner">
               <icon name="barcode"></icon>
            </span>
          </div>
        </div>

        <div class="mb-2">
          <div class="grid grid-cols-2 gap-1 md:gap-4">
            <div class="col-span-1">
              <div class="w-28 h-28 overflow-hidden mx-auto">
                <label for="file" class="cursor-pointer" v-tippy="'Click here to upload'">
                  <img class="w-28 h-28 object-cover" :src="getImageUrl" alt=""/>
                </label>
                <input @change="upload($event)" class="hidden" id="file" type="file" ref="featuredImg"/>
              </div>
            </div>
            <div class="col-span-1">
              <div class="mx-auto w-40" v-if="isBarcodeScanner">
                <StreamBarcodeReader @decode="onDecode" @error="onError"></StreamBarcodeReader>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.products.btn_save') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_PRODUCTS } from '@/store/keys'
import { StreamBarcodeReader } from 'vue-barcode-reader'

export default {
  name: 'SaveProductModal',
  components: {
    Modal,
    Icon,
    JButton,
    StreamBarcodeReader
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const http = inject('http')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    // State
    const featuredImg = ref(null)
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      product: null,
      currency: null,
      form: {
        categoryId: '',
        name: '',
        description: '',
        imageUrl: '',
        quantity: '',
        price: '',
        sku: ''
      },
      errorBag: {},
      rules: {
        categoryId: ['required'],
        name: ['required'],
        description: ['required'],
        sku: ['required'],
        quantity: ['required', 'minValue:1', 'maxValue:9999999'],
        price: ['required', 'minValue:0.1', 'regex:/^[0-9]{1,8}([,.][0-9]{1,8})?$/']
      },
      messages: {
        categoryId: {
          required: 'Please select category'
        },
        name: {
          required: 'Product name is required'
        },
        description: {
          required: 'Product description is required'
        },
        sku: {
          required: 'Product sku is required'
        },
        quantity: {
          required: 'Product stock level is required',
          minValue: 'Product stock should be between 1 and 9999999',
          maxValue: 'Product stock should be between 1 and 9999999'
        },
        price: {
          required: 'Product price is required',
          regex: 'Please enter a valid price value',
          minValue: 'Price should be greater than 0'
        }
      },
      isProcessing: false,
      isBarcodeScanner: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const getImageUrl = computed(() => {
      if (state.form.imageUrl) {
        return state.form.imageUrl
      }
      return require('@/assets/images/pos/placeholder.png')
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules, state.messages)
        }
      })

    // Methods
    const closeModal = () => {
      state.show = false
    }
    const onDecode = (result) => {
      if (result) {
        state.form.sku = result
        state.isBarcodeScanner = false
      }
    }
    const onError = (error) => {
      console.log(error)
    }
    const generateId = () => {
      const products = _.cloneDeep(pos.value.products)
      if (products.length > 0) {
        const product = _.maxBy(products, product => {
          return Number(product.id)
        })
        return (Number(product.id) + 1).toString()
      }
      return '1'
    }
    // Upload file
    const upload = (evt) => {
      const files = evt.target.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const fd = new FormData()
          fd.append('file123', file)
          fd.append('MerchantID', user.value.ID)
          // Upload it to amazon S3
          const apiBaseUrl = process.env.VUE_APP_API_URL
          http.post(`${apiBaseUrl}/MarketAPI?POSBLOB`, fd, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(response => {
            if (response.status === 200) {
              state.form.imageUrl = response.data
              // Clear file
              featuredImg.value.value = ''
            }
          }).catch(error => {
            console.log(error)
          })
        } else {
          // Clear file
          featuredImg.value.value = ''
          toast.error('Please provide a valid image file')
        }
      }
    }
    // Create or Update Product
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const formData = state.form
        const products = _.cloneDeep(pos.value.products)
        let isValid = true
        if (state.product) {
          let index = _.findIndex(products, product => {
            return (product.sku === formData.sku && state.product.id !== product.id)
          })
          if (index === -1) {
            index = _.findIndex(products, { id: state.product.id })
            products.splice(index, 1, {
              id: state.product.id,
              categoryID: formData.categoryId,
              itemName: formData.name,
              description: formData.description,
              imageUri: formData.imageUrl,
              sku: formData.sku,
              stock: formData.quantity,
              price: formData.price
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Product with this sku already exists!')
          }
        } else {
          if (_.findIndex(products, { sku: formData.sku }) === -1) {
            products.push({
              id: generateId(),
              categoryID: formData.categoryId,
              itemName: formData.name,
              description: formData.description,
              imageUri: formData.imageUrl,
              sku: formData.sku,
              stock: formData.quantity,
              price: formData.price
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Product with this sku already exists!')
          }
        }
        if (isValid) {
          store.dispatch(SAVE_PRODUCTS, {
            call: posCalls.value.products,
            data: products
          }).then(() => {
            state.isProcessing = false
            const message = state.product ? 'Product updated successfully' : 'Product added successfully'
            toast.success(message)
            closeModal()
          }).catch(error => {
            console.log(error)
            state.isProcessing = false
            toast.error('Internal Server Error')
          })
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('saveProductModal', (args) => {
        state.product = args.product || null
        state.currency = args.currency
        // Reset
        if (featuredImg.value) {
          featuredImg.value.value = ''
        }
        state.form = {
          categoryId: state.product ? state.product.categoryID : '',
          name: state.product ? state.product.itemName : '',
          description: state.product ? state.product.description : '',
          imageUrl: state.product ? state.product.imageUri : '',
          quantity: state.product ? state.product.stock : '',
          price: state.product ? state.product.price : '',
          sku: state.product ? state.product.sku : ''
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      featuredImg,
      categories: pos.value.categories,
      showError,
      closeModal,
      getImageUrl,
      onDecode,
      onError,
      upload,
      submit
    }
  }
}
</script>

<style scoped>

</style>
