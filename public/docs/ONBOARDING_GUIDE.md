# Skip Go 온보딩 가이드북

이 문서는 Skip Go 프로젝트에 새로 합류한 개발자를 위한 종합 가이드입니다. 이 가이드를 따라하면 프로젝트의 구조를 이해하고 개발을 시작할 수 있습니다.

> **📚 관련 문서**
> - [아키텍처 문서](./docs/ARCHITECTURE.md): 프로젝트의 전체 아키텍처와 구조
> - [개발 가이드](./docs/DEVELOPMENT_GUIDE.md): 상세한 개발 작업 가이드
> - [코드 스타일 가이드](./AGENTS.md): 코드 작성 가이드라인

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [사전 요구사항](#사전-요구사항)
3. [개발 환경 설정](#개발-환경-설정)
4. [프로젝트 구조](#프로젝트-구조)
5. [핵심 개념](#핵심-개념)
6. [개발 워크플로우](#개발-워크플로우)
7. [일반적인 작업 가이드](#일반적인-작업-가이드)
8. [테스트](#테스트)
9. [빌드 및 배포](#빌드-및-배포)
10. [문제 해결](#문제-해결)
11. [추가 리소스](#추가-리소스)

---

## 프로젝트 개요

### Skip Go란?

Skip Go는 여러 블록체인 생태계(Cosmos, EVM, Solana 등) 간의 크로스체인 스왑과 전송을 가능하게 하는 프로젝트입니다. 사용자는 하나의 인터페이스에서 다양한 체인 간 자산 이동을 수행할 수 있습니다.

### 주요 구성 요소

프로젝트는 모노레포 구조로 구성되어 있으며, 다음과 같은 주요 패키지로 나뉩니다:

1. **`@skip-go/client`**: Skip Go API와 상호작용하기 위한 TypeScript SDK
   - API 호출 로직
   - 트랜잭션 서명 및 실행
   - 체인별 유틸리티 함수

2. **`@skip-go/widget`**: React 기반의 UI 위젯 라이브러리
   - 사용자 인터페이스 컴포넌트
   - 지갑 연결 관리
   - 스왑 플로우 구현

3. **`examples/`**: 통합 예제 애플리케이션
   - Next.js 예제
   - Nuxt.js 예제
   - 클라이언트 사용 예제

4. **`apps/explorer`**: 탐색기 애플리케이션

### 기술 스택

- **언어**: TypeScript
- **프레임워크**: React 18+
- **상태 관리**: Jotai
- **스타일링**: Styled Components
- **빌드 도구**: Vite, tsup
- **패키지 관리**: Yarn 3 (Workspaces)
- **테스트**: Vitest, Playwright
- **버전 관리**: Changesets

---

## 사전 요구사항

### 필수 소프트웨어

다음 소프트웨어가 설치되어 있어야 합니다:

1. **Node.js**: v18 이상
2. **Yarn**: v3.2.0 이상 (프로젝트에 포함됨)
3. **Git**: 최신 버전
4. **코드 에디터**: VS Code 권장 (프로젝트에 설정 포함)

### 권장 VS Code 확장 프로그램

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### 사전 지식

다음 기술에 대한 기본 지식이 있으면 도움이 됩니다:

- TypeScript
- React 및 Hooks
- 블록체인 기본 개념
- Cosmos SDK, EVM, Solana 생태계 (선택사항)

---

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/skip-mev/skip-go.git
cd skip-go
```

### 2. 의존성 설치

```bash
yarn install
```

이 명령은 다음을 수행합니다:
- 모든 워크스페이스의 의존성 설치
- Git 서브모듈 초기화 및 업데이트
- Playwright 브라우저 설치

**참고**: 첫 설치 시 시간이 걸릴 수 있습니다. 네트워크 상태에 따라 5-10분 정도 소요될 수 있습니다.

### 3. 개발 서버 실행

모든 패키지의 개발 서버를 동시에 실행:

```bash
yarn dev
```

이 명령은 다음을 실행합니다:
- Widget 개발 서버 (Vite)
- Next.js 예제 앱 (포트 3000)
- Client watch 모드
- Explorer 개발 서버

개별 패키지만 실행하려면:

```bash
# Widget만 실행
yarn dev:widget

# Next.js 예제만 실행
yarn dev:nextjs

# Client만 watch 모드로 실행
yarn dev:client

# Explorer만 실행
yarn dev:explorer
```

### 4. 브라우저에서 확인

개발 서버가 실행되면 다음 URL에서 확인할 수 있습니다:

- Widget 개발 서버: `http://localhost:5173` (또는 Vite가 할당한 포트)
- Next.js 예제: `http://localhost:3000`
- Explorer: `http://localhost:3001` (또는 할당된 포트)

### 5. 환경 변수 설정 (필요한 경우)

대부분의 설정은 코드 내에서 관리되지만, 특정 API 키나 엔드포인트가 필요한 경우 `.env.local` 파일을 생성할 수 있습니다.

---

## 프로젝트 구조

### 전체 디렉토리 구조

```
skip-go/
├── packages/
│   ├── client/          # @skip-go/client 패키지
│   │   ├── src/
│   │   │   ├── api/     # API 호출 함수들
│   │   │   ├── private-functions/  # 내부 사용 함수
│   │   │   ├── public-functions/    # 공개 API 함수
│   │   │   ├── types/   # TypeScript 타입 정의
│   │   │   └── utils/   # 유틸리티 함수
│   │   └── package.json
│   │
│   └── widget/          # @skip-go/widget 패키지
│       ├── src/
│       │   ├── components/    # 재사용 가능한 UI 컴포넌트
│       │   ├── constants/     # 상수 및 설정
│       │   ├── hooks/         # 커스텀 React Hooks
│       │   ├── modals/        # 모달 컴포넌트
│       │   ├── pages/         # 페이지 레벨 컴포넌트
│       │   ├── providers/     # Context Providers
│       │   ├── state/         # Jotai 상태 관리
│       │   ├── utils/         # 유틸리티 함수
│       │   └── widget/        # 위젯 진입점
│       └── package.json
│
├── examples/            # 예제 애플리케이션
│   ├── nextjs/         # Next.js 통합 예제
│   ├── nuxtjs/         # Nuxt.js 통합 예제
│   └── client/         # 클라이언트 사용 예제
│
├── apps/
│   └── explorer/       # 탐색기 애플리케이션
│
├── docs/               # 문서
├── assets/             # 정적 자산 (지갑 아이콘 등)
├── vendor/             # Git 서브모듈 (프로토콜 버퍼 정의)
└── package.json       # 루트 package.json
```

### Client 패키지 구조

`packages/client/src/` 디렉토리 구조:

```
client/src/
├── api/                    # Skip Go API 호출 함수
│   ├── getRoute.ts         # 라우트 조회
│   ├── postSubmitTransaction.ts  # 트랜잭션 제출
│   └── ...
│
├── public-functions/       # 공개 API
│   ├── executeRoute.ts     # 라우트 실행
│   ├── getRouteWithGasOnReceive.ts
│   └── ...
│
├── private-functions/      # 내부 함수 (외부 노출 안 함)
│   ├── cosmos/            # Cosmos 체인 관련
│   ├── evm/               # EVM 체인 관련
│   └── svm/               # Solana 체인 관련
│
├── types/                  # TypeScript 타입 정의
│   ├── client-types.ts
│   └── swaggerTypes.ts
│
└── utils/                  # 유틸리티 함수
    ├── address.ts          # 주소 변환
    ├── convert.ts          # 데이터 변환
    └── ...
```

### Widget 패키지 구조

`packages/widget/src/` 디렉토리 구조:

```
widget/src/
├── widget/                 # 위젯 진입점
│   ├── Widget.tsx         # 메인 위젯 컴포넌트
│   ├── Router.tsx         # 라우팅 로직
│   └── ...
│
├── pages/                  # 페이지 컴포넌트
│   ├── SwapPage/          # 스왑 페이지
│   ├── SwapExecutionPage/ # 스왑 실행 페이지
│   └── TransactionHistoryPage/  # 거래 내역 페이지
│
├── components/             # 재사용 가능한 컴포넌트
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...
│
├── hooks/                  # 커스텀 Hooks
│   ├── useCreateCosmosWallets.tsx
│   ├── useCreateEvmWallets.tsx
│   ├── useGetBalance.ts
│   └── ...
│
├── state/                  # Jotai 상태 관리
│   ├── wallets.ts         # 지갑 상태
│   ├── swapPage.ts        # 스왑 페이지 상태
│   └── ...
│
├── providers/              # Context Providers
│   ├── CosmosProvider.tsx
│   ├── EVMProvider.tsx
│   └── SolanaProvider.tsx
│
└── utils/                  # 유틸리티 함수
    ├── fees.ts            # 수수료 계산
    ├── route.ts           # 라우트 관련
    └── ...
```

---

## 핵심 개념

### 1. 모노레포 구조

이 프로젝트는 Yarn Workspaces를 사용하는 모노레포입니다. 여러 패키지가 하나의 저장소에서 관리되며, 패키지 간 의존성을 쉽게 관리할 수 있습니다.

**워크스페이스 구성**:
- `packages/client`
- `packages/widget`
- `examples/*`
- `apps/*`

### 2. 상태 관리 (Jotai)

Widget 패키지는 Jotai를 사용하여 상태를 관리합니다. Jotai는 원자(atom) 기반의 상태 관리 라이브러리입니다.

**주요 원자들**:
- `wallets.ts`: 지갑 연결 상태
- `swapPage.ts`: 스왑 페이지 상태 (소스/대상 자산, 금액 등)
- `route.ts`: 라우트 정보
- `balances.ts`: 잔액 정보

**사용 예시**:
```typescript
// 원자 읽기
const sourceAsset = useAtomValue(sourceAssetAtom);

// 원자 쓰기
const [sourceAsset, setSourceAsset] = useAtom(sourceAssetAtom);

// 쓰기 전용
const setSourceAsset = useSetAtom(sourceAssetAtom);
```

### 3. 지갑 통합

프로젝트는 여러 블록체인 생태계의 지갑을 지원합니다:

- **Cosmos**: Keplr, Leap, Cosmostation 등
- **EVM**: MetaMask, WalletConnect 등
- **Solana**: Phantom, Solflare 등

각 체인 타입별로 Provider가 존재하며, 통합된 인터페이스를 제공합니다.

**지갑 타입 정의**:
```typescript
export type MinimalWallet = {
  walletName: string;
  walletPrettyName: string;
  walletChainType: ChainType;
  walletInfo: { logo?: string };
  connect: (chainId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  isWalletConnected: boolean;
  getAddress?: (props: AddressProps) => Promise<AddressResult>;
};
```

### 4. 라우팅 시스템

Skip Go는 여러 체인을 거쳐 자산을 이동시키는 라우트를 계산합니다. 라우트는 다음을 포함합니다:

- 소스 체인 및 자산
- 대상 체인 및 자산
- 중간 체인들 (있는 경우)
- 브리지 및 스왑 벤처
- 수수료 정보

### 5. 트랜잭션 실행 플로우

1. **라우트 조회**: `getRoute()` API 호출
2. **가스 검증**: 각 체인에서 필요한 가스 잔액 확인
3. **트랜잭션 서명**: 지갑을 통해 각 체인의 트랜잭션 서명
4. **트랜잭션 제출**: 서명된 트랜잭션을 각 체인에 제출
5. **상태 추적**: `trackTransaction()` API로 진행 상황 추적

### 6. Shadow DOM

Widget은 Shadow DOM을 사용하여 스타일 격리를 구현합니다. 이를 통해 위젯이 호스팅 페이지의 스타일에 영향을 받지 않습니다.

---

## 개발 워크플로우

### 1. 브랜치 전략

- `main`: 프로덕션 브랜치
- `staging`: 스테이징 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치

### 2. 개발 프로세스

#### 새 기능 개발

1. **브랜치 생성**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **개발 및 테스트**:
   - 로컬에서 개발
   - `yarn dev`로 개발 서버 실행
   - 변경사항 테스트

3. **변경사항 커밋**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Changeset 생성**:
   ```bash
   npx changeset
   ```
   - 변경된 패키지 선택
   - 버전 타입 선택 (patch/minor/major)
   - 변경사항 설명 작성

5. **PR 생성**:
   - GitHub에서 Pull Request 생성
   - 리뷰 요청

#### 버그 수정

1. **브랜치 생성**:
   ```bash
   git checkout -b fix/bug-description
   ```

2. **수정 및 테스트**:
   - 버그 재현
   - 수정
   - 테스트 작성 (가능한 경우)

3. **Changeset 생성**:
   ```bash
   npx changeset
   ```

4. **PR 생성 및 머지**

### 3. 코드 스타일

#### 파일 및 폴더 네이밍

- **컴포넌트**: PascalCase (예: `SwapPage.tsx`)
- **Hooks**: camelCase with `use` prefix (예: `useGetBalance.ts`)
- **상수**: SCREAMING_SNAKE_CASE (예: `MAX_SLIPPAGE`)
- **원자**: camelCase with `Atom` suffix (예: `sourceAssetAtom`)

#### Import 순서

```typescript
// 1. 외부 의존성
import { atom } from "jotai";
import { ChainType } from "@skip-go/client";

// 2. 내부 절대 경로 import
import { mainnetChains } from "@/constants/chains";
import { useGetAccount } from "@/hooks/useGetAccount";

// 3. 상대 경로 import
import { MinimalWallet } from "./types";
```

#### TypeScript

- 모든 함수의 매개변수와 반환값에 타입 지정
- `any` 사용 지양
- 인터페이스로 타입 정의

### 4. Git 서브모듈

프로젝트는 프로토콜 버퍼 정의를 위해 Git 서브모듈을 사용합니다.

**서브모듈 업데이트**:
```bash
yarn submodule
```

또는 개별적으로:
```bash
yarn submodule:init
yarn submodule:update
```

---

## 일반적인 작업 가이드

### 1. 새 컴포넌트 추가

1. `packages/widget/src/components/` 디렉토리에 파일 생성
2. TypeScript 타입 정의
3. Styled Components로 스타일링
4. 필요한 경우 Storybook 스토리 추가

**예시**:
```typescript
// packages/widget/src/components/MyComponent.tsx
import { styled } from "styled-components";

export const MyComponent = ({ title }: { title: string }) => {
  return <Container>{title}</Container>;
};

const Container = styled.div`
  padding: 16px;
`;
```

### 2. 새 Hook 추가

1. `packages/widget/src/hooks/` 디렉토리에 파일 생성
2. Hook 로직 구현
3. 필요한 상태는 Jotai 원자 사용

**예시**:
```typescript
// packages/widget/src/hooks/useMyHook.ts
import { useAtomValue } from "jotai";
import { sourceAssetAtom } from "@/state/swapPage";

export const useMyHook = () => {
  const sourceAsset = useAtomValue(sourceAssetAtom);
  
  // Hook 로직
  return { sourceAsset };
};
```

### 3. 새 API 함수 추가 (Client)

1. `packages/client/src/api/` 디렉토리에 파일 생성
2. API 호출 함수 구현
3. 타입 정의는 `types/` 디렉토리에 추가
4. 필요시 공개 함수로 `public-functions/`에 래퍼 추가

**예시**:
```typescript
// packages/client/src/api/getMyData.ts
import { SkipApi } from "../state/apiState";

export const getMyData = async (params: MyParams) => {
  const api = SkipApi.getInstance();
  const response = await api.getMyData(params);
  return response.data;
};
```

### 4. 상태 관리 추가

1. `packages/widget/src/state/` 디렉토리의 적절한 파일에 원자 추가
   - 도메인별로 파일 분리 (예: `wallets.ts`, `swapPage.ts`)

2. 원자 정의:
```typescript
// packages/widget/src/state/myState.ts
import { atom } from "jotai";

export const myAtom = atom<MyType>(initialValue);
```

3. 컴포넌트에서 사용:
```typescript
const [value, setValue] = useAtom(myAtom);
```

### 5. 새 지갑 추가

1. 해당 Provider 파일 수정 (`CosmosProvider.tsx`, `EVMProvider.tsx`, 또는 `SolanaProvider.tsx`)
2. 지갑 감지 로직 추가
3. 지갑 아이콘을 `assets/` 디렉토리에 추가
4. 지갑 목록에 추가

### 6. 유틸리티 함수 추가

1. 도메인별로 적절한 파일에 추가:
   - 수수료 관련: `utils/fees.ts`
   - 라우트 관련: `utils/route.ts`
   - 날짜 관련: `utils/date.ts`
   - 숫자 관련: `utils/number.ts`

2. 함수 구현 및 타입 정의

### 7. 스타일 수정

1. Styled Components 사용
2. 테마 변수 활용 (가능한 경우)
3. 반응형 디자인 고려

---

## 테스트

### Client 패키지 테스트

**단위 테스트 실행**:
```bash
yarn workspace @skip-go/client run test
```

**E2E 테스트 실행** (로컬 체인 필요):
```bash
yarn workspace @skip-go/client run e2e:setup
yarn workspace @skip-go/client run e2e:start
yarn workspace @skip-go/client run e2e:test
```

### Widget 패키지 테스트

**Playwright 테스트 실행**:
```bash
yarn workspace @skip-go/widget run test
```

**스크린샷 업데이트**:
```bash
yarn workspace @skip-go/widget run update-screenshots
```

### 테스트 작성 가이드

1. **파일 네이밍**: 테스트 대상 파일명에 `.test.ts` 또는 `.test.tsx` 추가
2. **테스트 구조**: `describe` 블록으로 그룹화
3. **커버리지**: 성공 케이스와 에러 케이스 모두 테스트

**예시**:
```typescript
import { describe, test, expect } from "vitest";

describe("MyFunction", () => {
  test("should handle normal case", () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
  
  test("should handle error case", () => {
    expect(() => myFunction(invalidInput)).toThrow();
  });
});
```

---

## 빌드 및 배포

### 로컬 빌드

**모든 패키지 빌드**:
```bash
yarn build
```

**개별 패키지 빌드**:
```bash
# Client만 빌드
yarn build:client

# Widget만 빌드
yarn build:widget

# Next.js 예제만 빌드
yarn build:nextjs
```

### 빌드 산출물

- **Client**: `packages/client/dist/`
  - ESM: `dist/esm/`
  - CommonJS: `dist/cjs/`

- **Widget**: `packages/widget/build/`
  - ESM 번들
  - 타입 정의 파일

### 배포 프로세스

배포는 GitHub Actions를 통해 자동화되어 있습니다. 자세한 내용은 `RELEASE_PROCESS.md`를 참조하세요.

**주요 단계**:
1. `staging` 브랜치를 `main`에 머지
2. 자동으로 버전 패키지 PR 생성
3. PR 머지 후 NPM에 자동 배포
4. Web Component 배포 (수동)

---

## 문제 해결

### 일반적인 문제

#### 1. 의존성 설치 실패

**문제**: `yarn install` 실패

**해결 방법**:
```bash
# 캐시 클리어
yarn cache clean

# node_modules 삭제 후 재설치
rm -rf node_modules
rm -rf packages/*/node_modules
yarn install
```

#### 2. Git 서브모듈 오류

**문제**: 서브모듈 관련 오류

**해결 방법**:
```bash
yarn submodule
```

#### 3. 빌드 실패

**문제**: TypeScript 오류 또는 빌드 실패

**해결 방법**:
- TypeScript 오류 확인: `yarn workspace @skip-go/client run build`
- 타입 생성 필요시: `yarn workspace @skip-go/client run codegen`

#### 4. 개발 서버가 시작되지 않음

**문제**: 포트 충돌 또는 다른 오류

**해결 방법**:
- 포트 확인: 다른 프로세스가 포트를 사용 중인지 확인
- 로그 확인: 터미널 오류 메시지 확인
- 캐시 클리어: `rm -rf node_modules/.vite`

#### 5. 지갑 연결 문제

**문제**: 지갑이 감지되지 않음

**해결 방법**:
- 브라우저 확장 프로그램 설치 확인
- 개발자 도구 콘솔에서 오류 확인
- Provider 설정 확인

### 디버깅 팁

1. **React DevTools**: 컴포넌트 상태 확인
2. **브라우저 개발자 도구**: 네트워크 요청 및 콘솔 로그 확인
3. **VS Code 디버거**: TypeScript 코드 디버깅
4. **Jotai DevTools**: 상태 원자 값 확인 (설치 필요)

### 도움 요청

문제가 해결되지 않으면:
1. GitHub Issues에서 유사한 문제 검색
2. 팀 채널에서 질문
3. 새로운 Issue 생성 (재현 단계 포함)

---

## 추가 리소스

### 공식 문서

- **Client 문서**: `packages/client/README.md`
- **Widget 문서**: `packages/widget/README.md`
- **온라인 문서**: https://docs.skip.build/go/

### 예제 프로젝트

- **Next.js 예제**: `examples/nextjs/`
- **Nuxt.js 예제**: `examples/nuxtjs/`
- **클라이언트 예제**: `examples/client/`

### 외부 리소스

- **Jotai 문서**: https://jotai.org/
- **React 문서**: https://react.dev/
- **TypeScript 문서**: https://www.typescriptlang.org/
- **Vite 문서**: https://vitejs.dev/

### 개발 가이드라인

- **코드 스타일**: `AGENTS.md` 참조
- **PR 가이드**: `AGENTS.md`의 "Pull Request Best Practices" 섹션
- **Changeset 가이드**: `AGENTS.md`의 "Changeset Requirements" 섹션

### 유용한 명령어

```bash
# 코드 포맷팅
yarn workspace @skip-go/widget run lint

# 타입 체크
yarn workspace @skip-go/client run build

# 체인 레지스트리 업데이트
yarn update-registries

# Swagger UI 열기
yarn swagger
```

---

## 다음 단계

온보딩을 완료했다면:

1. ✅ 개발 환경이 정상적으로 작동하는지 확인
2. ✅ 예제 앱을 실행하고 위젯 동작 확인
3. ✅ 코드베이스 탐색 및 주요 파일 읽기
4. ✅ 작은 버그 수정이나 개선 작업으로 시작
5. ✅ 팀과 소통하며 프로젝트 이해도 높이기

**행운을 빕니다! 🚀**

---

## 부록: 빠른 참조

### 주요 파일 위치

- 위젯 진입점: `packages/widget/src/widget/Widget.tsx`
- 라우팅: `packages/widget/src/widget/Router.tsx`
- 지갑 상태: `packages/widget/src/state/wallets.ts`
- 스왑 페이지 상태: `packages/widget/src/state/swapPage.ts`
- API 클라이언트: `packages/client/src/state/apiState.ts`
- 라우트 실행: `packages/client/src/public-functions/executeRoute.ts`

### 주요 원자 (Atoms)

- `sourceAssetAtom`: 소스 자산
- `destinationAssetAtom`: 대상 자산
- `walletAtom`: 현재 연결된 지갑
- `routeAtom`: 현재 라우트 정보
- `balancesAtom`: 잔액 정보

### 주요 Hooks

- `useGetBalance`: 잔액 조회
- `useCreateCosmosWallets`: Cosmos 지갑 생성
- `useCreateEvmWallets`: EVM 지갑 생성
- `useCreateSolanaWallets`: Solana 지갑 생성

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024

