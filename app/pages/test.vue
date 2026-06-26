<template>
  <div class="w-full max-w-md p-4">
    <label class="flex items-center justify-between w-full p-2 border border-gray-300 bg-red-100 rounded-lg cursor-pointer hover:bg-gray-700">
      
      <span class="px-4 py-1.5 bg-slate-800 text-white text-sm rounded-md font-medium">
        파일 선택
      </span>

      <input 
        type="file" 
        accept="image/png" 
        class="text-sm text-gray-500 w-40 file:hidden"
      >
      
    </label>
  </div>
</template>