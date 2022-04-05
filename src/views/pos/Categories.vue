<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <nav-tabs></nav-tabs>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="body">
          <div class="flex items-center justify-end mb-3">
            <div class="relative">
              <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
              <input v-model="keyword" aria-label="Search..." class="form-input px-10" type="text"/>
              <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                    @click="keyword = ''">
                <icon classes="w-5 h-5" name="close"></icon>
              </span>
            </div>
            <j-button v-if="employee && employee.isParentUser === 'true'" class="ml-3"
                      type="button" @click="launchSaveCategoryModal()">
              {{ translate('pos.products.categories.btn_add') }}
            </j-button>
          </div>
          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-sm">
              <thead>
              <tr>
                <th>Color</th>
                <th>Category Name</th>
                <th style="width:90px;min-width:90px">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(category, i) in filteredCategories" :key="i">
                <td>
                <span :style="`background: #${category.categoryColourCode}`"
                      class="block w-8 h-8 rounded-full"></span>
                </td>
                <td>
                  <router-link tag="a" class="cursor-pointer text-blue-500 hover:underline"
                               :to="{name: 'account-pos-products', query: { category_id: category.id }}">
                    {{ category.name }}
                  </router-link>
                </td>
                <td>
                  <div v-if="employee && employee.isParentUser === 'true'" class="flex items-center">
                    <a class="hover:text-blue-500 mr-2"
                       @click="launchSaveCategoryModal(category)">
                      <icon name="edit"></icon>
                    </a>
                    <a class="hover:text-red-500" @click="deleteCategory(i)">
                      <icon name="trash"></icon>
                    </a>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Save Category Modal -->
  <save-category-modal></save-category-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import NavTabs from '@/components/account/pos/NavTabs'
import SaveCategoryModal from '@/components/account/pos/modals/categories/SaveCategoryModal'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_CATEGORIES, SAVE_PRODUCTS } from '@/store/keys'

export default {
  name: 'Categories',
  components: {
    NavTabs,
    SaveCategoryModal,
    'pos-layout': POSLayout,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const swal = inject('swal')
    const toast = inject('toast')
    const emitter = inject('emitter')
    // Store
    const store = useStore()
    // State
    const state = reactive({
      keyword: '',
      employee: null
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const filteredCategories = computed(() => {
      if (state.keyword) {
        const keyword = state.keyword.trim().toLowerCase()
        return pos.value.categories.filter(category => {
          return _.includes(category.name.toLowerCase(), keyword)
        })
      }
      return pos.value.categories
    })

    // Methods
    const launchSaveCategoryModal = (category = null) => {
      emitter.emit('saveCategoryModal', {
        category: category
      })
    }
    const deleteCategory = (index) => {
      swal.fire({
        title: 'Category',
        text: 'Are you sure, want to delete this category?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        focusCancel: true,
        customClass: {
          container: 'swal2-tailwind'
        }
      }).then(({ value }) => {
        if (value && value === true) {
          // TODO: swal wait dialog
          const categories = _.cloneDeep(pos.value.categories)
          const category = categories[index]
          categories.splice(index, 1)
          store.dispatch(SAVE_CATEGORIES, {
            call: posCalls.value.categories,
            data: categories
          }).then(response => {
            // Delete category products if any
            let products = _.cloneDeep(pos.value.products)
            if (products.length > 0) {
              products = products.filter(product => product.categoryID !== category.id)
              store.dispatch(SAVE_PRODUCTS, {
                call: posCalls.value.products,
                data: products
              }).then(response => {
                toast.success('Category deleted successfully')
              }).catch(error => {
                console.log(error)
                toast.error('Internal Server Error')
              })
            } else {
              toast.success('Category deleted successfully')
            }
          }).catch(error => {
            console.log(error)
            toast.error('Internal Server Error')
          })
        }
      })
    }

    onBeforeMount(() => {
      state.employee = _.find(pos.value.users, { isLoggedIn: 'true' })
    })

    return {
      translate,
      ...toRefs(state),
      filteredCategories,
      launchSaveCategoryModal,
      deleteCategory
    }
  }
}
</script>

<style scoped lang="scss">
.table-sm {
  thead {
    tr {
      th:first-child {
        @apply pl-3;
      }
    }
  }

  tbody {
    tr {
      td:first-child {
        @apply pl-3;
      }
    }
  }
}
</style>
