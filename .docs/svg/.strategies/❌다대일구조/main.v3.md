네, 맞습니다! 질문하신 대로 모든 하위 페이지 컴포넌트마다 `onMounted`와 주소 체크 코드를 복사·붙여넣기 해야 한다면 코드 관리도 안 되고, 페이지가 순간적으로 깜빡거리는 UX 문제도 생기게 됩니다.

그래서 실제 실무에서는 하위 페이지마다 개별로 처리하지 않고, **전체 페이지를 감싸는 '최상위 부모 컴포넌트'나 '미들웨어(Middleware)' 단에서 딱 한 번만 체크하도록 구조를 잡습니다.**

사용하시는 프레임워크(Nuxt인지 일반 Vue-Router인지)에 따라 하위 페이지가 매번 일하지 않게 만드는 가장 깔끔한 방법 2가지를 알려드릴게요.

---

## 방법 1. Nuxt 라우터 미들웨어 (Middleware) 활용

> **Nuxt를 쓰고 계신다면 가장 추천하는 정석적인 방법**

Nuxt에는 페이지가 켜지기 전에 도메인 주소를 먼저 검사해서 "너는 캐스케이드 모드야", "너는 바운스 모드야"라고 전역 상태로 지정해 주는 **미들웨어** 기능이 있습니다. 이렇게 하면 하위 페이지에서는 `onMounted`를 쓸 필요가 전혀 없습니다.

### 1) 전역 상태 정의 (예: `composables/useMode.js`)

```javascript
// 두 도메인이 공통으로 공유할 모드 상태값
export const useServiceMode = () => useState('serviceMode', () => 'bounce')

```

### 2) 미들웨어 생성 (`middleware/detect-host.global.js`)

파일명 뒤에 `.global`을 붙이면 모든 하위 페이지가 켜지기 전에 이 코드가 자동으로 먼저 실행됩니다.

```javascript
export default defineNuxtRouteMiddleware(() => {
  // 서버 사이드 빌드 시 에러 방지하기 위해 클라이언트(브라우저)에서만 실행
  if (import.meta.client) {
    const host = window.location.hostname
    const mode = useServiceMode()

    if (host.includes('cascadeimg')) {
      mode.value = 'cascade'
    } else {
      mode.value = 'bounce'
    }
  }
})

```

### 3) 실제 하위 페이지 (`pages/svgtopng.vue` 등)

하위 페이지에서는 `onMounted` 없이 그냥 상태값을 가져와서 바로 쓰면 끝입니다. 하위 페이지가 100개가 되어도 이 코드 한 줄이면 동적 분기가 끝납니다.

```vue
<template>
  <div>
    <CascadeConverter v-if="mode === 'cascade'" />
    <BounceConverter v-else />
  </div>
</template>

<script setup>
const mode = useServiceMode() // 미들웨어가 이미 세팅해 준 값을 그대로 쓰기만 함
</script>

```

---

## 방법 2. 최상위 `app.vue` (또는 Layout)에서 한 번만 처리

> **구조가 단순할 때 가장 직관적인 방법**

라우팅 구조가 복잡하지 않고 단일 페이지 위주라면, 하위 페이지로 들어가지 말고 최상위 부모인 `app.vue`에서 주소를 딱 한 번만 검사한 뒤 자식들에게 뿌려주는 방식입니다.

### 1) 최상위 부모 (`app.vue`)

```vue
<template>
  <div class="full-screen-wrapper">
    <NuxtPage v-if="isReady" :current-mode="currentMode" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentMode = ref('bounce')
const isReady = ref(false)

onMounted(() => {
  const host = window.location.hostname
  if (host.includes('cascadeimg')) {
    currentMode.value = 'cascade'
  }
  isReady.value = true // 준비 완료
})
</script>

```

### 2) 하위 자식 페이지들

자식 페이지들은 부모가 던져준 `props`를 받아먹기만 하면 되므로 `onMounted`를 쓸 필요가 없습니다.

```vue
<template>
  <div>
    <h2>현재 모드: {{ currentMode }}</h2>
    </div>
</template>

<script setup>
// 부모가 감지해서 넘겨준 모드를 받아서 쓰기만 함
defineProps({
  currentMode: String
})
</script>

```

---

## 💡 요약

하위 페이지마다 `onMounted`를 쓰는 건 절대 금물입니다!

1. **Nuxt 환경이라면:** `middleware` 폴더에 글로벌 미들웨어를 만들어서 전역 변수(`useState`)에 모드를 꽂아두고 쓰시는 게 가장 완벽합니다.
2. **단일 레이아웃 위주라면:** `app.vue`에서 한 번만 감지해서 자식 컴포넌트들에게 `props`나 `provide/inject`로 모드를 내려주세요.

이렇게 하면 소스코드가 수백 줄 이상 줄어들고, 나중에 새로운 도메인(`streamimg...` 등)이 추가되어도 미들웨어 한 곳만 수정하면 되기 때문에 유지보수가 엄청나게 편해집니다!