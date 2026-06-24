<!--
- bounceimg.nangman.org/svgtopng
-->
<template>
  <div class="full-screen-wrapper">
    <div class="dropzone-container">
      <h2>{{ uiText.title }}</h2>

      <div
        class="dropzone"
        :class="{ dragging: isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <div class="drop-message">
          <span class="icon">📥</span>
          <p v-html="uiText.message" />
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
  message: 'Drag & Drop your SVG files here <br><small style="font-weight: normal; opacity: 0.7;">Multiple files supported</small>'
})

// 💡 2. 브라우저가 한국어(ko) 환경일 때 바뀔 문구 정의
onMounted(() => {
  if (typeof window !== 'undefined') {
    const userLanguage = navigator.language || navigator.userLanguage

    if (userLanguage.startsWith('ko')) {
      uiText.value = {
        title: 'SVG 파일들을 아래 박스에 한방에 던지세요!',
        message: '여러 개의 SVG 파일을 한 번에 <br>드래그 앤 드롭 하세요!'
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
.full-screen-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f4f6;
}

.dropzone-container {
  font-family: sans-serif;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 25px;
  padding: 0 20px;
}

.dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 460px;
  height: 280px;
  margin: 0 auto;
  border: 4px dashed #ced4da;
  border-radius: 24px;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, background-color 0.2s, transform 0.2s;
}

.dropzone.dragging {
  border-color: #007bff;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

.drop-message {
  color: #6c757d;
  font-weight: bold;
  line-height: 1.6;
}

.drop-message .icon {
  font-size: 64px;
  display: block;
  margin-bottom: 12px;
}

.dropzone.dragging .drop-message {
  color: #007bff;
}
</style>
