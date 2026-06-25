<!--
1대1
- const width = svgElement.clientWidth || parseInt(svgElement.getAttribute('width')) || 300
canvas.width = width;
-->
<template>
  <div class="converter-container">
    <div class="upload-section">
      <label
        for="svg-file"
        class="file-label"
      >SVG 파일 선택</label>
      <input
        id="svg-file"
        type="file"
        accept=".svg"
        @change="handleFileUpload"
      >
      <span
        v-if="fileName"
        class="file-name"
      >{{ fileName }}</span>
    </div>

    <div class="box">
      <div
        ref="svgContainerRef"
        v-html="svgContent"
      />
    </div>

    <br>
    <button
      :disabled="!svgContent"
      @click="convertAndDownload"
    >
      PNG로 변환 후 다운로드
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const svgContainerRef = ref(null)
const svgContent = ref('') // 업로드된 SVG 문자열이 저장될 곳
const fileName = ref('') // 업로드된 파일명 (다운로드할 때 재사용)

// 기본 예시용 SVG (아무것도 업로드 안 했을 때 처음에 보여줄 기본 도형)
const defaultSvg = `
  <svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="royalblue" />
    <text x="50" y="55" font-size="12" fill="white" text-anchor="middle" font-family="Arial">UPLOAD</text>
  </svg>
`
// 처음에 기본 SVG를 넣어둡니다.
svgContent.value = defaultSvg

// 사용자가 파일을 올렸을 때 실행되는 함수
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  fileName.value = file.name

  // 파일을 텍스트(문자열)로 읽어오기
  const reader = new FileReader()
  reader.onload = (e) => {
    // 읽어온 SVG 텍스트를 반응형 변수에 주입 -> 화면에 바로 뜸
    svgContent.value = e.target.result
  }
  reader.readAsText(file)
}

// 변환 및 다운로드 함수
const convertAndDownload = () => {
  // v-html 내부에 삽입된 실제 <svg> 태그를 찾아옵니다.
  const svgElement = svgContainerRef.value?.querySelector('svg')

  if (!svgElement) {
    alert('변환할 SVG 엘리먼트를 찾을 수 없습니다.')
    return
  }

  if (typeof window === 'undefined') return

  // 1. SVG 크기 감지
  // 파일로 올린 SVG는 width/height 속성이 없을 수도 있어서 없을 경우 300을 기본값으로 줍니다.
  const width = svgElement.clientWidth || parseInt(svgElement.getAttribute('width')) || 300
  const height = svgElement.clientHeight || parseInt(svgElement.getAttribute('height')) || 300

  // 2. SVG를 문자열 텍스트로 변환
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  // 3. Blob 및 가상 URL 생성
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const blobURL = URL.createObjectURL(svgBlob)

  // 4. 가상 이미지 생성 및 로드
  const image = new Image()
  image.src = blobURL

  image.onload = () => {
    // 5. 캔버스 생성 및 크기 지정
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (context) {
      // 6. 캔버스에 이미지 그리기
      context.drawImage(image, 0, 0, width, height)

      // 7. PNG 추출
      const pngDataUrl = canvas.toDataURL('image/png')

      // 8. 파일명 결정 (기본파일명.svg -> 기본파일명.png로 변경)
      const saveName = fileName.value
        ? fileName.value.replace(/\.svg$/i, '.png')
        : 'converted_image.png'

      // 9. 다운로드
      const downloadLink = document.createElement('a')
      downloadLink.href = pngDataUrl
      downloadLink.download = saveName
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }

    URL.revokeObjectURL(blobURL)
  }

  image.onerror = (err) => {
    console.error('변환 실패:', err)
    URL.revokeObjectURL(blobURL)
  }
}
</script>

<style scoped>
.converter-container {
  font-family: sans-serif;
  padding: 20px;
}
.upload-section {
  margin-bottom: 20px;
}
/* 못생긴 기본 input type="file"을 숨기고 예쁜 버튼 스타일로 대체 */
input[type="file"] {
  display: none;
}
.file-label {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.file-label:hover {
  background: #218838;
}
.file-name {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}
.box {
  border: 1px dashed #ccc;
  padding: 20px;
  margin-bottom: 15px;
  display: inline-block;
  min-width: 200px;
  min-height: 200px;
  background: #f8f9fa;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}
button:hover {
  background: #0056b3;
}
button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>
