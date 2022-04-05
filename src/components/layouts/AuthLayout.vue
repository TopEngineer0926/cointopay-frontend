<template>
  <div class="p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="w-full h-full flex flex-col items-center justify-center">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>

<style scoped></style>
