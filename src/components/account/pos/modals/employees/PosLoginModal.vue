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
          <input class="form-input w-full" readonly type="text" v-model="form.username"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.employees.password') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'password') }}</div>
          </div>
          <input class="form-input w-full" type="password" v-model="form.password"/>
          <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'password') }}</div>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.employees.btn_login') }}</span>
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
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_EMPLOYEES } from '@/store/keys'

export default {
  name: 'PosLoginModal',
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

    const store = useStore()

    const {
      showError,
      validate
    } = validator()
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      index: -1,
      loggedInEmployee: null,
      form: {
        username: '',
        password: ''
      },
      errorBag: {},
      rules: {},
      messages: {},
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
        const formData = state.form
        const users = _.cloneDeep(pos.value.users)
        const user = users[state.index]
        if (user.USERNAME === formData.username && user.PIN === formData.password) {
          if (state.loggedInEmployee) {
            users.filter(user => {
              if (user.ID === state.loggedInEmployee.ID && user.USERNAME === state.loggedInEmployee.USERNAME) {
                user.isLoggedIn = 'false'
              }
            })
          }
          users[state.index].isLoggedIn = 'true'
          store.dispatch(SAVE_EMPLOYEES, {
            call: posCalls.value.users,
            data: users
          }).catch(error => {
            console.log(error)
          })
          closeModal()
        } else {
          toast.error('Please provide a valid password/pin')
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('posLoginModal', (args) => {
        state.loggedInEmployee = args.loggedInEmployee
        state.index = args.index
        state.type = args.type
        state.form = {
          username: args.employee ? args.employee.USERNAME : '',
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
      showError,
      closeModal,
      submit
    }
  }
}
</script>

<style scoped>

</style>
