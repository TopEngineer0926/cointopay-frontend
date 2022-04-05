<template>

  <svg v-if="name === 'user-circle'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
          clip-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'refresh'" :class="classes" fill="none" stroke="currentColor"
       viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2">
    </path>
  </svg>
  <svg v-if="name === 'account'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'cash'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'power'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'trash'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'edit'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'spinner'" :class="classes" class="animate-spin inline" fill="none"
       viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="#E5E7EB"/>
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentColor"/>
  </svg>

  <svg v-if="name === 'eye'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
    <path
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'info'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'email'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'shield-exclamation'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'shield'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'export'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'clipboard'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
  </svg>

  <svg v-if="name === 'information-circle'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'close'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'dollar'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'moon'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'sun'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'bar-chart'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'chevron-up'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'chevron-down'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'chevron-left'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clip-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'chevron-right'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'search'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'question-mark'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'plus-circle'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'plus'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'minus-circle'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>
  <svg v-if="name === 'minus'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" fill-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'clipboard-list'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
    <path clip-rule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'globe'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'expand'" :class="classes" viewBox="0 0 612 612" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M243.958,340.177L37.657,546.497L38.25,420.75c0-10.557-8.568-19.125-19.125-19.125S0,410.193,0,420.75v172.125     c0,5.661,2.333,10.232,6.043,13.368C9.505,609.781,14.325,612,19.68,612h171.57c10.557,0,19.125-8.567,19.125-19.125     c0-10.557-8.568-19.125-19.125-19.125H64.47l206.531-206.512L243.958,340.177z M605.956,5.757C602.495,2.219,597.676,0,592.34,0     H420.75c-10.557,0-19.125,8.568-19.125,19.125c0,10.557,8.568,19.125,19.125,19.125h126.761L340.999,244.781l27.042,27.042     l206.321-206.32L573.75,191.25c0,10.557,8.568,19.125,19.125,19.125S612,201.807,612,191.25V19.125 C612,13.464,609.667,8.894,605.956,5.757z"
      fill="currentColor"></path>
  </svg>
  <svg v-if="name === 'collapse'" :class="classes" viewBox="0 0 612 612" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M248.542,343.929H78.879c-10.452,0-18.917,8.428-18.917,18.842c0,10.395,8.465,18.84,18.917,18.84h125.351L0,584.979     l26.751,26.639l204.019-203.18l-0.592,123.822c0,10.395,8.465,18.84,18.917,18.84c10.452,0,18.917-8.426,18.917-18.84v-169.51     c0-5.58-2.312-10.09-5.981-13.186C258.573,346.126,253.815,343.929,248.542,343.929z M533.141,230.388H407.79L612,27.019     L585.248,0.382l-204,203.178l0.593-123.822c0-10.395-8.465-18.841-18.917-18.841s-18.917,8.427-18.917,18.841v169.51     c0,5.58,2.312,10.089,5.961,13.166c3.439,3.478,8.179,5.675,13.472,5.675h169.662c10.452,0,18.918-8.427,18.918-18.841 C552.038,238.834,543.573,230.388,533.141,230.388z"
      fill="currentColor"/>
  </svg>

  <svg v-if="name === 'barcode'" :class="classes" height="512.000000pt"
       viewBox="0 0 512.000000 512.000000" width="512.000000pt" xmlns="http://www.w3.org/2000/svg">

    <g fill="currentColor"
       stroke="none" transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
      <path
        d="M70 4592 c-70 -37 -70 -39 -70 -495 0 -451 1 -455 62 -491 61 -36 136 -19 175 41 16 24 18 62 21 365 l3 338 325 0 c353 0 371 2 412 55 30 38 30 112 0 150 -42 54 -53 55 -490 55 -372 0 -406 -1 -438 -18z"/>
      <path
        d="M4174 4596 c-72 -32 -100 -131 -52 -191 41 -53 59 -55 412 -55 l325 0 3 -338 c3 -303 5 -341 21 -365 38 -58 110 -77 174 -44 62 32 63 41 63 494 0 456 0 458 -70 495 -32 17 -66 18 -440 18 -316 -1 -412 -4 -436 -14z"/>
      <path
        d="M833 3821 c-67 -42 -63 43 -63 -1263 0 -1156 1 -1184 20 -1215 45 -74 139 -83 197 -19 l33 36 0 1200 0 1200 -33 36 c-42 46 -104 56 -154 25z"/>
      <path
        d="M1343 3820 c-67 -41 -63 44 -63 -1260 0 -1304 -4 -1219 63 -1260 28 -18 51 -20 192 -20 141 0 164 2 192 20 67 41 63 -44 63 1262 0 1156 -1 1184 -20 1215 -34 56 -61 63 -237 63 -139 0 -162 -2 -190 -20z"/>
      <path
        d="M2113 3821 c-67 -42 -63 43 -63 -1263 0 -1156 1 -1184 20 -1215 45 -74 139 -83 197 -19 l33 36 0 1200 0 1200 -33 36 c-42 46 -104 56 -154 25z"/>
      <path
        d="M2623 3820 c-67 -41 -63 44 -63 -1260 0 -1304 -4 -1219 63 -1260 28 -18 51 -20 192 -20 141 0 164 2 192 20 67 41 63 -44 63 1262 0 1156 -1 1184 -20 1215 -34 56 -61 63 -237 63 -139 0 -162 -2 -190 -20z"/>
      <path
        d="M3393 3821 c-67 -42 -63 43 -63 -1263 0 -1156 1 -1184 20 -1215 45 -74 139 -83 197 -19 l33 36 0 1200 0 1200 -33 36 c-42 46 -104 56 -154 25z"/>
      <path
        d="M3903 3820 c-67 -41 -63 44 -63 -1260 0 -1304 -4 -1219 63 -1260 28 -18 51 -20 192 -20 141 0 164 2 192 20 67 41 63 -44 63 1262 0 1156 -1 1184 -20 1215 -34 56 -61 63 -237 63 -139 0 -162 -2 -190 -20z"/>
      <path
        d="M95 1529 c-37 -10 -73 -42 -86 -76 -5 -14 -9 -202 -9 -431 0 -455 0 -457 70 -494 32 -17 66 -18 438 -18 437 0 448 1 490 55 30 38 30 112 0 150 -41 53 -59 55 -412 55 l-325 0 -3 338 c-3 303 -5 341 -21 365 -32 49 -88 71 -142 56z"/>
      <path
        d="M4956 1529 c-40 -11 -74 -46 -86 -88 -6 -20 -10 -174 -10 -353 l0 -318 -325 0 c-354 0 -372 -2 -413 -55 -30 -38 -30 -112 0 -150 42 -54 53 -55 490 -55 372 0 406 1 438 18 70 37 70 39 70 495 0 358 -2 413 -16 443 -25 51 -91 80 -148 63z"/>
    </g>
  </svg>

  <svg v-if="name === 'qr-code'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'chevron-double'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0zm0 6a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 0z"
          fill-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'exclamation-circle'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          fill-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'badge-check'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          fill-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'check-circle'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'cog'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          fill-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'shopping-cart'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
  </svg>
  <svg v-if="name === 'heart'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path clip-rule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          fill-rule="evenodd"></path>
  </svg>
  <svg v-if="name === 'sort'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"></path>
  </svg>
  <svg v-if="name === 'clock'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="2"></path>
  </svg>

  <svg v-if="name === 'bell'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
  </svg>

  <svg v-if="name === 'link'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
          clip-rule="evenodd"></path>
  </svg>

  <svg v-if="name === 'star'" :class="classes" fill="currentColor" viewBox="0 0 20 20"
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
  </svg>

  <svg v-if="name === 'arrow-right'" :class="classes" fill="none" stroke="currentColor" viewBox="0 0 24 24"
       xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
  </svg>

  <svg v-if="name === 'x-circle'" :class="classes" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"></path>
  </svg>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      default () {
        return ''
      }
    },
    classes: {
      type: String,
      default () {
        return 'w-6 h-6'
      }
    }
  }
}
</script>

<style scoped></style>
