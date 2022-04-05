<template>
  <div class="grid grid-cols-4 gap-2 xl:gap-3">
    <div v-for="count in counter" :key="count"
      class="animate-pulse h-72 shadow bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900 rounded col-span-4 md:col-span-2 lg:col-span-1 p-4">
      <div class="bg-gray-200 dark:bg-gray-500 rounded w-32 h-32 mx-auto"></div>
      <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-500 rounded"></div>
      <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-500 rounded w-2/5 mx-auto"></div>
      <div class="flex items-center justify-center mt-3">
        <div class="w-8 h-8 bg-gray-200 dark:bg-gray-500 rounded mr-3"></div>
        <div class="w-8 h-8 bg-gray-200 dark:bg-gray-500 rounded mr-3"></div>
        <div class="w-8 h-8 bg-gray-200 dark:bg-gray-500 rounded mr-3"></div>
        <div class="w-8 h-8 bg-gray-200 dark:bg-gray-500 rounded mr-3"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Product',
  props: ['counter']
}
</script>

<style scoped></style>
