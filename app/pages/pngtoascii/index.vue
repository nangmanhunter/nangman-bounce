<template>
  <div class="ascii-converter-container max-w-4xl mx-auto p-6">
<div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-paint-brush-20-solid" class="text-primary-500 w-5 h-5" />
        <h1 class="text-lg font-bold text-gray-950 dark:text-white">ASCII Converter</h1>
        <span class="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">PNG</span>
      </div>
      
      <p class="text-xs text-gray-500">이미지를 텍스트 아트로 변환</p>
    </div>

    <div class="upload-section w-full max-w-md mx-auto">
      <label
        class="group flex items-center justify-between w-full p-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:border-primary-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
      >
        <div class="flex items-center gap-3">
          <div
            class="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 group-hover:scale-105 transition-transform"
          >
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 block" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >이미지 업로드</span
            >
            <span class="text-xxs text-gray-400 font-mono">Only PNG</span>
          </div>
        </div>

        <span
          class="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-md shadow-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-colors"
        >
          파일 선택
        </span>

        <input
          type="file"
          accept="image/png"
          class="hidden"
          @change="handleImageUpload"
        />
      </label>
    </div>






<div v-if="imageSrc" class="control-section flex items-center justify-between gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
  
  <!-- 왼쪽: 텍스트 정보들 (위아래 배치) -->
  <div class="flex flex-col gap-1 text-left">
    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      변환 너비(글자 수): <span class="font-mono text-primary-500 font-bold">{{ targetWidth }}px</span>
    </label>
    <span class="text-xs text-gray-400 dark:text-gray-500">
      ※ 너비가 커질수록 디테일이 살고 텍스트 용량이 커집니다.
    </span>
  </div>

  <!-- 오른쪽: 슬라이더 인풋 (우측 끝으로 배치 및 너비 확보) -->
  <div class="flex-1 max-w-xs">
    <input
      v-model.number="targetWidth"
      type="range"
      min="50"
      max="5000"
      step="10"
      class="w-full accent-primary-500 cursor-pointer"
      @input="convertToAscii"
    />
  </div>

</div>




    <div v-if="asciiResult" class="result-section">
      <h3>변환 결과 (Text)</h3>
      <pre :style="{ fontSize: asciiFontSize + 'px' }">{{ asciiResult }}</pre>
    </div>

    <canvas ref="canvasRef" style="display: none" />
  </div>
</template>

<script setup>
import { ref } from "vue";

const imageSrc = ref(null);
const asciiResult = ref("");
const targetWidth = ref(100); // 기본 가로 글자 수 (해상도 조절용)
const asciiFontSize = ref(8);
const canvasRef = ref(null);
let originalImage = null;

// 밝기에 따라 매핑할 아스키 문자 배열 (밀도가 높은 것부터 낮은 순으로 배치)
// @가 가장 어둡고(꽉 차고), 공백(' ')이 가장 밝음
const ASCII_CHARS = "@%#*+=-:. ";

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imageSrc.value = e.target.result;

    // 이미지 객체 생성 및 로드
    originalImage = new Image();
    originalImage.src = e.target.result;
    originalImage.onload = () => {
      convertToAscii();
    };
  };
  reader.readAsDataURL(file);
};

const convertToAscii = () => {
  if (!originalImage || !canvasRef.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // 1. 아스키 아트의 비율을 맞추기 위한 폰트 왜곡 보정
  // 텍스트는 보통 가로보다 세로가 길기 때문에, 이미지를 약간 세로로 압축해야 출력했을 때 안 넙적해집니다.
  const fontAspectRatio = 0.55;

  const width = targetWidth.value;
  const height = Math.round(
    (originalImage.height / originalImage.width) * width * fontAspectRatio,
  );

  canvas.width = width;
  canvas.height = height;

  // 2. 캔버스에 타겟 해상도 크기로 축소해서 그리기 (이 단계에서 스케일 다운 다운그레이드)
  ctx.drawImage(originalImage, 0, 0, width, height);

  // 3. 픽셀 데이터(RGBA) 가져오기
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let asciiStr = "";

  // 4. 이중 루프로 픽셀을 돌며 문자로 치환
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // 알파 채널(투명도) 처리
      const a = pixels[i + 3];

      let char = " ";

      // 투명한 픽셀이 아니라면 밝기 계산 진행
      if (a > 10) {
        // 평균값 대신 인간의 눈이 느끼는 색상별 가중치(Luminance 공식) 적용
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // 0~255 범위를 아스키 문자 배열 인덱스(0~9)로 매핑
        const charIndex = Math.floor(
          (brightness / 255) * (ASCII_CHARS.length - 1),
        );
        char = ASCII_CHARS[charIndex];
      }

      asciiStr += char;
    }
    asciiStr += "\n"; // 한 줄 끝나면 개행
  }

  asciiResult.value = asciiStr;

  // 화면 글자 크기도 가로 폭에 맞춰 동적으로 조절 (너무 삐져나가지 않게)
  asciiFontSize.value = Math.max(4, Math.min(12, 800 / width));
};
</script>

<style scoped>
.ascii-converter-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: sans-serif;
}

.upload-section,
.control-section {
  margin-bottom: 20px;
}

.tip {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.result-section pre {
  background-color: #1a1a1a;
  color: #00ff00; /* 클래식한 터미널 감성 그린 */
  font-family:
    "Courier New", Courier, monospace; /* 무조건 고정폭 폰트 사용해야 안 깨짐 */
  line-height: 1;
  letter-spacing: 0;
  padding: 15px;
  overflow-x: auto;
  white-space: pre;
}
</style>
