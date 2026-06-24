클라우드플레어(Cloudflare) 같은 CDN/서버리스 환경을 쓰면서 도메인은 다르게 분리하되, 소스코드는 하나로 관리하고 싶으시군요! 이거 아주 날카롭고 좋은 고민입니다.

결론부터 말씀드리면, **도메인이 달라도 하나의 깃허브 레포지토리(소스코드)로 완벽하게 합쳐서 배포할 수 있습니다.** 아싸리 분리하실 필요 전혀 없어요!

클라우드플레어 환경에서 이 공통 로직을 유지하며 도메인만 쪼개는 3가지 실무 전략을 알려드릴게요. 사장님의 현재 배포 인프라 상태에 따라 가장 편한 걸 고르시면 됩니다.

---

## 전략 1. 클라우드플레어 Pages (모노레포/멀티 도메인)

> **가장 추천: 깃허브 레포 1개 + 클라우드플레어 프로젝트 1개 (도메인만 2개 연결)**

지금 만드신 툴은 Nuxt 같은 프론트엔드 프레임워크 기반이므로, 클라우드플레어 Pages(CF Pages)를 쓰고 계시거나 쓸 확률이 높습니다.

CF Pages는 **하나의 프로젝트(레포지토리)에 도메인을 원하는 만큼 무한대로 붙일 수 있습니다.**

1. 깃허브 레포지토리 **딱 1개**에 `bounceimg`와 `cascadeimg`용 컴포넌트를 둘 다 넣습니다. (라우팅을 `/bounce`와 `/cascade`로 나누거나, 단일 파일 내에서 도메인별로 조건문 분기)
2. 클라우드플레어 Pages에 이 깃허브 레포를 연동해 빌드합니다.
3. 빌드된 하나의 프로젝트에 **Custom Domain(커스텀 도메인) 설정**으로 가셔서 두 개를 다 등록합니다.
* `bounceimg.nangman.org` ➔ 연결
* `cascadeimg.nangman.org` ➔ 연결


4. 코드 내부에서는 브라우저 주소(`window.location.hostname`)를 읽어서 "바운스 주소로 들어오면 바운스 UI를, 캐스케이드 주소로 들어오면 캐스케이드 UI를" 띄워주면 끝입니다.

---

## 전략 2. Nginx 뒷단(Proxy Pass) 활용

> **전통적인 서버 방식: Nginx가 앞단에서 도메인별로 교통정리**

만약 완전히 정적 호스팅(Pages)이 아니라, 뒷단에 Nginx를 둔 VPS(리눅스 서버) 환경을 CDN 뒤에 붙이시는 거라면 말씀하신 방식이 정확히 정답입니다.

클라우드플레어 DNS에는 두 도메인 모두 사장님의 Nginx 서버 IP를 바라보게 프록시(주황색 구름)를 켜두고, Nginx 설정에서 다음과 같이 라우팅만 찢어주면 됩니다.

```nginx
# 1. 바운스 도메인 설정
server {
    server_name bounceimg.nangman.org;
    location / {
        proxy_pass http://localhost:3000; # 같은 Nuxt 포트인데 뒤에 파라미터나 헤더를 줄 수 있음
        proxy_set_header X-Service-Type "bounce";
    }
}

# 2. 캐스케이드 도메인 설정
server {
    server_name cascadeimg.nangman.org;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Service-Type "cascade";
    }
}

```

이렇게 하면 소스코드는 1개만 서버에서 돌고 있지만, Nginx가 들어오는 도메인에 따라 헤더나 가상 경로를 주입해 주기 때문에 완벽하게 하나의 코드로 두 도메인을 방어할 수 있습니다.

---

## 전략 3. 클라우드플레어 Workers (서버리스 라우팅)

> **가장 테크니컬한 방식: CDN 단에서 주소를 바꿔치기**

"나는 깃허브 레포를 진짜 도메인별로 2개의 프로젝트로 클라우드플레어에 등록해야만 하는 상황이다!" 하신다면, 깃허브를 쪼개지 말고 앞단에 **클라우드플레어 Workers**를 한 장 얹으시면 됩니다.

Workers는 CDN edge 단에서 돌아가는 초경량 자바스크립트 코드입니다.

1. 깃허브에는 공통 코드가 들어있는 메인 서비스 딱 1개만 배포해 둡니다. (예: `core-svg.nangman.org`)
2. `bounceimg...`와 `cascadeimg...`로 접속이 들어오면, 클라우드플레어 워커가 그 요청을 가로챕니다.
3. 워커 내부에서 "아, 바운스로 왔네? 그러면 메인 서비스의 `/bounce` 페이지 내용을 긁어다 유저한테 겉모습만 바운스 도메인인 것처럼 보여줘야지!" 하고 Reverse Proxy(역프록시)를 쳐버리는 방식입니다.

---

## 🔥 사장님을 위한 최종 결론 및 권장 로드맵

복잡하게 갈 필요 없이 [전략 1]이 현재 구조에서 가장 완벽하고 깔끔합니다.

"깃허브 레포지토리 1개 유지" + "클라우드플레어 프로젝트 1개"로 가세요.
그리고 소스코드(`app.vue` 나 라우팅 파일) 맨 위에 딱 이 코드 한 줄만 넣으시면 됩니다.

```javascript
import { ref, onMounted } from 'vue'

const currentMode = ref('bounce') // 기본값

onMounted(() => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    
    // 도메인 주소에 따라 모드를 동적으로 변경
    if (host.includes('cascadeimg')) {
      currentMode.value = 'cascade'
    } else {
      currentMode.value = 'bounce'
    }
  }
})

```

이렇게 해두면 `uiText`나 CSS 스타일을 `v-if="currentMode === 'bounce'"` 같은 형태로 한 코드 안에서 가볍게 제어할 수 있습니다.

복사 붙여넣기 하면서 양쪽 깃허브 레포 싱크 맞추느라 고생할 필요도 없고, 클라우드플레어 설정도 도메인 두 개 툭툭 추가해주면 끝납니다. 이 방향으로 빌드 구상해 보세요!