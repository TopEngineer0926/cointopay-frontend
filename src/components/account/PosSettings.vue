<template>
  <div class="card">
    <h5 class="title">{{ translate('pos.pos_manager') }}</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body text-center">
      <router-link tag="a" to="/account/pos/products"
                   class="btn btn-warning">
        {{ translate('account.btn_manage_pos') }}
      </router-link>
    </div>
  </div>
  <div class="card">
    <h5 class="title">{{ translate('pos.social_detail') }}</h5>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
        <label for="avatar" class="col-span-3 md:col-span-1">POS Logo</label>
        <div class="col-span-3 md:col-span-2">
          <input @change="uploadFile()" id="avatar" ref="logo" type="file"/>
          <div style="margin-top: 8px" v-if="avatar">
            <img :src="avatar" alt="" style="max-height: 70px;">
          </div>
        </div>
      </div>
      <form @submit.prevent="submit()">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">Social Url</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.SocialURL"/>
            <div class="text-red-500 text-sm">
              {{ showError(errorBag, 'SocialURL') }}
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">Facebook</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.SocialFacebook"/>
            <div class="text-red-500 text-sm">
              {{ showError(errorBag, 'SocialFacebook') }}
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">Twitter</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.SocialTwitter"/>
            <div class="text-red-500 text-sm">
              {{ showError(errorBag, 'SocialTwitter') }}
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">Reddit</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.SocialReddit"/>
            <div class="text-red-500 text-sm">
              {{ showError(errorBag, 'SocialReddit') }}
            </div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">LinkedIn</label>
          <div class="col-span-3 md:col-span-2">
            <input type="text" class="form-input w-full" v-model="form.SocialLinkedIn"/>
            <div class="text-red-500 text-sm">
              {{ showError(errorBag, 'SocialLinkedIn') }}
            </div>
          </div>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('account.button_update') }}</span>
          </j-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, ref, toRefs, watch } from 'vue'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'PosSettings',
  components: {
    JButton,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    // Store
    const store = useStore()
    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()
    // State
    const logo = ref(null)
    const state = reactive({
      form: {
        SocialURL: '',
        SocialTwitter: '',
        SocialFacebook: '',
        SocialReddit: '',
        SocialLinkedIn: ''
      },
      avatar: '',
      errorBag: {},
      rules: {
        SocialURL: ['url'],
        SocialTwitter: ['regex:/http(?:s)?:\\/\\/(?:www\\.)?twitter\\.com\\/([a-zA-Z0-9_]+)/'],
        SocialFacebook: ['regex:/(?:https?:\\/\\/)?(?:www\\.)?facebook\\.com\\/.(?:(?:\\w)*#!\\/)?(?:pages\\/)?(?:[\\w-]*\\/)*([\\w\\-.]*)/'],
        SocialReddit: ['regex:/http(s)?:\\/\\/(www\\.)?reddit\\.com\\/r\\/[A-z0-9_-]+\\/?/'],
        SocialLinkedIn: ['regex:/http(s)?:\\/\\/(www\\.)?linkedin\\.com\\/in\\/[A-z0-9_-]+\\/?/']
      },
      messages: {
        SocialURL: {
          url: 'Please provide a valid url'
        },
        SocialTwitter: {
          regex: 'Please provide a valid twitter profile url'
        },
        SocialFacebook: {
          regex: 'Please provide a valid facebook profile url'
        },
        SocialReddit: {
          regex: 'Please provide a valid reddit url'
        },
        SocialLinkedIn: {
          regex: 'Please provide a valid linkedIn profile url'
        }
      },
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)

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
    const uploadFile = () => {
      const files = logo.value.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const fd = new FormData()
          fd.append('file123', file)
          fd.append('MerchantID', accountInfo.value.ID)
          // Upload it to amazon S3
          http.post(`${apiBaseUrl}/MarketAPI?POSBLOB`, fd, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(response => {
            let oldFile = ''
            if (response.status === 200) {
              logo.value.value = ''
              state.avatar = response.data
              if (accountInfo.value) {
                const payload = { ...accountInfo.value }
                if (payload.Avatar) {
                  const url = payload.Avatar.split('ID=')
                  oldFile = url[url.length - 1]
                }
                payload.Avatar = state.avatar
                store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
                  if (response.status === 200) {
                    // Delete old file if any
                    if (oldFile) {
                      http.get(`${apiBaseUrl}/MarketAPI?POSBLOB`, {
                        params: {
                          MerchantID: accountInfo.value.ID,
                          deleteString: oldFile
                        }
                      }).then(response => {
                        console.log(response)
                      }).catch(error => {
                        console.log(error)
                      })
                    }
                    // Show success toast
                    toast.success('Merchant logo updated successfully')
                  }
                }).catch(error => {
                  toast.error(error.data.message)
                })
              }
            }
          }).catch(error => {
            console.log(error)
          })
        } else {
          // Clear file
          logo.value.value = ''
          toast.error('Please provide a valid image file')
        }
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        if (accountInfo.value) {
          const payload = {
            ...accountInfo.value,
            SocialOn: 1,
            SocialURL: state.form.SocialURL,
            SocialTwitter: state.form.SocialTwitter,
            SocialFacebook: state.form.SocialFacebook,
            SocialReddit: state.form.SocialReddit,
            SocialLinkedIn: state.form.SocialLinkedIn
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Social information updated successfully')
              saveNotification('Social information updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }

    onBeforeMount(() => {
      state.form = {
        SocialURL: accountInfo.value.SocialURL,
        SocialTwitter: accountInfo.value.SocialTwitter,
        SocialFacebook: accountInfo.value.SocialFacebook,
        SocialReddit: accountInfo.value.SocialReddit,
        SocialLinkedIn: accountInfo.value.SocialLinkedIn
      }
      state.avatar = accountInfo.value.Avatar
    })

    return {
      translate,
      ...toRefs(state),
      logo,
      showError,
      uploadFile,
      submit
    }
  }
}
</script>

<style scoped>

</style>
