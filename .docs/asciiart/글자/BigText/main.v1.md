

##
- BigText.FIGlet.❌한글
- BigText.FIGlet.✅영어.❌한글


##
네, 맞습니다! 복잡한 이미지 업로드나 픽셀 연산 같은 귀찮은 과정은 싹 다 필요 없습니다. **그냥 원하는 문장이나 글자(String)만 툭 던져주면**, 라이브러리가 미리 준비해 둔 폰트 템플릿을 조합해서 거대한 아스키 아트 글자로 짠 하고 변환해 줍니다.

개발자들 사이에서는 서버 터미널이 켜질 때 멋있게 로고를 띄우거나, 콘솔 창에 프로젝트 이름을 박아 넣는 용도로 엄청나게 사랑받는 기술입니다.

Nuxt 3 환경에서 이걸 구현하려면, 브라우저 환경에서도 잘 돌아가는 가벼운 FIGlet npm 패키지를 설치해서 사용하면 됩니다. 바로 적용해 보실 수 있도록 설치부터 컴포넌트 구현까지 깔끔하게 정리해 드릴게요.

---

## 1. 라이브러리 설치

터미널에서 Nuxt 3 프로젝트 폴더로 이동한 뒤, 아래 패키지를 설치해 주세요. `figlet` 패키지는 순수 자바스크립트로 구현되어 있어서 프론트엔드 환경에서도 아주 잘 돌아갑니다.

```bash
npm install figlet

```

---

## 2. Nuxt 3 FIGlet 컴포넌트 예시 (`components/BigTextConverter.vue`)

유저가 Input 창에 글자를 타이핑하면, 실시간으로 멋진 대형 아스키 아트로 변환해 주는 컴포넌트입니다.

```vue
<template>
  <div class="big-text-container">
    <h2>NangMan BIG TEXT Generator (FIGlet)</h2>

    <div class="input-section">
      <input
        v-model="inputText"
        type="text"
        placeholder="영어 문장을 입력하세요 (예: NangMan)"
        @input="generateBigText"
      >
    </div>

    <div v-if="inputText" class="control-section">
      <label>폰트 스타일 선택:</label>
      <select v-model="selectedFont" @change="generateBigText">
        <option value="Standard">Standard (기본)</option>
        <option value="Slant">Slant (기울임)</option>
        <option value="Shadow">Shadow (그림자)</option>
        <option value="3D Diagonal">3D Diagonal (3차원)</option>
      </select>
    </div>

    <div v-if="asciiResult" class="result-section">
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

```

---

## 3. ⚠️ 핵심 주의사항 (한글 미지원 문제)

이 FIGlet 라이브러리를 쓰실 때 반드시 알아두셔야 하는 치명적인 한계가 하나 있습니다. 바로 "한글(초성/중성/종성 조합 문자)을 지원하지 않는다"는 점입니다.

태생이 서양 개발자들이 만든 폰트 템플릿(알파벳 A~Z, 숫자, 특수문자 개별 디자인) 기반이기 때문에, `NangMan`이나 `Hello` 같은 **영어와 숫자는 칼같이 그려내지만, 한글을 입력하면 깨지거나 무시됩니다.**

만약 서비스에서 꼭 한글로 된 거대 아스키 텍스트가 필요하다면, 이 라이브러리를 쓸 수 없고 HTML5 Canvas에 한글을 큰 폰트로 직접 그린 다음, 아까 우리가 첫 번째로 만들었던 '명암 기반 알고리즘'을 이용해 픽셀을 문자로 바스라뜨리는 방식을 응용해야 합니다.

한글이 아니라 **프로젝트 영문 이름, 서비스 타이틀 로고** 같은 걸 낭만 넘치게 터미널이나 UI에 띄울 목적이라면 이 FIGlet 방식이 가장 가볍고, 깔끔하고, 절대 깨지지 않는 완벽한 정답입니다. 코드를 한번 적용해서 컴포넌트를 돌려보시겠어요?