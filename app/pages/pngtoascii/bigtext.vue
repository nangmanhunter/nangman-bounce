<!--
- BIG TEXT Generator (FIGlet)
-->
<template>
  <div class="big-text-container">
    <h2>ASCII Converter Text</h2>

    <div class="input-section">
      <input
        v-model="inputText"
        type="text"
        placeholder="영어 문장을 입력하세요 (예: NangMan)"
        @input="generateBigText"
      >
    </div>

    <div
      v-if="inputText"
      class="control-section"
    >
      <label>폰트 스타일 선택:</label>
      <select
        v-model="selectedFont"
        @change="generateBigText"
      >
        <option value="Standard">
          Standard (기본)
        </option>
        <option value="Slant">
          Slant (기울임)
        </option>
        <option value="Shadow">
          Shadow (그림자)
        </option>
        <option value="3D Diagonal">
          3D Diagonal (3차원)
        </option>
      </select>
    </div>

    <div
      v-if="asciiResult"
      class="result-section"
    >
      <h3>변환 결과</h3>
      <pre>{{ asciiResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import figlet from 'figlet'

// 기본적으로 브라우저 환경에서 폰트를 로드하기 위한 설정
// figlet은 다양한 폰트 파일을 내장하고 있습니다.
import standardFont from 'figlet/importable-fonts/Standard.js'
import slantFont from 'figlet/importable-fonts/Slant.js'
import shadowFont from 'figlet/importable-fonts/Shadow.js'
import diagonalFont from 'figlet/importable-fonts/3D Diagonal.js'

const inputText = ref('NangMan')
const selectedFont = ref('Standard')
const asciiResult = ref('')

// 사용할 폰트들을 등록
onMounted(() => {
  figlet.defaults({ fontPath: '' }) // 기본 경로 초기화
  generateBigText()
})

const generateBigText = () => {
  if (!inputText.value) {
    asciiResult.value = ''
    return
  }

  // 선택된 폰트 객체 매핑
  let fontObj = standardFont
  if (selectedFont.value === 'Slant') fontObj = slantFont
  if (selectedFont.value === 'Shadow') fontObj = shadowFont
  if (selectedFont.value === '3D Diagonal') fontObj = diagonalFont

  // 폰트를 패키지에 파싱하여 수동 등록
  figlet.parseFont(selectedFont.value, fontObj)

  // 텍스트 변환 실행
  figlet.text(
    inputText.value,
    {
      font: selectedFont.value,
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    },
    (err, data) => {
      if (err) {
        console.error('FIGlet 변환 중 에러 발생:', err)
        return
      }
      asciiResult.value = data
    }
  )
}
</script>

<style scoped>
.big-text-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
}

.input-section input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.control-section {
  margin-bottom: 20px;
}

.control-section select {
  padding: 8px 12px;
  margin-left: 10px;
  border-radius: 4px;
}

.result-section pre {
  background-color: #1a1a1a;
  color: #00ff00; /* 터미널 그린 감성 */
  font-family: 'Courier New', Courier, monospace; /* 고정폭 필수 */
  line-height: 1.1;
  letter-spacing: 0;
  padding: 20px;
  overflow-x: auto;
  white-space: pre;
}
</style>
