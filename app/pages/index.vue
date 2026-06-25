<!-- <template>
  <UPageCard
    title="Tailwind CSS"
    description="Nuxt UI integrates with latest Tailwind CSS, bringing significant improvements."
    icon="i-simple-icons-tailwindcss"
    to="https://tailwindcss.com/docs/v4-beta"
    target="_blank"
    variant="soft"
  />
</template> -->
<template>
  <div class="flex flex-col md:flex-row min-h-screen w-full overflow-hidden bg-zinc-950 font-sans">
    <NuxtLink
      to="/bounce/svgtopng"
      class="group relative flex flex-1 items-center justify-center p-8 transition-all duration-500 ease-in-out hover:flex-[1.5] bg-gradient-to-br from-indigo-600 to-purple-700 border-b md:border-b-0 md:border-r border-zinc-800/50"
    >
      <div class="absolute inset-0 bg-black opacity-10 transition-opacity duration-300 group-hover:opacity-0" />

      <div class="text-center z-10 transform transition-all duration-500 group-hover:-translate-y-2">
        <div class="inline-flex p-4 rounded-full bg-white/10 mb-6 text-white animate-bounce group-hover:scale-110 transition-transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-white tracking-wider mb-4 uppercase drop-shadow-md">
          BOUNCE
        </h2>
        <p class="text-indigo-100 text-sm md:text-base font-medium tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
          SVG to PNG Converter
        </p>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </NuxtLink>

    <NuxtLink
      to="/cascade/svgtopng"
      class="group relative flex flex-1 items-center justify-center p-8 transition-all duration-500 ease-in-out hover:flex-[1.5] bg-gradient-to-br from-emerald-600 to-teal-700"
    >
      <div class="absolute inset-0 bg-black opacity-10 transition-opacity duration-300 group-hover:opacity-0" />

      <div class="text-center z-10 transform transition-all duration-500 group-hover:-translate-y-2">
        <div class="inline-flex p-4 rounded-full bg-white/10 mb-6 text-white group-hover:rotate-90 transition-transform duration-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 13l-7 7-7-7m14-6l-7 7-7-7"
            />
          </svg>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-white tracking-wider mb-4 uppercase drop-shadow-md">
          CASCADE
        </h2>
        <p class="text-emerald-100 text-sm md:text-base font-medium tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
          SVG to PNG Converter
        </p>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </NuxtLink>
  </div>
</template>

<script setup>
// 필요한 경우 메인 레이아웃을 다르게 가져가려면 설정 (예: 헤더/푸터 없는 완전 전체화면)
definePageMeta({
  layout: false
})
</script>

<style scoped>
/* 추가적인 미세 커스텀 스타일이 필요하다면 여기에 작성 */
</style>
