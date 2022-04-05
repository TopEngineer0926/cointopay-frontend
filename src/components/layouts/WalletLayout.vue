<template>
  <div class="p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="w-full">
        <slot name="notice"/>
      </div>
      <div class="flex flex-col md:flex-row space-x-0 md:space-x-4">
        <div class="w-full md:w-72 mb-4 md:mb-0 bg-white dark:bg-gray-800 rounded shadow p-4" style="min-width: 18rem;">
          <slot name="sidebar"/>
        </div>
        <div class="flex-grow bg-white dark:bg-gray-800 rounded shadow p-4">
          <slot name="content"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletLayout'
}
</script>

<style scoped></style>
