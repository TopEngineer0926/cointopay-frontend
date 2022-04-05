<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <div class="body">
          <div class="text-right mb-3">
            <j-button @click="launchSaveEmployeeModal()" type="button">
              {{ translate('pos.employees.btn_add') }}
            </j-button>
          </div>
          <table class="table-sm">
            <tbody>
            <tr v-for="(employee, i) in employees" :key="i">
              <td>
                <div class="flex items-center cursor-pointer" @click="login(i)">
                  <icon name="user-circle"
                        :classes="`w-8 h-8 ${isLoggedIn(employee) ? 'text-blue-500' : ''}`"></icon>
                  <span class="cursor-pointer ml-3 text-base">{{ employee.USERNAME }}</span>
                </div>
              </td>
              <td class="text-right">
                <div class="pr-3" v-if="employee.isParentUser === 'false'">
                  <button @click="launchSaveEmployeeModal(employee, i)"
                          class="mr-2 hover:text-blue-500"
                          v-if="loggedInEmployee && loggedInEmployee.isParentUser === 'true'">
                    <icon name="edit"></icon>
                  </button>
                  <button @click="deleteEmployee(i)" class="hover:text-red-500"
                          v-if="loggedInEmployee && loggedInEmployee.isParentUser === 'true'">
                    <icon name="trash"></icon>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Save Employee Modal -->
  <save-employee-modal></save-employee-modal>
  <!-- Employee Login Modal -->
  <pos-login-modal></pos-login-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import SaveEmployeeModal from '@/components/account/pos/modals/employees/SaveEmployeeModal'
import PosLoginModal from '@/components/account/pos/modals/employees/PosLoginModal'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_EMPLOYEES } from '@/store/keys'

export default {
  name: 'Employees',
  components: {
    'pos-layout': POSLayout,
    JButton,
    Icon,
    SaveEmployeeModal,
    PosLoginModal
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const swal = inject('swal')
    const toast = inject('toast')

    // Store
    const store = useStore()

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const employees = computed(() => pos.value.users)
    const loggedInEmployee = computed(() => {
      return _.find(pos.value.users, { isLoggedIn: 'true' })
    })

    // Methods
    const isLoggedIn = (employee) => {
      return loggedInEmployee.value && employee.ID === loggedInEmployee.value.ID
    }
    const login = (index) => {
      const users = _.cloneDeep(pos.value.users)
      const employee = users[index]
      const type = employee.isParentUser === 'true' ? 'password' : 'pin'
      if (employee.isLoggedIn === 'false' || employee.ID !== loggedInEmployee.value.ID) {
        emitter.emit('posLoginModal', {
          employee: employee,
          type: type,
          loggedInEmployee: loggedInEmployee.value,
          index: index
        })
      }
    }
    const launchSaveEmployeeModal = (employee = null, i = null) => {
      emitter.emit('saveEmployeeModal', {
        employee: employee,
        index: i
      })
    }
    const deleteEmployee = (index) => {
      swal.fire({
        title: 'Employee',
        text: 'Are you sure, want to delete this employee?',
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
          const users = _.cloneDeep(pos.value.users)
          users.splice(index, 1)
          store.dispatch(SAVE_EMPLOYEES, {
            call: posCalls.value.users,
            data: users
          }).then(response => {
            toast.success('Employee deleted successfully')
          }).catch(error => {
            console.log(error)
            toast.error('Internal Server Error')
          })
        }
      })
    }

    return {
      translate,
      employees,
      loggedInEmployee,
      isLoggedIn,
      login,
      launchSaveEmployeeModal,
      deleteEmployee
    }
  }
}
</script>

<style scoped lang="scss">
.table-sm {
  tbody {
    tr {
      td:first-child {
        @apply pl-3;
      }
    }
  }
}
</style>
