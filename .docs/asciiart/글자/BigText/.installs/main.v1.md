아, `npm install` 하다가 골치 아픈 에러를 만나셨군요. `Cannot read properties of null (reading 'matches')` 에러는 `figlet` 패키지 자체의 문제가 아니라, **현재 프로젝트의 npm 캐시나 `node_modules`, 혹은 `package-lock.json` 파일이 내부적으로 꼬였을 때** 발생하는 전형적인 npm 자체의 버그성 에러입니다.

주로 이전에 다른 패키지를 설치하다가 비정상적으로 종료되었거나, 의존성 트리가 꼬여있을 때 발생합니다.

이 문제는 아래의 **3단계 다이어트 심폐소생술**로 99% 해결됩니다. 터미널에서 순서대로 명령어들을 실행해 보세요.

---

## 🛠️ npm 꼬임 해결 해결 순서

현재 열려있는 터미널(`C:\github-nangmanhunter\nangman-image`)에서 다음 명령어들을 차례대로 한 줄씩 실행합니다.

### 1단계: 꼬여있는 기존 파일들 완전히 삭제하기

기존의 의존성 트리 파일과 설치 폴더를 깔끔하게 날려버립니다. (프로젝트 소스코드는 안전하니 걱정 안 하셔도 됩니다!)

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

```

* 만약 `Remove-Item` 명령어가 권한이나 프로세스 점유 때문에 에러가 난다면, VS Code를 완전히 껐다 켜거나 파일 탐색기에서 해당 폴더로 들어가 직접 `node_modules`와 `package-lock.json`을 지워주셔도 됩니다.

### 2단계: npm 캐시 강제 청소하기

컴퓨터 내부에 저장된 npm 임시 캐시 데이터를 강제로 비워줍니다.

```powershell
npm cache clean --force

```

### 3단계: 패키지 싹 다 다시 설치하기

이제 도화지를 깨끗하게 비웠으니, 원래 쓰던 패키지들과 함께 `figlet`을 새로 설치해 줍니다.

```powershell
npm install
npm install figlet

```

---

## 💡 만약 그래도 안 된다면? (우회 방법)

만약 위의 과정을 거쳤는데도 똑같은 에러가 발생한다면, 현재 컴퓨터에 설치된 npm 자체의 버전 버그일 확률이 높습니다. 이럴 때는 npm의 경쟁자이자 훨씬 빠르고 안정적인 **pnpm**이나 **yarn**을 사용해 우회해서 설치하면 귀신같이 잘 됩니다.

터미널에 아래 명령어를 쳐서 `pnpm`으로 설치를 시도해 보세요.

```powershell
# pnpm이 없다면 글로벌로 먼저 설치
npm install -g pnpm

# pnpm으로 프로젝트 의존성 및 figlet 설치
pnpm install
pnpm add figlet

```

우선 1단계부터 적용해 보시고, `npm install figlet`이 정상적으로 성공하는지 확인해 주세요!