프로젝트에 '낭만'이 가득 묻어나는 도메인이네요!

결론부터 말씀드리면, **Nuxt 내부 코드에서 매번 `watch`를 돌리거나 페이지마다 미들웨어로 변수를 일일이 주입해 줄 필요는 전혀 없습니다.** 그렇게 하면 개발하면서 코드 관리하기도 너무 번거롭고 낭비가 심하거든요.

현재 구상하신 구조는 하나의 Nuxt 애플리케이션(한 곳)이 서브도메인(`bounce`, `cascade`)을 모두 받아서, 요청이 들어온 도메인에 따라 다른 화면이나 모드를 보여주려는 **멀티테넌시(Multi-tenancy)** 구조입니다.

Nuxt에서 이를 가장 깔끔하고 '낭만적'으로 해결할 수 있는 2가지 방법을 소개해 드릴게요.

---

## 방법 1. 글로벌 라우터 미들웨어 + Pinia/State 활용 (추천)

Nuxt의 글로벌 라우터 미들웨어(Global Router Middleware)를 사용하면, 사용자가 어떤 도메인으로 들어왔는지 최초 1번 딱 체크해서 전역 상태(State)에 주입해 줄 수 있습니다. 페이지 컴포넌트들은 이 상태만 바라보면 됩니다.

### 1. 전역 상태 정의 (`composables/useSubdomain.ts`)

먼저 현재 어떤 모드(서브도메인)인지 저장할 전역 상태를 만듭니다. (useState나 Pinia 활용)

```typescript
// composables/useSubdomain.ts
export const useSubdomain = () => {
  const mode = useState<string>('mode', () => 'default') // 'bounce' 또는 'cascade'
  
  return { mode }
}

```

### 2. 글로벌 미들웨어 작성 (`middleware/subdomain.global.ts`)

파일명에 `.global`이 붙으면 Nuxt가 알아서 모든 라우팅 시점 전에 이 미들웨어를 실행합니다. 여기서 도메인을 파싱합니다.

```typescript
// middleware/subdomain.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // SSR 및 CSR 환경 모두에서 호스트 네임 가져오기
  let hostname = ''
  
  if (import.meta.server) {
    // 서버 사이드일 때 (Nuxt 3 기준 SSR)
    const nuxtApp = useNuxtApp()
    hostname = nuxtApp.ssrContext?.event.node.req.headers.host || ''
  } else {
    // 클라이언트 사이드일 때
    hostname = window.location.hostname
  }

  const { mode } = useSubdomain()

  // 호스트네임에서 서브도메인 추출 (예: bounce.nangman.org -> bounce)
  if (hostname.includes('bounce')) {
    mode.value = 'bounce'
  } else if (hostname.includes('cascade')) {
    mode.value = 'cascade'
  } else {
    mode.value = 'default'
  }
})

```

### 3. 컴포넌트나 레이아웃에서 사용

이제 매번 watch할 필요 없이 컴포넌트에서 필요한 모드만 꺼내 쓰면 끝입니다.

```vue
<template>
  <div>
    <h1>현재 모드: {{ mode }}</h1>
    
    <BounceConverter v-if="mode === 'bounce'" />
    <CascadeConverter v-else-if="mode === 'cascade'" />
  </div>
</template>

<script setup>
const { mode } = useSubdomain()
</script>

```

---

## 방법 2. Nuxt 3 동적 라우팅 활용 (`_subdomain` 폴더 구조)

만약 `bounce`냐 `cascade`냐에 따라 코드 구조나 페이지 레이아웃 자체가 완전히 확연히 갈린다면, Nuxt의 파일 기반 라우팅을 도메인 레벨로 확장할 수도 있습니다. 다만 이 방법은 서버(인프라)단에서 요청을 주입해 주는 과정이 약간 필요합니다.

보통은 **방법 1**처럼 글로벌 미들웨어로 호스트(Host)를 분석해서 **하나의 `pages/svgtopng.vue` 안에서 컴포넌트만 스위칭**하거나, 로직 분기를 치는 것이 훨씬 직관적이고 관리가 편하실 겁니다.

---

> 💡 **인프라 팁 (Nginx 사용 시)**
> 하나의 Nuxt 서버(예: `localhost:3000`)가 두 도메인을 모두 처리하게 하려면, Nginx 같은 역방향 프록시(Reverse Proxy) 설정에서 `server_name`에 두 도메인을 모두 묶어주고 Nuxt로 넘겨주셔야 합니다. Nginx가 `Host` 헤더를 그대로 보존한 채 Nuxt로 토스해 주어야 위 미들웨어 코드가 정상적으로 도메인을 감지합니다.
> ```nginx
> server {
>     server_name bounce.nangman.org cascade.nangman.org;
> 
>     location / {
>         proxy_pass http://localhost:3000; # Nuxt 서버 주소
>         proxy_set_header Host $host;      # 이 부분이 중요합니다!
>         proxy_set_header X-Real-IP $remote_addr;
>     }
> }
> 
> ```
> 
> 

매번 귀찮게 변수를 들고 다닐 필요 전혀 없으니, 안심하고 글로벌 미들웨어와 Composable(또는 Pinia) 조합으로 깔끔하게 구현해 보세요!