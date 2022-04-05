<template>
  <button :type="type" :class="`${classes} inline-flex items-center whitespace-nowrap justify-center px-2 h-9 border border-transparent rounded font-semibold text-xs uppercase tracking-widest focus:outline-none disabled:opacity-25 dark:disabled:opacity-50 disabled:cursor-not-allowed transition`" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'submit'
    },
    size: {
      type: String,
      default: ''
    },
    buttonStyle: {
      type: String,
      default: 'primary'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    btnStyle () {
      let style = 'bg-blue-500 hover:bg-blue-700 text-white'
      switch (this.buttonStyle) {
        case 'primary':
          style = 'bg-blue-500 hover:bg-blue-700 text-white'
          break
        case 'success':
          style = 'bg-green-500 hover:bg-green-700 text-white'
          break
        case 'danger':
          style = 'bg-red-500 hover:bg-red-700 text-white'
          break
        case 'warning':
          style = 'bg-yellow-500 hover:bg-yellow-600 text-gray-700'
          break
        case 'default':
          style = 'bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-700'
          break
      }
      return style
    },
    classes () {
      return `${this.btnStyle} ${this.size}`
    }
  }
}
</script>
