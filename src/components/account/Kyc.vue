<template>
  <form @submit.prevent="submit()">

    <div class="card">
      <h5 class="title">{{ translate('account.kyc.account_type') }}</h5>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">
        <div class="grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_account') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select v-if="accountInfo.FinalVerification === '0'" v-model="form.BusinessAccount"
                    class="form-select w-full">
              <option value="0">Personal</option>
              <option value="1">Business</option>
            </select>
            <input v-if="accountInfo.FinalVerification === '1'"
                   :value="form.BusinessAccount.toString()==='0' ? 'Personal' : 'Business'"
                   class="form-input w-full" readonly type="text">
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'BusinessAccount') }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Business Information -->
    <div v-if="form.BusinessAccount === '1'" class="card">
      <h5 class="title">{{ translate('account.kyc.business_information') }}</h5>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_name') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankName" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankName') }}</div>
          </div>
        </div>
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            Legal Entity Identifier (LEI)
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankLegalEntityIdentifier" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">
              {{ showError(errorBag, 'PayoutBankLegalEntityIdentifier') }}
            </div>
          </div>
        </div>
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_address') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankAddress" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankAddress') }}</div>
          </div>
        </div>
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_postal_code') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankPostalCode" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankPostalCode') }}</div>
          </div>
        </div>
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_city') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankCity" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankCity') }}</div>
          </div>
        </div>
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_state') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutBankState" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankState') }}</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.business_country') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select :class="`form-select w-full ${accountInfo.FinalVerification === '1' ? 'pointer-events-none' : ''}`"
                    v-model="form.PayoutBankCountry">
              <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
            </select>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBankCountry') }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Beneficiary Information -->
    <div class="card">
      <h5 class="title">{{ translate('account.kyc.beneficiary_information') }}</h5>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.first_name') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutFirstName" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutFirstName') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.last_name') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutLastName" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutLastName') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.full_name') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutFullName" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutFullName') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.birth_date') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <litepie-datepicker v-if="accountInfo.FinalVerification === '0'"
                                overlay as-single v-model="form.PayoutBirthDate"
                                :formatter="{ date: dateFormat, month: 'MMM' }"></litepie-datepicker>
            <input v-if="accountInfo.FinalVerification === '1'" :value="form.PayoutBirthDate"
                   class="form-input w-full" readonly type="text"/>
            <div>
              <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutBirthDate') }}</div>
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.pep') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <div class="flex items-center">
              <label class="mr-4 flex items-center">
                <input v-model="form.PEP" :disabled="accountInfo.FinalVerification === '1'" type="radio" value="1">
                <span class="ml-2">Yes</span>
              </label>
              <label class="flex items-center">
                <input v-model="form.PEP" :disabled="accountInfo.FinalVerification === '1'" type="radio" value="0">
                <span class="ml-2">No</span>
              </label>
            </div>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PEP') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.bank_address') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.payoutAddress" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'payoutAddress') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.bank_postal_code') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.payoutPostalCode" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'payoutPostalCode') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.bank_city') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.payoutCity" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'payoutCity') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.bank_state') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutState" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutState') }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.bank_country') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select :class="`form-select w-full ${accountInfo.FinalVerification === '1' ? 'pointer-events-none' : ''}`"
                    v-model="form.payoutCountry">
              <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
            </select>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'payoutCountry') }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Beneficiary Identity Information -->
    <div class="card">
      <h5 class="title">{{ translate('account.kyc.beneficiary_identity_information') }}</h5>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            Passport/Photo ID
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input id="passport" ref="passportElm" :hidden="accountInfo.FinalVerification === '1'"
                   type="file" @change="uploadFile('passport')"/>
            <div v-if="files.passport" class="mt-3">
              <img :src="files.passport" alt="" style="max-height: 70px;" @click="fancyBox(files.passport)">
            </div>
            <div>
              <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'passport') }}</div>
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <div class="col-span-3 md:col-span-1">
            <div class="flex items-center">
              <label>
                Profile image
                <span class="ml-1 text-red-500">*</span>
              </label>
              <span class="ml-1 cursor-pointer" v-tippy="{content: selfieWithIDTooltip}">
                <icon name="question-mark" classes="w-5 h-5 text-yellow-500"></icon>
              </span>
            </div>
          </div>
          <div class="col-span-3 md:col-span-2">
            <input ref="avatarElm" :hidden="accountInfo.FinalVerification === '1'"
                   type="file" @change="uploadFile('avatar')"/>
            <p class="mt-1">{{ translate('account.kyc.profile_image_help') }}</p>
            <div v-if="files.avatar" class="mt-3">
              <img :src="files.avatar" alt="" style="max-height: 70px;" @click="fancyBox(files.avatar)">
            </div>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'avatar') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.identity_type') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select :class="`form-select w-full ${accountInfo.FinalVerification === '1' ? 'pointer-events-none' : ''}`"
                    v-model="form.PayoutIdentityType">
              <option value="1">Identity Card</option>
              <option value="2">Passport</option>
              <option value="3">Driving License</option>
            </select>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutIdentityType') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.identity_number') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <input v-model="form.PayoutIdentityCardNr" :readonly="accountInfo.FinalVerification === '1'"
                   class="form-input w-full" type="text"/>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutIdentityCardNr') }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.identity_country') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select :class="`form-select w-full ${accountInfo.FinalVerification === '1' ? 'pointer-events-none' : ''}`"
                    v-model="form.PayoutIdentityCountry">
              <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
            </select>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'PayoutIdentityCountry') }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Income Source -->
    <div class="card">
      <h5 class="title">{{ translate('account.kyc.income_source') }}</h5>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="body">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.income_source') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <select :class="`form-select w-full ${accountInfo.FinalVerification === '1' ? 'pointer-events-none' : ''}`"
                    v-model="incomeSource.source">
              <option value="">Select Income Source</option>
              <option v-for="(source, index) in incomeSources" :key="index" :value="source">{{ source }}</option>
            </select>
          </div>
        </div>
        <div v-if="incomeSource.source.toLowerCase() === 'other'" class="grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.kyc.income_detail') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <textarea v-model="incomeSource.detail" class="form-select w-full" rows="3"></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-right">
      <j-button :disabled="isProcessing" buttonStyle="danger" type="button" @click="removeAccount()">
        <div v-if="isProcessing" class="mr-3">
          <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
        </div>
        <span>{{ translate('account.kyc.remove_account') }}</span>
      </j-button>
      <j-button :disabled="isProcessing || accountInfo.FinalVerification === '1' || !isProvidedIncomeSource"
                class="ml-3">
        <div v-if="isProcessing" class="mr-3">
          <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
        </div>
        <span>{{ translate('account.button_update') }}</span>
      </j-button>
    </div>
  </form>
</template>

<script>
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import LitepieDatepicker from 'litepie-datepicker'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import validator from '@/validator'
import { useCookies } from 'vue3-cookies'
import * as moment from 'moment-timezone'
import { UPDATE_ACCOUNT_INFO, REMOVE_ACCOUNT, LOGOUT } from '@/store/keys'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'Kyc',
  components: {
    LitepieDatepicker,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const swal = inject('swal')
    // Store
    const store = useStore()
    // Router
    const router = useRouter()
    // Cookies
    const { cookies } = useCookies()
    const {
      validate,
      showError
    } = validator()
    const { saveNotification, fancyBox } = compositionUtils()

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const user = computed(() => store.state.user)
    const countries = computed(() => store.state.countries.filter(c => c.code !== ''))
    const dateFormat = computed(() => {
      let format = 'YYYY/MM/DD'
      const locale = store.state.locale
      if (locale) {
        switch (locale.toLowerCase()) {
          case 'en':
            format = 'MM/DD/YYYY'
            break
          case 'de':
            format = 'MM.DD.YYYY'
            break
          case 'es':
          case 'it':
          case 'fr':
          case 'pt':
            format = 'DD/MM/YYYY'
            break
          case 'ru':
            format = 'DD.MM.YYYY'
            break
          case 'nl':
            format = 'DD-MM-YYYY'
            break
          case 'cn':
            format = 'YYYY-MM-DD'
            break
          default:
            break
        }
      }
      return format
    })
    const selfieWithIDTooltip = computed(() => {
      return `
        <div class='img-container-tooltip'><img style='width:300px' src='/help_placeholder.png' alt='Image'/></div>
      `
    })
    const isProvidedIncomeSource = computed(() => {
      let isValid = true
      if (state.incomeSource.source === '') {
        isValid = false
      } else if (state.incomeSource.source.toLowerCase() === 'other' && state.incomeSource.detail === '') {
        isValid = false
      }
      return isValid
    })

    // State
    const passportElm = ref(null)
    const avatarElm = ref(null)
    const state = reactive({
      form: {
        BusinessAccount: '',
        PayoutBankName: '',
        PayoutBankLegalEntityIdentifier: '',
        PayoutBankAddress: '',
        PayoutBankPostalCode: '',
        PayoutBankCity: '',
        PayoutBankState: '',
        PayoutBankCountry: '',
        PayoutFullName: '',
        PayoutBirthDate: '',
        PEP: '',
        PayoutFirstName: '',
        PayoutLastName: '',
        payoutAddress: '',
        payoutPostalCode: '',
        payoutCity: '',
        PayoutState: '',
        payoutCountry: '',
        PayoutIdentityCardNr: '',
        PayoutIdentityType: '',
        PayoutIdentityCountry: ''
      },
      files: {
        passport: '',
        avatar: ''
      },
      filesCall: 'INSERT',
      incomeSources: [
        'Salary',
        'Savings',
        'Gifts',
        'Inherited',
        'Other'
      ],
      incomeSource: {
        source: '',
        detail: ''
      },
      incomeSourceAction: 'INSERT',
      errorBag: {},
      rules: {
        BusinessAccount: ['required'],
        PayoutBankName: ['required_if:BusinessAccount,1'],
        PayoutBankAddress: [
          'required_if:BusinessAccount,1',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutBankPostalCode: [
          'required_if:BusinessAccount,1',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutBankCity: [
          'required_if:BusinessAccount,1',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutBankState: [
          'required_if:BusinessAccount,1',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutBankCountry: [
          'required_if:BusinessAccount,1',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutFullName: ['required'],
        PayoutBirthDate: ['required'],
        PEP: ['required'],
        PayoutFirstName: ['required'],
        PayoutLastName: ['required'],
        payoutAddress: [
          'required',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        payoutPostalCode: [
          'required',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        payoutCity: [
          'required',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        PayoutState: [
          'required',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        payoutCountry: [
          'required',
          'regex:/^[:/0-9a-zA-Z-,.!@#$^&_*/=+?| ]+$/'
        ],
        passport: ['required'],
        avatar: ['required'],
        PayoutIdentityCardNr: ['required'],
        PayoutIdentityType: ['required'],
        PayoutIdentityCountry: ['required']
      },
      messages: {
        BusinessAccount: {
          required: 'Please select your account type'
        },
        PayoutBankName: {
          required: 'Business name is required'
        },
        PayoutBankAddress: {
          required: 'Business address is required',
          regex: 'Please provide a valid business address'
        },
        PayoutBankPostalCode: {
          required: 'Business postal code is required',
          regex: 'Please provide a valid business postal code'
        },
        PayoutBankCity: {
          required: 'Business city is required',
          regex: 'Please provide a valid business city'
        },
        PayoutBankState: {
          required: 'Business state is required',
          regex: 'Please provide a valid business state'
        },
        PayoutBankCountry: {
          required: 'Business country is required',
          regex: 'Please provide a valid business country'
        },
        PayoutFirstName: {
          required: 'First name is required'
        },
        PayoutLastName: {
          required: 'Last name is required'
        },
        PayoutFullName: {
          required: 'Beneficiary full name is required'
        },
        PayoutBirthDate: {
          required: 'Beneficiary birth date is required',
          date_format: 'Please provide date in format ' + dateFormat.value
        },
        PEP: {
          required: 'Please select one the options'
        },
        payoutAddress: {
          required: 'Beneficiary address is required',
          regex: 'Please provide a valid beneficiary address'
        },
        payoutPostalCode: {
          required: 'Postal code is required',
          regex: 'Please provide a valid postal code'
        },
        payoutCity: {
          required: 'City is required',
          regex: 'Please provide a valid city name'
        },
        PayoutState: {
          required: 'State is required',
          regex: 'Please provide a valid state name'
        },
        payoutCountry: {
          required: 'Country is required',
          regex: 'Please provide a valid country name'
        },
        passport: {
          required: 'Passport is required'
        },
        avatar: {
          required: 'A selfie of you holding the Photo ID incl. date and nick/username is required'
        },
        PayoutIdentityCardNr: {
          required: 'Identity card number is required'
        },
        PayoutIdentityType: {
          required: 'Identity type is required'
        },
        PayoutIdentityCountry: {
          required: 'Identity issue country is required'
        }
      },
      isProcessing: false
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      }
    )

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchFiles = () => {
      const payload = {
        POSDATA: '',
        Call: 'SHOW',
        KeyData: 'FILES_' + accountInfo.value.ID,
        MerchantID: accountInfo.value.ID,
        APIKey: accountInfo.value.APIkey,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/MarketAPI`, {
        params: payload
      }).then(response => {
        state.isProcessing = false
        if (response.data !== 'nothing found') {
          if (typeof response.data.avatar === 'undefined') {
            state.files = {
              passport: '',
              avatar: ''
            }
          } else {
            state.files = response.data
            state.form.avatar = state.files.avatar
            state.form.passport = state.files.passport
            state.filesCall = 'UPDATE'
          }
        }
      }).catch(error => {
        state.isProcessing = true
        console.log(error.response)
      })
    }
    const uploadFile = (key) => {
      const files = (key === 'passport') ? passportElm.value.files : avatarElm.value.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const fd = new FormData()
          fd.append('file123', file)
          fd.append('MerchantID', accountInfo.value.ID)
          fd.append('secure', true)
          // Upload it to amazon S3
          http.post(`${apiBaseUrl}/MarketAPI?POSBLOB`, fd, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(response => {
            if (response.status === 200) {
              let oldFile = ''
              const action = state.filesCall
              if (action === 'UPDATE') {
                const f = { ...state.files }
                let url = (key === 'passport') ? f.passport : f.avatar
                url = url.split('ID=')
                oldFile = url[url.length - 1]
              }
              if (key === 'passport') {
                state.files.passport = response.data
              } else {
                state.files.avatar = response.data
              }
              passportElm.value.value = ''
              avatarElm.value.value = ''
              const payload = {
                POSDATA: '',
                Call: action,
                KeyData: 'FILES_' + accountInfo.value.ID,
                ValueData: JSON.stringify(state.files),
                MerchantID: accountInfo.value.ID,
                APIKey: accountInfo.value.APIkey,
                output: 'json'
              }
              http.get(`${apiBaseUrl}/MarketAPI`, {
                params: payload
              }).then(response => {
                state.isProcessing = true
                state.filesCall = 'UPDATE'
                // Delete old file if any
                if (oldFile) {
                  http.get(`${apiBaseUrl}/MarketAPI?POSBLOB`, {
                    params: {
                      MerchantID: accountInfo.value.ID,
                      secure: true,
                      secureString: oldFile
                    }
                  }).then(response => {
                    console.log(response)
                  }).catch(error => {
                    console.log(error)
                  })
                }
                fetchFiles()
              }).catch(error => {
                state.isProcessing = false
                console.log(error.response)
              })
            }
          }).catch(error => {
            console.log(error)
          })
        } else {
          // Clear file
          passportElm.value.value = ''
          avatarElm.value.value = ''
          toast.error('Please provide a valid image file')
        }
      }
    }
    const getIncomeSourceData = () => {
      http.get(`${apiBaseUrl}/MarketAPI`, {
        params: {
          POSDATA: '',
          Call: 'SHOW',
          KeyData: accountInfo.value.ID + '_kyc',
          MerchantID: accountInfo.value.ID,
          APIKey: accountInfo.value.APIkey
        }
      }).then(response => {
        if (response.data === 'nothing found') {
          state.incomeSourceAction = 'INSERT'
          state.incomeSource = {
            source: '',
            detail: ''
          }
        } else {
          state.incomeSourceAction = 'UPDATE'
          state.incomeSource = response.data
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const saveIncomeSource = () => {
      const fd = new FormData()
      fd.append('Call', state.incomeSourceAction)
      fd.append('KeyData', accountInfo.value.ID + '_kyc')
      fd.append('ValueData', JSON.stringify(state.incomeSource))
      fd.append('MerchantID', accountInfo.value.ID)
      fd.append('APIKey', accountInfo.value.APIkey)
      fd.append('output', 'json')
      http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        if (response.status === 200) {
          state.incomeSourceAction = 'UPDATE'
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        saveIncomeSource()
        if (accountInfo.value) {
          const payload = {
            ...accountInfo.value,
            BusinessAccount: state.form.BusinessAccount,
            PayoutBankName: state.form.PayoutBankName,
            PayoutBankLegalEntityIdentifier: state.form.PayoutBankLegalEntityIdentifier,
            PayoutBankAddress: state.form.PayoutBankAddress,
            PayoutBankPostalCode: state.form.PayoutBankPostalCode,
            PayoutBankCity: state.form.PayoutBankCity,
            PayoutBankState: state.form.PayoutBankState,
            PayoutBankCountry: state.form.PayoutBankCountry,
            PayoutFirstName: state.form.PayoutFirstName,
            PayoutLastName: state.form.PayoutLastName,
            PayoutFullName: state.form.PayoutFullName,
            PayoutBirthDate: state.form.PayoutBirthDate,
            PEP: state.form.PEP,
            PayoutAddress: state.form.payoutAddress,
            PayoutPostalCode: state.form.payoutPostalCode,
            PayoutCity: state.form.payoutCity,
            PayoutState: state.form.PayoutState,
            PayoutCountry: state.form.payoutCountry,
            PayoutIdentityType: state.form.PayoutIdentityType,
            PayoutIdentityCardNr: state.form.PayoutIdentityCardNr,
            PayoutIdentityCountry: state.form.PayoutIdentityCountry
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('KYC/AML settings updated successfully')
              saveNotification('KYC/AML settings updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }
    const removeAccount = () => {
      swal.fire({
        text: 'You want your right to be forgotten executed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        focusCancel: true
      }).then(({ dismiss }) => {
        if (dismiss !== 'cancel') {
          state.isProcessing = true
          const payload = {
            Call: 'DisableAccount',
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            output: 'json'
          }
          store.dispatch(REMOVE_ACCOUNT, payload).then(response => {
            if (response.status === 200) {
              // Show success toast
              const message = response.data.message
              store.dispatch(LOGOUT, user.value.SessionID).then(response => {
                if (response.toLowerCase() === 'success') {
                  // Clear cookie
                  cookies.remove('JSESSIONID')
                  toast.warning(message)
                  saveNotification(message)
                  router.push('/')
                }
              }).catch(error => {
                console.log(error)
              })
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      })
    }

    onBeforeMount(() => {
      state.form = {
        BusinessAccount: accountInfo.value.BusinessAccount,
        PayoutBankName: accountInfo.value.PayoutBankName,
        PayoutBankLegalEntityIdentifier: accountInfo.value.PayoutBankLegalEntityIdentifier,
        PayoutBankAddress: accountInfo.value.PayoutBankAddress,
        PayoutBankPostalCode: accountInfo.value.PayoutBankPostalCode,
        PayoutBankCity: accountInfo.value.PayoutBankCity,
        PayoutBankState: accountInfo.value.PayoutBankState,
        PayoutBankCountry: accountInfo.value.PayoutBankCountry,
        PayoutFirstName: accountInfo.value.PayoutFirstName === null ? '' : accountInfo.value.PayoutFirstName,
        PayoutLastName: accountInfo.value.PayoutLastName === null ? '' : accountInfo.value.PayoutLastName,
        PayoutFullName: accountInfo.value.PayoutFullName === null ? '' : accountInfo.value.PayoutFullName,
        PayoutBirthDate: moment.tz(new Date(accountInfo.value.PayoutBirthDate), 'Atlantic/Azores').format(dateFormat.value),
        PEP: accountInfo.value.PEP,
        payoutAddress: accountInfo.value.PayoutAddress,
        payoutPostalCode: accountInfo.value.PayoutPostalCode,
        payoutCity: accountInfo.value.PayoutCity,
        PayoutState: accountInfo.value.PayoutState !== null ? accountInfo.value.PayoutState : '',
        payoutCountry: accountInfo.value.PayoutCountry,
        PayoutIdentityType: accountInfo.value.PayoutIdentityType === null ? '' : accountInfo.value.PayoutIdentityType,
        PayoutIdentityCardNr: accountInfo.value.PayoutIdentityCardNr === null ? '' : accountInfo.value.PayoutIdentityCardNr,
        PayoutIdentityCountry: accountInfo.value.PayoutIdentityCountry === null ? '' : accountInfo.value.PayoutIdentityCountry
      }
      fetchFiles()
      getIncomeSourceData()
    })

    return {
      translate,
      ...toRefs(state),
      passportElm,
      avatarElm,
      dateFormat,
      selfieWithIDTooltip,
      isProvidedIncomeSource,
      accountInfo,
      countries,
      showError,
      uploadFile,
      submit,
      removeAccount,
      fancyBox
    }
  }
}
</script>

<style scoped></style>
