<template>
  <div class="full-screen-wrapper min-h-screen w-full flex items-center justify-center bg-zinc-950 p-6 font-sans relative overflow-hidden">
    <div class="absolute w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] -top-20 -right-40 pointer-events-none" />
    <div class="absolute w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px] -bottom-40 -left-40 pointer-events-none" />

    <div class="fast-converter-container w-full max-w-md z-10 text-center">
      <div class="mb-10 relative">
        <NuxtLink
          to="/"
          class="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
        >
          ← Back
        </NuxtLink>
        <span class="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          Cascade Theme
        </span>
        <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
          {{ uiText.title }}
        </h2>
      </div>

      <div class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative group overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-stream pointer-events-none" />

        <div class="inline-flex p-5 rounded-2xl bg-zinc-800/50 text-emerald-400 mb-6 border border-zinc-700/30 shadow-inner group-hover:text-emerald-300 group-hover:scale-105 transition-all duration-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-10 h-10 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>

        <label
          for="fast-svg-file"
          class="instant-btn block w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg rounded-2xl cursor-pointer shadow-lg shadow-emerald-950/50 transform active:scale-[0.98] transition-all duration-300 select-none text-center"
        >
          {{ uiText.button }}
        </label>

        <input
          id="fast-svg-file"
          type="file"
          accept=".svg"
          multiple
          class="hidden"
          @change="handleInstantConvert"
        >

        <p class="text-zinc-500 text-xs mt-4">
          SVG 스펙 표준 변환 엔진 탑재
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 💡 1. 기본 언어 셋을 글로벌 표준인 영어(en)로 기본 설정
const uiText = ref({
  title: 'Convert SVG to PNG Instantly',
  button: '👆 Select SVG Files'
})

// 💡 2. 브라우저 환경에서 한국어(ko) 환경을 감지하면 한글로 교체
onMounted(() => {
  if (typeof window !== 'undefined') {
    const userLanguage = navigator.language || navigator.userLanguage

    if (userLanguage.startsWith('ko')) {
      uiText.value = {
        title: 'SVG 파일 선택 즉시\nPNG로 저장',
        button: '👆 SVG 파일 선택 (다중 가능)'
      }
    }
  }
})

const handleInstantConvert = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  Array.from(files).forEach((file) => {
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      convertAndDownloadSingleFile(file)
    } else {
      console.warn(`${file.name}은 SVG 파일이 아닙니다.`)
    }
  })

  event.target.value = ''
}

const convertAndDownloadSingleFile = (file) => {
  const saveName = file.name.replace(/\.svg$/i, '.png')
  const reader = new FileReader()

  reader.onload = (e) => {
    const svgText = e.target.result

    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) return

    const width = parseInt(svgElement.getAttribute('width')) || svgElement.viewBox?.baseVal?.width || 500
    const height = parseInt(svgElement.getAttribute('height')) || svgElement.viewBox?.baseVal?.height || 500

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobURL = URL.createObjectURL(svgBlob)

    const image = new Image()
    image.src = blobURL

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')

      if (context) {
        context.drawImage(image, 0, 0, width, height)
        const pngDataUrl = canvas.toDataURL('image/png')

        const downloadLink = document.createElement('a')
        downloadLink.href = pngDataUrl
        downloadLink.download = saveName
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }

      URL.revokeObjectURL(blobURL)
    }
  }

  reader.readAsText(file)
}
</script>

<style scoped>
/* 텍스트 줄바꿈 자연스럽게 유지 */
h2 {
  white-space: pre-line;
}

/* 카드가 마우스 오버되었을 때 상단 보더가 슥 흐르는 듯한 애니메이션 효과 */
@keyframes stream {
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1.2); opacity: 0; }
}

.animate-stream {
  animation: stream 0.6s ease-out forwards;
}
</style>
