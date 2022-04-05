<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.products.categories.title') }}</span>
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
            <label>{{ translate('pos.products.categories.select_color') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'categoryColourCode') }}</div>
          </div>
          <color-picker v-model:pureColor="form.categoryColourCode" format="hex" shape="circle"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.products.categories.category_name') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'name') }}</div>
          </div>
          <input v-model="form.name" class="form-input w-full" type="text"/>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.products.categories.btn_save') }}</span>
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
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_CATEGORIES } from '@/store/keys'

export default {
  name: 'SaveCategoryModal',
  components: {
    Modal,
    Icon,
    JButton,
    ColorPicker
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      category: null,
      form: {
        categoryColourCode: '#000000',
        name: ''
      },
      errorBag: {},
      rules: {
        categoryColourCode: ['required'],
        name: ['required']
      },
      messages: {
        categoryColourCode: {
          required: 'Color code is required'
        },
        name: {
          required: 'Category name is required'
        }
      },
      isProcessing: false
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const generateId = () => {
      const categories = _.cloneDeep(pos.value.categories)
      if (categories.length > 0) {
        const category = _.maxBy(categories, category => {
          return Number(category.id)
        })
        return (Number(category.id) + 1).toString()
      }
      return '1'
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const categories = _.cloneDeep(pos.value.categories)
        const formData = {
          ...state.form,
          categoryColourCode: state.form.categoryColourCode.replace('#', '')
        }
        let isValid = true
        if (state.category) {
          const index = _.findIndex(categories, category => {
            return (category.name === state.category.name && category.id !== state.category.id)
          })
          if (index === -1) {
            categories.splice(index, 1, {
              ...state.category,
              categoryColourCode: formData.categoryColourCode,
              name: formData.name
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Category name already exists!')
          }
        } else {
          if (_.findIndex(categories, { name: formData.name }) === -1) {
            categories.push({
              id: generateId(),
              ...formData
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Category name already exists!')
          }
        }
        if (isValid) {
          store.dispatch(SAVE_CATEGORIES, {
            call: posCalls.value.categories,
            data: categories
          }).then(response => {
            state.isProcessing = false
            const message = state.category ? 'Category updated successfully' : 'Category added successfully'
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
      emitter.on('saveCategoryModal', (args) => {
        state.category = args.category || null
        // Reset
        state.form = {
          categoryColourCode: state.category ? `#${state.category.categoryColourCode}` : '#000000',
          name: state.category ? state.category.name : ''
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      showError,
      submit
    }
  }
}
</script>

<style scoped></style>
