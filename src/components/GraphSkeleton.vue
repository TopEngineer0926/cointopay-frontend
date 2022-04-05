<template>
  <div class="p-2 inline-block mx-auto">
    <div class="animate-pulse">
      <div class="flex items-baseline space-x-3">
        <div class="h-12 w-8 bg-gray-200 dark:bg-gray-500 rounded col-span-2"></div>
        <div class="h-48 w-8 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
        <div class="h-36 w-8 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
        <div class="h-64 w-8 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
        <div class="h-24 w-8 bg-gray-200 dark:bg-gray-500 rounded col-span-1"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GraphSkeleton'
}
</script>

<style scoped></style>
