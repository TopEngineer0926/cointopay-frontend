<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-3">{{ translate('account.payout.address_book') }}</span>
        </div>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form v-if="form" @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('address_book.currency') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'currency') }}</div>
          </div>
          <v-select v-model="form.currency" :options="targetCurrencies"></v-select>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Select recipient type</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'targetLegalType') }}</div>
          </div>

          <label class="mr-4">
            <input v-model="form.targetLegalType" type="radio" value="PRIVATE"/>
            <span class="ml-3">Personal</span>
          </label>
          <label v-if="isBusiness">
            <input v-model="form.targetLegalType" type="radio" value="BUSINESS"/>
            <span class="ml-3">Business</span>
          </label>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Account holder name</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'accountHolderName') }}</div>
          </div>
          <input v-model="form.accountHolderName" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('IBAN')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ getLabel('IBAN') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.IBAN') }}</div>
          </div>
          <input v-model="form.details.IBAN" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('cardNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>UnionPay card number</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.cardNumber') }}</div>
          </div>
          <input v-model="form.details.cardNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('taxId')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Tax Id: CUIL / CUIT</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.taxId') }}</div>
          </div>
          <input v-model="form.details.taxId" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('bsbCode')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>BSB code</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.bsbCode') }}</div>
          </div>
          <input v-model="form.details.bsbCode" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('bankCode')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ getLabel('bankCode') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.bankCode') }}</div>
          </div>

          <select v-model="form.details.bankCode" class="form-select w-full">
            <option v-for="(bank, index) in banks" :key="index" :value="bank.code">
              {{ bank.title + ' [' + bank.code + ']' }}
            </option>
          </select>
        </div>

        <template v-if="form.currency === 'BRL'">
          <div v-if="isRequired('branchCode')" class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>Branch Code</label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'details.branchCode') }}</div>
            </div>
            <input v-model="form.details.branchCode" class="form-input w-full" type="text">
          </div>
        </template>
        <template v-if="form.currency !== 'BRL'">
          <div v-if="isRequired('branchCode')" class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <label>Branch name</label>
              <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.branchCode') }}</div>
            </div>
            <select v-model="form.details.branchCode" class="form-select w-full">
              <option v-for="(branch, index) in branches" :key="index" :value="branch.code">
                {{ branch.title }}
              </option>
            </select>
          </div>
        </template>

        <div v-if="isRequired('institutionNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Institution number</label>
            <div class="text-blue-500 text-sm">
              {{ showError(errorBag, 'details.institutionNumber') }}
            </div>
          </div>
          <input v-model="form.details.institutionNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('transitNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Transit number</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.transitNumber') }}</div>
          </div>
          <input v-model="form.details.transitNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('prefix')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Prefix</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.prefix') }}</div>
          </div>
          <input v-model="form.details.prefix" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('sortCode')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>UK Sort code</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.sortCode') }}</div>
          </div>
          <input v-model="form.details.sortCode" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('ifscCode')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>IFSC code</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.ifscCode') }}</div>
          </div>
          <input v-model="form.details.ifscCode" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('abartn')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Routing number</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.abartn') }}</div>
          </div>
          <input v-model="form.details.abartn" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('swiftCode') && selectedCurrency !== 'MYR'" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Swift code</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.swiftCode') }}</div>
          </div>
          <input v-model="form.details.swiftCode" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('bankCode') && selectedCurrency === 'MYR'" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Beneficiary's bank name</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.bankCode') }}</div>
          </div>
          <select v-model="form.details.bankCode" class="form-select w-full">
            <option v-for="(bank, index) in banks" :key="index" :value="bank.code">
              {{ bank.title + ' [' + bank.code + ']' }}
            </option>
          </select>
        </div>

        <div v-if="isRequired('clabe')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Recipient CLABE Number</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.clabe') }}</div>
          </div>
          <input v-model="form.details.clabe" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('accountType')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Account type</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.accountType') }}</div>
          </div>
          <select v-model="form.details.accountType" class="form-select w-full">
            <option v-if="selectedCurrency === 'JPY'" value="CURRENT">Current</option>
            <option value="CHECKING">Checking</option>
            <option value="SAVING">Saving</option>
          </select>
        </div>

        <div v-if="isRequired('accountNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ getLabel('accountNumber') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'details.accountNumber') }}</div>
          </div>
          <input v-model="form.details.accountNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('idDocumentType')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>ID document type</label>
            <div class="text-blue-500 text-sm">
              {{ showError(errorBag, 'details.idDocumentType') }}
            </div>
          </div>
          <input v-model="form.details.idDocumentType" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('idDocumentNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Beneficiary's identification number</label>
            <div class="text-blue-500 text-sm">
              {{ showError(errorBag, 'details.idDocumentNumber') }}
            </div>
          </div>
          <input v-model="form.details.idDocumentNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('rut')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Beneficiary's RUT number (Rol Único Tributario)</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.rut') }}</div>
          </div>
          <input v-model="form.details.rut" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('cpf')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Recipient tax ID/CPF</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.cpf') }}</div>
          </div>
          <input v-model="form.details.cpf" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('phoneNumber')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ getLabel('phoneNumber') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.phoneNumber') }}</div>
          </div>
          <input v-model="form.details.phoneNumber" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('russiaRegion')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Region</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.russiaRegion') }}</div>
          </div>
          <select v-model="form.details.russiaRegion" class="form-select w-full">
            <option v-for="(region, index) in regions" :key="index" :value="region.code">
              {{ region.title }}
            </option>
          </select>
        </div>

        <div v-if="isRequired('country')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Country</label>
            <div class="text-red-700 dark:text-red-400 text-sm">
              {{ showError(errorBag, 'details.address.country') }}
            </div>
          </div>
          <select v-model="form.details.address.country" class="form-select w-full">
            <option v-for="(country, key) in countriesList" :key="key" :value="key">{{ country }}</option>
          </select>
        </div>

        <div v-if="isRequired('state')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>State</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.address.state') }}</div>
          </div>
          <input v-model="form.details.address.state" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('city')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>City</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'details.address.city') }}</div>
          </div>
          <input v-model="form.details.address.city" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('postCode')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Postal code</label>
            <div class="text-red-700 dark:text-red-400 text-sm">
              {{ showError(errorBag, 'details.address.postCode') }}
            </div>
          </div>
          <input v-model="form.details.address.postCode" class="form-input w-full" type="text">
        </div>

        <div v-if="isRequired('firstLine')" class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>Address</label>
            <div class="text-red-700 dark:text-red-400 text-sm">
              {{ showError(errorBag, 'details.address.firstLine') }}
            </div>
          </div>
          <input v-model="form.details.address.firstLine" class="form-input w-full" type="text">
        </div>

        <div class="mb-2 mt-4">
          <div class="flex items-center justify-between mb-1">
            <j-button :disabled="isProcessing" @click="clearAll()" type="button">
              {{ translate('address_book.new') }}
            </j-button>
            <j-button :disabled="isProcessing">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('address_book.save') }}</span>
            </j-button>
          </div>
        </div>
      </form>
      <div v-if="isAvailable" style="max-height: 400px;"
           class="mt-4 w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
        <div v-for="(transferwiseAddresses, key) in addresses.transferwise" :key="key">
          <div v-if="transferwiseAddresses.length > 0">
            <hr class="border-gray-300 dark:border-gray-600"/>
            <h5 class="uppercase font-semibold text-lg mb-3">{{ key }}</h5>
            <div v-for="(address, index) in transferwiseAddresses" :key="index">
              <hr v-if="index > 0" class="border-gray-200 dark:border-gray-600 mb-2"/>
              <div class="flex items-start pr-3">
                <div class="flex-1">
                  <p>Target currency code: {{ address.currency }}</p>
                  <p>Account holder name: {{ address.accountHolderName }}</p>
                  <div class="mb-2">
                    <p v-for="(detail, i) in address.details" :key="i" :class="{'d-none': typeof detail === 'object'}">
                      {{ format(i) + ': ' + detail }}</p>
                    <div v-if="address.details.address">
                      <p v-for="(addr, i) in address.details.address" :key="i">
                        {{ format(i) + ': ' + addr }}</p>
                    </div>
                  </div>
                </div>
                <div class="w-40">
                  <j-button v-if="!setDefault" type="button" @click="selectAddress(address, key)"
                            size="w-full mb-2">
                    {{ translate('address_book.select') }}
                  </j-button>
                  <j-button v-else :buttonStyle="address.default ? 'danger' : 'success'"
                            :disabled="isProcessing"
                            size="w-full mb-2" type="button" @click="toggleAsDefault(address, key)">
                    <span v-if="!address.default">{{ translate('address_book.select_default') }}</span>
                    <span v-else>{{ translate('address_book.remove_default') }}</span>
                  </j-button>
                  <j-button type="button" @click="populateForm(address, index, key)" size="w-full mb-2"
                            :disabled="isProcessing">
                    {{ translate('address_book.edit') }}
                  </j-button>
                  <j-button buttonStyle="danger" @click="deleteAddress(index, key)" size="w-full"
                            :disabled="isProcessing">
                    {{ translate('address_book.delete') }}
                  </j-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import VueMultiselect from 'vue-multiselect'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { FETCH_ADDRESS_BOOK } from '@/store/keys'
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'
import axios from 'axios'

export default {
  name: 'TransferWiseModal',
  components: {
    Modal,
    Icon,
    JButton,
    'v-select': VueMultiselect
  },
  setup: function () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const emitter = inject('emitter')

    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      setDefault: false,
      targetCurrencies: [
        'AED', 'ARS', 'AUD', 'BDT', 'BGN', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY',
        'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL', 'GHS', 'HKD', 'HRK',
        'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'MYR', 'KES', 'LKR', 'MAD',
        'MXN', 'MYR', 'NGN', 'NOK', 'NPR', 'NZD', 'PEN', 'PHP', 'PKR', 'PLN',
        'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TZS', 'UAH', 'USD',
        'VND', 'ZAR'
      ],
      labels: {
        ARS: {
          accountNumber: 'Account number (CBU)'
        },
        BRL: {
          accountNumber: 'Account number with security digit'
        },
        IDR: {
          accountNumber: 'Account number (IDR accounts only)'
        },
        PHP: {
          accountNumber: 'Account number (PHP accounts only)'
        },
        UAH: {
          accountNumber: 'Last 4 digits of UAH PrivatBank card',
          phoneNumber: 'Use phone number registered in Privat Bank'
        },
        RUB: {
          bankCode: 'BIK (Bank Code)'
        },
        GBP: {
          accountNumber: 'Account number/IBAN'
        },
        HUF: {
          IBAN: 'IBAN/Local Account Number'
        },
        MYR: {
          swiftCode: 'BIC/SWIFT code'
        },
        NGN: {
          accountNumber: 'Account Number/NUBAN'
        },
        SEK: {
          IBAN: 'IBAN/Bankgiro number'
        }
      },
      banks: [],
      branches: [],
      regions: [
        {
          title: 'Adygea',
          code: 'ADYGEA'
        },
        {
          title: 'Altai Krai',
          code: 'ALTAIKRAI'
        },
        {
          title: 'Altai Republic',
          code: 'ALTAIREPUBLIC'
        },
        {
          title: 'Amur Oblast',
          code: 'AMUROBLAST'
        },
        {
          title: 'Arkhangelsk Oblast',
          code: 'ARKHANGELSKOBLAST'
        },
        {
          title: 'Astrakhan Oblast',
          code: 'ASTRAKHANOBLAST'
        },
        {
          title: 'Bashkortostan',
          code: 'BASHKORTOSTAN'
        },
        {
          title: 'Belgorod Oblast',
          code: 'BELGORODOBLAST'
        },
        {
          title: 'Bryansk Oblast',
          code: 'BRYANSKOBLAST'
        },
        {
          title: 'Buryatia',
          code: 'BURYATIA'
        },
        {
          title: 'Chechen Republic',
          code: 'CHECHENREPUBLIC'
        },
        {
          title: 'Chelyabinsk Oblast',
          code: 'CHELYABINSKOBLAST'
        },
        {
          title: 'Chukotka Autonomous Okrug',
          code: 'CHUKOTKAAUTONOMOUSOKRUG'
        },
        {
          title: 'Chuvash Republic',
          code: 'CHUVASHREPUBLIC'
        },
        {
          title: 'Crimea',
          code: 'CRIMEA'
        },
        {
          title: 'Dagestan',
          code: 'DAGESTAN'
        },
        {
          title: 'Ingushetia',
          code: 'INGUSHETIA'
        },
        {
          title: 'Irkutsk Oblast',
          code: 'IRKUTSKOBLAST'
        },
        {
          title: 'Ivanovo Oblast',
          code: 'IVANOVOOBLAST'
        },
        {
          title: 'Jewish Autonomous Oblast',
          code: 'JEWISHAUTONOMOUSOBLAST'
        },
        {
          title: 'Kabardino-Balkar Republic',
          code: 'KABARDINO'
        },
        {
          title: 'Kaliningrad Oblast',
          code: 'KALININGRADOBLAST'
        },
        {
          title: 'Kalmykia',
          code: 'KALMYKIA'
        },
        {
          title: 'Kaluga Oblast',
          code: 'KALUGAOBLAST'
        },
        {
          title: 'Kamchatka Krai',
          code: 'KAMCHATKAKRAI'
        },
        {
          title: 'Karachay-Cherkess Republic',
          code: 'KARACHAY'
        },
        {
          title: 'Karelia',
          code: 'KARELIA'
        },
        {
          title: 'Kemerovo Oblast',
          code: 'KEMEROVOOBLAST'
        },
        {
          title: 'Khabarovsk Krai',
          code: 'KHABAROVSKKRAI'
        },
        {
          title: 'Khakassia',
          code: 'KHAKASSIA'
        },
        {
          title: 'Khanty–Mansi Autonomous Okrug – Yugra',
          code: 'KHANTY'
        },
        {
          title: 'Kirov Oblast',
          code: 'KIROVOBLAST'
        },
        {
          title: 'Komi Republic',
          code: 'KOMIREPUBLIC'
        },
        {
          title: 'Kostroma Oblast',
          code: 'KOSTROMAOBLAST'
        },
        {
          title: 'Krasnodar Krai',
          code: 'KRASNODARKRAI'
        },
        {
          title: 'Krasnoyarsk Krai',
          code: 'KRASNOYARSKKRAI'
        },
        {
          title: 'Kurgan Oblast',
          code: 'KURGANOBLAST'
        },
        {
          title: 'Kursk Oblast',
          code: 'KURSKOBLAST'
        },
        {
          title: 'Leningrad Oblast',
          code: 'LENINGRADOBLAST'
        },
        {
          title: 'Lipetsk Oblast',
          code: 'LIPETSKOBLAST'
        },
        {
          title: 'Magadan Oblast',
          code: 'MAGADANOBLAST'
        },
        {
          title: 'Mari El Republic',
          code: 'MARIELREPUBLIC'
        },
        {
          title: 'Mordovia',
          code: 'MORDOVIA'
        },
        {
          title: 'Moscow',
          code: 'MOSCOW'
        },
        {
          title: 'Moscow Oblast',
          code: 'MOSCOWOBLAST'
        },
        {
          title: 'Murmansk Oblast',
          code: 'MURMANSKOBLAST'
        },
        {
          title: 'Nenets Autonomous Okrug',
          code: 'NENETSAUTONOMOUSOKRUG'
        },
        {
          title: 'Nizhny Novgorod Oblast',
          code: 'NIZHNYNOVGORODOBLAST'
        },
        {
          title: 'North Ossetia-Alania',
          code: 'NORTHOSSETIA'
        },
        {
          title: 'Novgorod Oblast',
          code: 'NOVGORODOBLAST'
        },
        {
          title: 'Novosibirsk Oblast',
          code: 'NOVOSIBIRSKOBLAST'
        },
        {
          title: 'Omsk Oblast',
          code: 'OMSKOBLAST'
        },
        {
          title: 'Orenburg Oblast',
          code: 'ORENBURGOBLAST'
        },
        {
          title: 'Oryol Oblast',
          code: 'ORYOLOBLAST'
        },
        {
          title: 'Penza Oblast',
          code: 'PENZAOBLAST'
        },
        {
          title: 'Perm Krai',
          code: 'PERMKRAI'
        },
        {
          title: 'Primorsky Krai',
          code: 'PRIMORSKYKRAI'
        },
        {
          title: 'Pskov Oblast',
          code: 'PSKOVOBLAST'
        },
        {
          title: 'Rostov Oblast',
          code: 'ROSTOVOBLAST'
        },
        {
          title: 'Ryazan Oblast',
          code: 'RYAZANOBLAST'
        },
        {
          title: 'Saint Petersburg',
          code: 'SAINTPETERSBURG'
        },
        {
          title: 'Sakha (Yakutia) Republic',
          code: 'SAKHA'
        },
        {
          title: 'Sakhalin Oblast',
          code: 'SAKHALINOBLAST'
        },
        {
          title: 'Samara Oblast',
          code: 'SAMARAOBLAST'
        },
        {
          title: 'Saratov Oblast',
          code: 'SARATOVOBLAST'
        },
        {
          title: 'Sevastopol',
          code: 'SEVASTOPOL'
        },
        {
          title: 'Smolensk Oblast',
          code: 'SMOLENSKOBLAST'
        },
        {
          title: 'Stavropol Krai',
          code: 'STAVROPOLKRAI'
        },
        {
          title: 'Sverdlovsk Oblast',
          code: 'SVERDLOVSKOBLAST'
        },
        {
          title: 'Tambov Oblast',
          code: 'TAMBOVOBLAST'
        },
        {
          title: 'Tatarstan',
          code: 'TATARSTAN'
        },
        {
          title: 'Tomsk Oblast',
          code: 'TOMSKOBLAST'
        },
        {
          title: 'Tula Oblast',
          code: 'TULAOBLAST'
        },
        {
          title: 'Tuva Republic',
          code: 'TUVAREPUBLIC'
        },
        {
          title: 'Tver Oblast',
          code: 'TVEROBLAST'
        },
        {
          title: 'Tyumen Oblast',
          code: 'TYUMENOBLAST'
        },
        {
          title: 'Udmurt Republic',
          code: 'UDMURTREPUBLIC'
        },
        {
          title: 'Ulyanovsk Oblast',
          code: 'ULYANOVSKOBLAST'
        },
        {
          title: 'Vladimir Oblast',
          code: 'VLADIMIROBLAST'
        },
        {
          title: 'Volgograd Oblast',
          code: 'VOLGOGRADOBLAST'
        },
        {
          title: 'Vologda Oblast',
          code: 'VOLOGDAOBLAST'
        },
        {
          title: 'Voronezh Oblast',
          code: 'VORONEZHOBLAST'
        }, {
          title: 'Yamalo-Nenets Autonomous Okrug',
          code: 'YAMALO'
        }, {
          title: 'Yaroslavl Oblast',
          code: 'YAROSLAVLOBLAST'
        },
        {
          title: 'Zabaykalsky Krai',
          code: 'ZABAYKALSKYKRAI'
        }
      ],
      selectedCurrency: null,
      form: null,
      errorBag: {},
      rules: {
        currency: ['required'],
        accountHolderName: ['required']
      },
      required: [],
      isProcessing: false,
      editIndex: null,
      confirmHook: () => {
      }
    })
    // Computed
    const user = computed(() => store.state.user)
    const isBusiness = computed(() => {
      return state.form.legalType ? state.form.legalType === 'BUSINESS'
        : (state.form.details) ? state.form.details.legalType === 'BUSINESS' : false
    })
    const countriesList = computed(() => {
      const countries = store.state.countries
      const values = Object.values(countries).sort()
      const result = {}
      const inverted = _.invert(countries)
      _.forEach(values, function (value) {
        const key = inverted[value]
        result[key] = value
      })
      return result
    })
    const addressesList = computed(() => store.state.addressBook)
    const getSelectedCurrencyConfig = computed(() => {
      const currenciesConfig = _.cloneDeep(store.state.transferWiseConfig)
      return state.selectedCurrency ? _.find(currenciesConfig, { currency: state.selectedCurrency }) : null
    })
    const isAvailable = computed(() => {
      return addressesList.value && Object.keys(addressesList.value.transferwise).length > 0
    })
    // Watch
    watch(() => _.cloneDeep(state.form),
      (newValue, oldValue) => {
        if (newValue.currency !== '' && newValue.currency !== oldValue.currency) {
          selectCurrency()
        }
        if (newValue.details && newValue.details.bankCode) {
          fetchBranches()
        }
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newValue, state.rules)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    // Get field label
    const getLabel = (key) => {
      let message = ''
      if (key === 'accountNumber') {
        message = 'Account number'
      } else if (key === 'phoneNumber') {
        message = 'Recipient\'s phone number'
      } else if (key === 'bankCode') {
        message = 'Bank name'
      } else if (key === 'IBAN') {
        message = 'IBAN'
      } else if (key === 'swiftCode') {
        message = 'SWIFT code'
      }
      return state.labels[state.selectedCurrency] && state.labels[state.selectedCurrency][key]
        ? state.labels[state.selectedCurrency][key] : message
    }

    const getCountryCode = (currency) => {
      const countries = {
        BDT: 'BD',
        BRL: 'BR',
        CLP: 'CL',
        EGP: 'EG',
        GHS: 'GH',
        HKD: 'HK',
        IDR: 'ID',
        ILS: 'IL',
        JPY: 'JP',
        KES: 'KE',
        LKR: 'LK',
        MAD: 'MA',
        MYR: 'MY',
        NGN: 'NG',
        NPR: 'NP',
        PEN: 'PE',
        PHP: 'PH',
        RUB: 'RU',
        SGD: 'SG',
        THB: 'TH',
        VND: 'VN',
        ZAR: 'ZA'
      }
      return countries[currency]
    }
    // Select currency
    const selectCurrency = () => {
      state.selectedCurrency = state.form.currency
      generateForm()
      // this.validate("currency");
      const currencies = ['BDT', 'BRL', 'CLP', 'EGP', 'GHS', 'HKD', 'ILS', 'JPY', 'KES', 'LKR', 'MAD',
        'MYR', 'NGN', 'IDR', 'NPR', 'PEN', 'PHP', 'RUB', 'SGD', 'THB', 'VND', 'ZAR'
      ]
      if (currencies.indexOf(state.selectedCurrency) !== -1) {
        fetchBanks()
      }
    }
    // Convert object to dot notation
    const recurse = (obj, current = null) => {
      for (const key in obj) {
        const value = obj[key]
        const newKey = (current ? current + '.' + key : key)
        if (value && typeof value === 'object') {
          recurse(value, newKey)
        } else {
          const tempKey = newKey.split('.')
          if (state.required.indexOf(tempKey[tempKey.length - 1]) !== -1) {
            state.rules[newKey] = ['required']
          }
        }
      }
    }
    // Generate form based on selected currency
    const generateForm = () => {
      if (getSelectedCurrencyConfig.value) {
        const config = _.cloneDeep(getSelectedCurrencyConfig.value)
        if (config && typeof config !== 'undefined') {
          state.required = config.required.split(',')
          delete config.required
          config.accountHolderName = ''
          config.targetLegalType = 'PRIVATE'
          state.form = config
          // Set rules
          state.rules = {
            currency: ['required'],
            accountHolderName: ['required']
          }
          recurse(config)
        }
      }
    }
    // Clear all
    const clearAll = () => {
      generateForm()
      state.editIndex = null
    }
    // Fetch banks from WISE
    const fetchBanks = () => {
      const countryCode = getCountryCode(state.selectedCurrency)
      axios.get(`https://api.transferwise.com/v1/banks?country=${countryCode}`, {
        headers: {
          Authorization: 'Bearer d11c23bb-a3cb-4285-bc57-d51858ef8bdf'
        }
      }).then((result) => {
        state.banks = result.data.values
      }).catch(error => {
        console.log(error)
      })
    }
    // Fetch branches from WISE
    const fetchBranches = () => {
      const bankCode = state.form.details.bankCode
      const countryCode = getCountryCode(state.selectedCurrency)
      const currencies = ['BDT', 'JPY', 'LKR', 'VND']
      if (currencies.indexOf(state.selectedCurrency) !== -1) {
        axios.get(`https://api.transferwise.com/v1/bank-branches?country=${countryCode}&bankCode=${bankCode}`, {
          headers: {
            Authorization: 'Bearer d11c23bb-a3cb-4285-bc57-d51858ef8bdf'
          }
        }).then((result) => {
          state.branches = result.data.values
        }).catch(error => {
          console.log(error)
        })
      }
    }
    // Checks is field is required
    const isRequired = (key) => {
      return state.required.indexOf(key) !== -1
    }

    const generateCompare = (currency) => {
      let compare = {
        currency: currency
      }
      state.required.forEach(key => {
        compare = Object.assign(compare, {
          details: {
            [key]: state.form.details[key]
          }
        })
      })
      return compare
    }

    const format = (key) => {
      const labels = {
        legalType: 'Legal type',
        taxId: 'Tax ID',
        accountNumber: 'Account number',
        bsbCode: 'Bsb code',
        ifscCode: 'IFSC Code',
        country: 'Country',
        city: 'City',
        state: 'State',
        postalCode: 'Postal code',
        firstLine: 'Address',
        abartn: 'Routing number',
        bankCode: 'Bank code',
        branchCode: 'Branch code',
        phoneNumber: 'Phone number',
        institutionNumber: 'Institution no.',
        transitNumber: 'Transit no.',
        rut: 'Beneficiary\'s RUT number (Rol Único Tributario)',
        cardNumber: 'UnionPay card number',
        prefix: 'Prefix',
        sortCode: 'UK Sort code',
        clabe: 'Recipient CLABE Number',
        cpf: 'Recipient tax ID/CPF',
        swiftCode: 'SWIFT code',
        idDocumentType: 'ID document type',
        idDocumentNumber: 'Beneficiary\'s identification number'
      }
      return (labels[key]) ? labels[key] : key
    }
    // Select address
    const selectAddress = (address, key) => {
      const transferWiseConfig = _.cloneDeep(store.state.transferWiseConfig)
      const config = _.find(transferWiseConfig, { currency: key })
      let obj = {
        targetCurrency: address.currency,
        accountHolderName: address.accountHolderName,
        legalType: address.legalType ? address.legalType : address.details.legalType,
        targetLegalType: address.targetLegalType
      }
      if (address.details.accountType) {
        obj = Object.assign(obj, {
          accountType: address.details.accountType
        })
      }
      const required = config.required.split(',')
      required.forEach(param => {
        const value = (address.details[param])
          ? address.details[param] : address.details.address[param]
        obj = Object.assign(obj, { [param]: value })
      })
      state.selectedCurrency = null
      state.confirmHook(obj)
      closeModal()
    }
    // Mark address as default
    const toggleAsDefault = (address, key) => {
      state.isProcessing = true
      const addresses = _.cloneDeep(addressesList.value)
      let message = 'Address marked as default successfully'
      Object.keys(addresses.transferwise).forEach((currency) => {
        addresses.transferwise[currency] = addresses.transferwise[currency].map((addr, i) => {
          const index = _.findIndex(addresses.transferwise[currency], address)
          if (index !== -1 && i === index) {
            addr.default = !addr.default
            if (!addr.default) {
              message = 'Address removed as default successfully'
            }
          } else {
            addr.default = false
          }
          return addr
        })
      })
      const fd = new FormData()
      fd.append('Call', 'UPDATE')
      fd.append('KeyData', 'AddressBook_' + user.value.ID)
      fd.append('ValueData', JSON.stringify(addresses))
      fd.append('MerchantID', user.value.ID)
      fd.append('APIKey', user.value.APIKey)
      fd.append('output', 'json')
      http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        state.isProcessing = false
        toast.success(message)
        saveNotification(message)
        store.dispatch(FETCH_ADDRESS_BOOK)
        state.confirmHook()
      }).catch(error => {
        state.isProcessing = false
        console.log(error.response)
      })
    }
    // Populate form with data
    const populateForm = (address, index, key) => {
      state.errorBag = {}
      state.selectedCurrency = key
      generateForm()
      setTimeout(() => {
        state.form = _.cloneDeep(address)
      }, 50)
      state.editIndex = index
    }
    // Delete specified address
    const deleteAddress = (index, key) => {
      state.isProcessing = true
      const addresses = _.cloneDeep(addressesList.value)
      addresses.transferwise[key].splice(index, 1)
      const fd = new FormData()
      fd.append('Call', 'UPDATE')
      fd.append('KeyData', 'AddressBook_' + user.value.ID)
      fd.append('ValueData', JSON.stringify(addresses))
      fd.append('MerchantID', user.value.ID)
      fd.append('APIKey', user.value.APIKey)
      fd.append('output', 'json')
      http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        state.isProcessing = false
        store.dispatch(FETCH_ADDRESS_BOOK)
        toast.success('Address deleted successfully')
        saveNotification('Address deleted successfully')
      }).catch(error => {
        state.isProcessing = false
        console.log(error.response)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const addresses = _.cloneDeep(addressesList.value)
        const action =
          Object.keys(addresses.crypto).length > 0 ||
          Object.keys(addresses.transferwise).length > 0 ? 'UPDATE' : 'INSERT'
        const data = state.form
        if (typeof addresses.transferwise[state.selectedCurrency] === 'undefined') {
          addresses.transferwise[state.selectedCurrency] = []
        }
        const compare = generateCompare(state.selectedCurrency)
        const index = _.findIndex(addresses.transferwise[state.selectedCurrency], compare)
        if (index !== -1) {
          addresses.transferwise[state.selectedCurrency][index] = data
        } else if (state.editIndex !== null) {
          addresses.transferwise[state.selectedCurrency][state.editIndex] = data
          state.editIndex = null
        } else {
          data.default = false
          addresses.transferwise[state.selectedCurrency].push(data)
        }
        const fd = new FormData()
        fd.append('Call', action)
        fd.append('KeyData', 'AddressBook_' + user.value.ID)
        fd.append('ValueData', JSON.stringify(addresses))
        fd.append('MerchantID', user.value.ID)
        fd.append('APIKey', user.value.APIKey)
        fd.append('output', 'json')
        http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(response => {
          state.isProcessing = false
          clearAll()
          store.dispatch(FETCH_ADDRESS_BOOK)
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('transferwiseModal', (args) => {
        state.form = {
          currency: '',
          accountHolderName: '',
          targetLegalType: 'PRIVATE'
        }
        state.setDefault = args.setDefault || false
        state.confirmHook = args.confirm
        // Reset
        state.errorBag = {}
        state.required = []
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      countriesList,
      isBusiness,
      addresses: addressesList,
      isAvailable,
      closeModal,
      showError,
      selectCurrency,
      getLabel,
      clearAll,
      isRequired,
      format,
      selectAddress,
      toggleAsDefault,
      populateForm,
      deleteAddress,
      submit
    }
  }
}
</script>

<style scoped></style>
