<script setup>
import { ref } from 'vue'

// 선택된 파일명을 저장할 변수
const fileName = ref('선택된 파일 없음')

// 파일 선택 시 실행될 함수
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    fileName.value = file.name
  } else {
    fileName.value = '선택된 파일 없음'
  }
}
</script>

<template>
  <div class="w-full max-w-md p-4">
    <label 
      for="file-upload" 
      class="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <span class="px-4 py-1.5 bg-slate-800 text-white text-sm rounded-md font-medium">
        파일 선택
      </span>

      <span class="text-sm text-gray-500 truncate ml-4">
        {{ fileName }}
      </span>

      <input
        id="file-upload"
        type="file"
        accept="image/png"
        class="sr-only"
        @change="handleFileChange"
      >
    </label>
  </div>
</template>
