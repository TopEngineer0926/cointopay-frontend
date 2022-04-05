<template>
  <div class="relative" v-click-away="() => { dropdown = false }">
    <div>
      <button aria-expanded="false" aria-haspopup="true"
              class="flex" type="button" @click="dropdown = !dropdown">
        <span class="sr-only">Open user menu</span>
        <span v-if="selectedLanguage"
              class="inline-block flex items-center text-sm justify-center rounded">
          <img :src="selectedLanguage.flag" alt=""/>&nbsp;&nbsp;{{ selectedLanguage.naam }}
        </span>
      </button>
    </div>
    <div v-if="dropdown" aria-orientation="vertical"
         class="absolute bottom-6 left-0 mt-2 w-36 rounded-md shadow-lg py-2 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
         role="menu" tabindex="-1">
      <a v-for="(language, locale) in languages" :key="locale"
         :class="{ 'bg-gray-200 dark:bg-gray-900': selectedLanguage.naam === language.naam }"
         class="flex items-center hover:bg-gray-200 dark:hover:bg-gray-900 px-2 cursor-pointer text-gray-800 dark:text-gray-400"
         @click="selectLanguage(locale)">
        <img :src="language.flag" alt="" class="w-5"/>&emsp;{{ language.naam }}
      </a>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
import { FETCH_TRANSLATIONS, SET_LOCALE } from '@/store/keys'

export default {
  name: 'LangDropdown',
  setup () {
    const dropdown = ref(false)
    const store = useStore()

    // Computed
    const selectedLanguage = computed(() => store.state.languages[store.state.locale])
    const selectLanguage = (locale) => {
      store.commit(SET_LOCALE, locale)
      // Close lang popup menu
      dropdown.value = false
      // Get selected locale data
      store.dispatch(FETCH_TRANSLATIONS)
    }

    return {
      dropdown,
      selectedLanguage,
      selectLanguage,
      languages: store.state.languages
    }
  }
}
</script>

<style scoped></style>
