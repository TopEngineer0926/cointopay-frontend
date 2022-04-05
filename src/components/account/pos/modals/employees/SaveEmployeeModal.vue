<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.employees.title') }}</span>
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
            <label>{{ translate('pos.employees.username') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'username') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.username"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.employees.password') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'password') }}</div>
          </div>
          <input class="form-input w-full" placeholder="000000" type="text" v-model="form.password"/>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.employees.btn_save') }}</span>
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
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import validator from '@/validator'
import * as _ from 'lodash'
import { useStore } from 'vuex'
import { SAVE_EMPLOYEES } from '@/store/keys'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'SaveEmployeeModal',
  components: {
    Modal,
    Icon,
    JButton
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
    const { generateId } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      employee: null,
      type: 'pin',
      index: -1,
      form: {
        username: '',
        password: ''
      },
      errorBag: {},
      rules: {},
      messages: null,
      isProcessing: false
    })
    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      }
    )

    // Methods
    const closeModal = () => {
      state.show = false
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const formData = state.form
        const users = _.cloneDeep(pos.value.users)
        let isValid = true
        if (state.employee) {
          if (_.findIndex(users, user => {
            return (user.USERNAME === formData.username && user.ID !== state.employee.ID)
          }) === -1) {
            users[state.index].USERNAME = formData.username
            users[state.index].PIN = formData.password
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Username already exists!')
          }
        } else {
          if (_.findIndex(users, { USERNAME: formData.username }) === -1) {
            users.push({
              ID: generateId(pos.value.users),
              PIN: formData.password,
              USERNAME: formData.username,
              isLoggedIn: 'false',
              isParentUser: 'false'
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Username already exists!')
          }
        }
        if (isValid) {
          store.dispatch(SAVE_EMPLOYEES, {
            call: posCalls.value.users,
            data: users
          }).then(response => {
            state.isProcessing = false
            const message = state.employee ? 'Employee updated successfully' : 'Employee added successfully'
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
      emitter.on('saveEmployeeModal', (args) => {
        state.employee = args.employee || null
        state.index = args.index || -1
        state.type = state.employee && state.employee.isParentUser === 'true' ? 'password' : 'pin'
        state.form = {
          username: state.employee ? state.employee.USERNAME : '',
          password: ''
        }
        state.rules = {
          username: ['required'],
          password: state.type === 'password' ? ['required'] : ['required', 'regex:/^[0-9]{6}$/']
        }
        state.messages = {
          username: {
            required: 'Username is required'
          },
          password: {
            required: state.type === 'password' ? 'Password is required' : 'PIN is required',
            regex: 'Please enter a 6 digit pin'
          }
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
