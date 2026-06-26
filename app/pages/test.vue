<script setup>
const items = [
  { label: 'ascii', icon: 'i-heroicons-calculator', to: '/ascii' },
  { label: 'svgtopng', icon: 'i-heroicons-megaphone', to: '/svgtopng' }
  // { label: '공지사항', icon: 'i-heroicons-megaphone', to: '/notice' },
  // { label: '공지사항', icon: 'i-heroicons-megaphone', to: '/notice' }
]
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="max-w-xs mx-auto">
      <UNavigationMenu
        orientation="vertical"
        :items="items"
        class="w-full"
      />
    </div>
  </div>
</template>
