<template>
  <div class="full-screen-wrapper">
    <div class="fast-converter-container">
      <h2>{{ uiText.title }}</h2>

      <label
        for="fast-svg-file"
        class="instant-btn"
      >
        {{ uiText.button }}
      </label>
      <input
        id="fast-svg-file"
        type="file"
        accept=".svg"
        multiple
        @change="handleInstantConvert"
      >
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
        title: 'SVG 파일 선택 즉시 PNG로 저장 (다중 선택 가능!)',
        button: '👆 SVG 파일들 선택하기 (여러 개 한방에!)'
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
/* 💡 핵심 스타일 추가: 화면 전체 높이를 확보하고 내용물을 세로/가로 정중앙 배치 */
.full-screen-wrapper {
  display: flex;
  justify-content: center; /* 가로 정중앙 */
  align-items: center;     /* 세로 정중앙 */
  min-height: 100vh;       /* 브라우저 화면 높이 100% 꽉 채우기 */
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f4f6; /* 주황색 버튼이 아주 선명하게 돋보이는 모던한 연회색 배경 */
}

.fast-converter-container {
  font-family: sans-serif;
  text-align: center;
  padding: 20px;
}

h2 {
  color: #222;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

input[type="file"] {
  display: none;
}

.instant-btn {
  display: inline-block;
  padding: 16px 36px;
  background: #ff5722;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border-radius: 12px; /* 버튼 모서리를 살짝 더 트렌디하고 둥글게 변경 */
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 87, 34, 0.2); /* 버튼과 같은 톤의 화사한 그림자 효과 */
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.instant-btn:hover {
  background: #e64a19;
  transform: translateY(-2px); /* 마우스를 올리면 팅기듯 살짝 위로 올라오는 힙한 모션 효과 */
  box-shadow: 0 12px 24px rgba(255, 87, 34, 0.3);
}

.instant-btn:active {
  transform: translateY(0);
}
</style>
