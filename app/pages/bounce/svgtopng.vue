<template>
  <div class="full-screen-wrapper min-h-screen w-full flex items-center justify-center bg-zinc-950 p-6 font-sans relative overflow-hidden">
    <div class="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -top-40 -left-40 pointer-events-none" />
    <div class="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -bottom-40 -right-40 pointer-events-none" />

    <div class="dropzone-container w-full max-w-lg z-10">
      <div class="mb-8 text-center relative">
        <NuxtLink
          to="/"
          class="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
        >
          ← Back
        </NuxtLink>
        <span class="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          Bounce Theme
        </span>
        <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
          {{ uiText.title }}
        </h2>
      </div>

      <div
        class="dropzone group relative flex flex-col items-center justify-center w-full aspect-[16/10] border-2 border-dashed border-zinc-800 bg-zinc-900/50 backdrop-blur-md rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 select-none"
        :class="{ 'dragging-style': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          :class="{ 'opacity-100': isDragging }"
        />

        <div
          class="drop-message text-center p-6 z-10 pointer-events-none transform transition-transform duration-300"
          :class="{ 'scale-105 animate-bounce-subtle': isDragging }"
        >
          <div
            class="icon-box inline-flex p-5 rounded-2xl bg-zinc-800/80 text-indigo-400 mb-5 border border-zinc-700/50 shadow-xl group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:scale-110 transition-all duration-300"
            :class="{ 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20': isDragging }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <p
            class="text-zinc-300 font-bold text-lg leading-relaxed tracking-wide"
            v-html="uiText.message"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDragging = ref(false)

// 💡 1. 기본 언어 셋을 글로벌 스탠다드인 영어(en)로 설정
const uiText = ref({
  title: 'Convert SVG to PNG Instantly',
  message: 'Drag & Drop your SVG files here <br><span class="text-xs font-normal text-zinc-500 mt-1 block">Multiple files supported</span>'
})

// 💡 2. 브라우저가 한국어(ko) 환경일 때 바뀔 문구 정의
onMounted(() => {
  if (typeof window !== 'undefined') {
    const userLanguage = navigator.language || navigator.userLanguage

    if (userLanguage.startsWith('ko')) {
      uiText.value = {
        title: 'SVG 파일들을 한방에 던지세요!',
        message: '여러 개의 SVG 파일을 한 번에 <br><span class="text-xs font-normal text-zinc-500 mt-1 block">여기에 드래그 앤 드롭 하세요</span>'
      }
    }
  }
})

const onDragOver = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event) => {
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  Array.from(files).forEach((file) => {
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      convertAndDownload(file)
    } else {
      console.warn(`${file.name}은 SVG 파일이 아니라서 제외되었습니다.`)
    }
  })
}

const convertAndDownload = (file) => {
  const saveName = file.name.replace(/\.svg$/i, '.png')
  const reader = new FileReader()

  reader.onload = (e) => {
    const svgText = e.target.result
    const parser = new DOMParser()

    // 💡 크리티컬 버그 수정: image/xml+xml을 표준 스펙인 image/svg+xml로 변경
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
    const url = window.URL || window.webkitURL || URL
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

      url.revokeObjectURL(blobURL)
    }
  }

  reader.readAsText(file)
}
</script>

<style scoped>
/* 드래그 중일 때 바뀔 동적 스타일 */
.dragging-style {
  border-color: #6366f1 !important; /* indigo-500 */
  background-color: rgba(30, 27, 75, 0.4) !important; /* indigo-950/40 */
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
}

/* 드래그 상태일 때 미세하게 위아래로 튕기는 효과 */
@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bounce-subtle {
  animation: bounceSubtle 1s infinite ease-in-out;
}
</style>
