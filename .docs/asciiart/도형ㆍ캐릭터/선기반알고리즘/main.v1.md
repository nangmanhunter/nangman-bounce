선 기반 알고리즘(Edge Detection)으로 아스키 아트를 만들면, 면을 채우는 감성 대신 **"도면이나 스케치"** 같은 날카롭고 시크한 낭만이 살아납니다. 사각형 같은 기하학적 도형도 훨씬 덜 묻히고 각이 잘 잡히게 되죠.

이걸 구현하려면 영상처리에서 가장 대중적으로 쓰이는 **소벨 필터(Sobel Filter)** 알고리즘을 사용해야 합니다.

### 💡 선 기반 알고리즘의 핵심 원리

1. **주변 픽셀과의 밝기 차이 계산:** 현재 픽셀을 중심으로 가로($x$), 세로($y$) 주변 픽셀들의 밝기 차이를 구합니다. 변화가 급격할수록 '선(Edge)'이라고 판단합니다.
2. **선의 방향(각도) 계산:** 삼각함수($\tan^{-1}$)를 이용해 이 선이 **가로선인지, 세로선인지, 대각선 대각선인지** 각도를 알아냅니다.
3. **방향에 맞는 문자 매핑:** * 가로선이면 `-`
* 세로선이면 `|`
* 우상향 대각선이면 `/`
* 우하향 대각선이면 `\`
* 선이 없으면 공백(` `)



기존 명암 코드의 흐름을 그대로 유지하면서, **선 검출 알고리즘을 적용한 Nuxt 3 컴포넌트 전체 코드**입니다.

---

### Nuxt 3 선 기반 아스키 변환 컴포넌트

```vue
<template>
  <div class="ascii-converter-container">
    <h2>NangMan Edge-Based ASCII Art Converter</h2>

    <div class="upload-section">
      <input
        type="file"
        accept="image/png"
        @change="handleImageUpload"
      >
    </div>

    <div
      v-if="imageSrc"
      class="control-section"
    >
      <div class="control-group">
        <label>변환 너비(글자 수): {{ targetWidth }}px</label>
        <input
          v-model.number="targetWidth"
          type="range"
          min="50"
          max="200"
          step="10"
          @input="convertToAscii"
        >
      </div>

      <div class="control-group">
        <label>선 민감도(Threshold): {{ threshold }}</label>
        <input
          v-model.number="threshold"
          type="range"
          min="20"
          max="150"
          step="5"
          @input="convertToAscii"
        >
        <span class="tip">※ 값이 낮을수록 미세한 선까지 전부 잡아냅니다.</span>
      </div>
    </div>

    <div
      v-if="asciiResult"
      class="result-section"
    >
      <h3>변환 결과 (Edge Text)</h3>
      <pre :style="{ fontSize: asciiFontSize + 'px' }">{{ asciiResult }}</pre>
    </div>

    <canvas
      ref="canvasRef"
      style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const imageSrc = ref(null)
const asciiResult = ref('')
const targetWidth = ref(100)
const threshold = ref(60) // 선을 판정하는 기준값 (기본 60)
const asciiFontSize = ref(8)
const canvasRef = ref(null)
let originalImage = null

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result

    originalImage = new Image()
    originalImage.src = e.target.result
    originalImage.onload = () => {
      convertToAscii()
    }
  }
  reader.readAsDataURL(file)
}

const convertToAscii = () => {
  if (!originalImage || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const fontAspectRatio = 0.55 // 고정폭 폰트 비율 보정
  const width = targetWidth.value
  const height = Math.round((originalImage.height / originalImage.width) * width * fontAspectRatio)

  canvas.width = width
  canvas.height = height
  ctx.drawImage(originalImage, 0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  // 1. 픽셀 데이터를 다루기 쉽게 먼저 흑백(Grayscale) 2차원 배열로 변환
  const grayMap = []
  for (let y = 0; y < height; y++) {
    grayMap[y] = []
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      // 투명한 배경이면 밝기를 흰색(255) 처리
      if (a < 10) {
        grayMap[y][x] = 255
      } else {
        grayMap[y][x] = 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
    }
  }

  let asciiStr = ''

  // 2. 소벨 커널(Sobel Kernel) 정의 - 주변 픽셀과의 차이를 구하기 위한 가중치 행렬
  const kx = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ]
  const ky = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
  ]

  // 外곽 경계선 1픽셀씩 마진을 두고 루프를 돕니다 (주변 3x3 탐색을 위해)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      // 3x3 주변 행렬 연산 수행
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const val = grayMap[y + j][x + i]
          gx += val * kx[j + 1][i + 1]
          gy += val * ky[j + 1][i + 1]
        }
      }

      // 선의 세기(경계선의 선명도) 계산
      const edgeStrength = Math.sqrt(gx * gx + gy * gy)
      let char = ' '

      // 선의 세기가 설정한 기준값(Threshold)보다 클 때만 선으로 인정
      if (edgeStrength > threshold.value) {
        // 선의 각도 계산 (라디안 값 -> 디그리로 변환)
        // -90도 ~ 90도 범위로 나옴
        const angle = Math.atan2(gy, gx) * (180 / Math.PI)

        // 각도에 따라 알맞은 매칭 문자 선택
        if (angle >= -22.5 && angle < 22.5) {
          char = '|' // 세로선 (x축 변화율이 적고 y축 경계선일 때)
        } else if (angle >= 22.5 && angle < 67.5) {
          char = '/' // 우상향 대각선
        } else if (angle >= 67.5 || angle < -67.5) {
          char = '-' // 가로선
        } else if (angle >= -67.5 && angle < -22.5) {
          char = '\\' // 우하향 대각선
        }
      }

      asciiStr += char
    }
    asciiStr += '\n'
  }

  asciiResult.value = asciiStr
  asciiFontSize.value = Math.max(4, Math.min(12, 800 / width))
}
</script>

<style scoped>
.ascii-converter-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: sans-serif;
}

.upload-section {
  margin-bottom: 20px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tip {
  font-size: 12px;
  color: #666;
}

.result-section pre {
  background-color: #1a1a1a;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
  line-height: 1;
  letter-spacing: 0;
  padding: 15px;
  overflow-x: auto;
  white-space: pre;
}
</style>

```

---

### 🛠️ 이전 코드와의 차이점 및 재미있는 포인트

1. **소벨 필터 알고리즘 탑재**: `kx`, `ky`라는 $3 \times 3$ 배열을 보실 수 있는데, 이게 이미지 픽셀 매트릭스를 훑으면서 순간적으로 색이 변하는 경계선을 캡처하는 수학적 필터입니다.
2. **`Math.atan2(gy, gx)`**: 기울기($x$와 $y$의 변화량)를 기반으로 선이 몇 도로 누워있는지 알아냅니다. 이 각도 데이터 덕분에 단순 덩어리가 아니라 `|`, `-`, `/`, `\` 같은 방향성 있는 문자를 박아줄 수 있게 됩니다.
3. **`Threshold` (선 민감도) 추가**: 단순 사각형 도형을 넣었을 때 외곽선만 깔끔하게 따고 싶다면 슬라이더를 조절해 임계값을 높여주면 됩니다. 반대로 복잡한 캐릭터를 넣었을 때는 임계값을 낮춰야 섬세한 스케치처럼 묘사됩니다.

이 선 검출 방식으로 아까 안 나왔던 사각형이나 기하학적 아이콘들을 한 번 넣어보세요. 설계도나 블루프린트 같은 느낌으로 딱 떨어지게 출력되는 걸 보실 수 있을 겁니다!