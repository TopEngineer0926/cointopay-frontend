<template>
  <div class="p-2 w-full mx-auto">
    <div class="animate-pulse">
      <div class="flex-1 space-y-3 py-1">
        <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded"></div>
        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-4">
            <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded col-span-2"></div>
            <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="p-2 w-full mx-auto">
    <div class="animate-pulse">
      <div class="flex-1 space-y-3 py-1">
        <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded"></div>
        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-4">
            <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
            <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded col-span-2"></div>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-gray-500 rounded"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PulseSkeleton'
}
</script>

<style scoped></style>
