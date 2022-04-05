<template>
  <div class="p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="flex flex-col md:flex-row space-x-0 md:space-x-4">
        <div class="w-full mb-4 md:mb-0 bg-white dark:bg-gray-800 rounded shadow p-4"
          style="min-height: calc(100vh - 351px);">
          <slot/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CenteredLayout'
}
</script>

<style scoped></style>
