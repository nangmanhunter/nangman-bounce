
##
- `gtag`.이런것도따로


##
날카로운 질문이십니다! 서비스의 지표를 측정하는 구글 애널리틱스(GA4 / `gtag`)나 광고 픽셀 같은 데이터 수집 영역까지 고려하면 당연히 드는 의문입니다.

결론부터 말씀드리면, **네, 맞습니다! 페이지가 `/svgtopng`로 겹치기 때문에, 아무런 조치를 취하지 않으면 구글 애널리틱스는 사용자가 `bounce`로 들어왔는지 `cascade`로 들어왔는지 전혀 구분하지 못하고 똑같은 하나의 페이지뷰로 집계해 버립니다.**

하지만 그렇다고 컴포넌트 내부마다 `gtag()` 코드를 덕지덕지 수동으로 따로 심어줄 필요는 없습니다. Nuxt 환경에서 이를 우아하게 해결하는 방법을 알려드릴게요.

---

## 🚨 왜 따로 처리를 해줘야 할까요?

기본적으로 `gtag`가 페이지 뷰를 트래킹할 때 참조하는 기준은 브라우저 주소창의 `location.pathname` (예: `/svgtopng`)입니다.

사용자가 다음 두 주소로 접속했을 때:

* `bounce.nangman.org/svgtopng`
* `cascade.nangman.org/svgtopng`

도메인은 다르지만 뒤의 경로(Path)가 `/svgtopng`로 완벽히 똑같기 때문에, GA4 대시보드에는 그냥 `/svgtopng`라는 단일 페이지의 조회수만 올라가게 됩니다. 어떤 테넌트(모드)에서 발생한 트래픽인지 통계를 낼 수가 없게 되죠.

---

## 🛠️ 깔끔하게 해결하는 2가지 낭만적인 방법

### 방법 1. 글로벌 미들웨어에서 `page_view` 수동 송신 (가장 추천)

우리가 앞서 만들어 둔 글로벌 라우터 미들웨어(`middleware/subdomain.global.ts`)를 활용하는 방식입니다. 도메인을 판별하는 그 시점에 `gtag`에 "도메인 이름을 포함한 가상의 주소나 커스텀 변수"를 함께 쏴버리는 것입니다.

```typescript
// middleware/subdomain.global.ts
export default defineNuxtRouteMiddleware((to) => {
  let hostname = ''
  if (import.meta.server) {
    const nuxtApp = useNuxtApp()
    hostname = nuxtApp.ssrContext?.event.node.req.headers.host || ''
  } else {
    hostname = window.location.hostname
  }

  // 1. 도메인 모드 판별
  const mode = hostname.includes('bounce') ? 'bounce' : hostname.includes('cascade') ? 'cascade' : 'default'

  // 2. 오직 브라우저(클라이언트) 환경에서만 gtag 트래킹 코드를 실행
  if (import.meta.client && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      // 주소창 주소 뒤에 ?mode=bounce 같은 파라미터를 강제로 붙여서 GA로 전송
      page_path: `${to.path}?mode=${mode}`, 
      page_title: `[${mode.toUpperCase()}] ${to.meta.title || '변환기'}`,
      // 또는 커스텀 디멘션(차원) 변수로 주입
      fallback_mode: mode 
    })
  }
})

```

이렇게 미들웨어 한 곳에만 딱 정의해 두면, 컴포넌트가 동적으로 어떻게 날아다니든 상관없이 **라우팅이 일어날 때마다 자동으로 도메인 모드가 입혀진 깔끔한 통계 데이터**가 수집됩니다.

### 방법 2. 변환기 컴포넌트 내부에서 '커스텀 이벤트' 발송

만약 단순히 페이지 뷰(방문자 수) 측정을 넘어, "Bounce 변환기에서 실제로 SVG 파일 변환 버튼을 누른 횟수"나 "Cascade 변환기에서 옵션을 수정한 횟수"처럼 구체적인 행동 패턴을 추적하고 싶다면, 그때는 각 컴포넌트 안쪽에서 개별 이벤트를 쏴주는 게 맞습니다.

* **`components/BounceConverter.vue` 내부 코드**
```javascript
const onConvert = () => {
  // 변환 로직 실행...

  // GA4로 Bounce 전용 변환 이벤트 발송
  if (window.gtag) {
    window.gtag('event', 'convert_svg', {
      event_category: 'converter',
      event_label: 'bounce_mode'
    })
  }
}

```



---

## 💡 요약하자면

1. **기본 페이지 뷰 트래킹**: 컴포넌트마다 따로 갈 필요 없이, **글로벌 미들웨어 딱 한 곳**에서 도메인(`mode`) 정보를 엮어서 `gtag`로 한 번에 쏴주면 해결됩니다.
2. **상세 기능 클릭/이벤트 트래킹**: 각 도메인 전용 컴포넌트(`BounceConverter.vue`, `CascadeConverter.vue`) 내부에서 사용자의 행동에 맞춰 **개별 `gtag('event', ...)` 코드**를 따로 심어주는 것이 아키텍처적으로 정확합니다.

비즈니스 지표나 통계 정합성까지 꼼꼼하게 챙기시는 모습이 멋지십니다. 이 부분만 미들웨어에 낭만 있게 슥 얹어주시면 통계 꼬일 걱정도 완벽히 사라질 겁니다!