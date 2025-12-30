# Skip Go 개발 가이드

이 문서는 Skip Go 프로젝트에서 실제 개발 작업을 수행하는 방법을 **인수인계 받은 개발자가 바로 작업할 수 있도록** 상세히 설명합니다.

## 목차

1. [개발 환경 설정 (상세)](#개발-환경-설정-상세)
2. [프로젝트 구조 이해](#프로젝트-구조-이해)
3. [일반적인 개발 작업 (단계별 가이드)](#일반적인-개발-작업-단계별-가이드)
4. [상태 관리 작업 (실무)](#상태-관리-작업-실무)
5. [API 통합 작업 (실무)](#api-통합-작업-실무)
6. [지갑 통합 작업 (실무)](#지갑-통합-작업-실무)
7. [UI 컴포넌트 작업 (실무)](#ui-컴포넌트-작업-실무)
8. [트랜잭션 로직 작업](#트랜잭션-로직-작업)
9. [테스트 작성 (실무)](#테스트-작성-실무)
10. [디버깅 (실무)](#디버깅-실무)
11. [성능 최적화 (실무)](#성능-최적화-실무)
12. [일반적인 문제 해결](#일반적인-문제-해결)

---

## 개발 환경 설정 (상세)

### 필수 요구사항 확인

**Node.js 버전 확인**:
```bash
node --version  # v18 이상 필요
```

**Yarn 버전 확인**:
```bash
yarn --version  # 3.2.0 이상 (프로젝트에 포함됨)
```

### 저장소 클론 및 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/skip-mev/skip-go.git
cd skip-go

# 2. 의존성 설치 (처음에는 시간이 걸릴 수 있음)
yarn install

# 이 명령은 다음을 수행합니다:
# - 모든 워크스페이스의 의존성 설치
# - Git 서브모듈 초기화 및 업데이트
# - Playwright 브라우저 설치
```

**예상 시간**: 네트워크 상태에 따라 5-10분

### 개발 서버 실행

**모든 패키지 동시 실행**:
```bash
yarn dev
```

**개별 패키지 실행**:
```bash
# Widget만 실행 (포트 5173)
yarn dev:widget

# Next.js 예제만 실행 (포트 3000)
yarn dev:nextjs

# Client만 watch 모드
yarn dev:client

# Explorer만 실행
yarn dev:explorer
```

**접속 URL**:
- Widget: `http://localhost:5173`
- Next.js 예제: `http://localhost:3000`
- Explorer: 할당된 포트

### VS Code 설정

**권장 확장 프로그램**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

**설정 파일**: `.vscode/settings.json`에 이미 설정되어 있음

---

## 프로젝트 구조 이해

### 모노레포 구조

프로젝트는 Yarn Workspaces를 사용하는 모노레포입니다:

```
skip-go/
├── packages/
│   ├── client/      # @skip-go/client 패키지
│   └── widget/      # @skip-go/widget 패키지
├── examples/        # 예제 애플리케이션
├── apps/            # 애플리케이션
└── docs/            # 문서
```

### 패키지 간 의존성

- `widget` → `client` (workspace dependency)
- `examples/nextjs` → `widget`, `client`

### 주요 진입점

**Client**:
- `packages/client/src/index.ts`: 모든 공개 API export

**Widget**:
- `packages/widget/src/index.tsx`: Widget 컴포넌트 export
- `packages/widget/src/widget/Widget.tsx`: 메인 위젯 컴포넌트

---

## 일반적인 개발 작업 (단계별 가이드)

### 작업 1: 새 컴포넌트 추가

#### 단계 1: 컴포넌트 파일 생성

**위치**: `packages/widget/src/components/MyComponent.tsx`

```typescript
import { styled } from "styled-components";
import { useAtomValue } from "jotai";
import { sourceAssetAtom } from "@/state/swapPage";

export type MyComponentProps = {
  title: string;
  onClick?: () => void;
};

export const MyComponent = ({ title, onClick }: MyComponentProps) => {
  const sourceAsset = useAtomValue(sourceAssetAtom);
  
  return (
    <Container onClick={onClick}>
      <Title>{title}</Title>
      {sourceAsset && (
        <AssetInfo>
          {sourceAsset.denom} on {sourceAsset.chainId}
        </AssetInfo>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
  
  &:hover {
    opacity: ${({ onClick }) => (onClick ? 0.8 : 1)};
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
`;

const AssetInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
```

#### 단계 2: 컴포넌트 사용

```typescript
// packages/widget/src/pages/SwapPage/SwapPage.tsx
import { MyComponent } from "@/components/MyComponent";

const SwapPage = () => {
  return (
    <div>
      <MyComponent 
        title="My Component"
        onClick={() => console.log("clicked")}
      />
    </div>
  );
};
```

#### 단계 3: 테스트 (선택사항)

```typescript
// packages/widget/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

test("renders title", () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

### 작업 2: 새 Hook 추가

#### 단계 1: Hook 파일 생성

**위치**: `packages/widget/src/hooks/useMyHook.ts`

```typescript
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useCallback } from "react";
import { sourceAssetAtom } from "@/state/swapPage";
import { skipRouteAtom } from "@/state/route";

export const useMyHook = () => {
  const sourceAsset = useAtomValue(sourceAssetAtom);
  const { data: route } = useAtomValue(skipRouteAtom);
  
  // 계산된 값
  const computedValue = useMemo(() => {
    if (!sourceAsset || !route) return null;
    
    // 복잡한 계산 로직
    return {
      // ...
    };
  }, [sourceAsset, route]);
  
  // 액션 함수
  const handleAction = useCallback(() => {
    // 액션 로직
  }, []);
  
  return {
    computedValue,
    handleAction,
  };
};
```

#### 단계 2: Hook 사용

```typescript
const MyComponent = () => {
  const { computedValue, handleAction } = useMyHook();
  
  return (
    <div>
      {computedValue && <div>{/* ... */}</div>}
      <button onClick={handleAction}>Action</button>
    </div>
  );
};
```

### 작업 3: 새 유틸리티 함수 추가

#### 도메인별 파일 선택

- 수수료 관련: `packages/widget/src/utils/fees.ts`
- 라우트 관련: `packages/widget/src/utils/route.ts`
- 숫자 관련: `packages/widget/src/utils/number.ts`
- 날짜 관련: `packages/widget/src/utils/date.ts`
- 암호화 관련: `packages/widget/src/utils/crypto.ts`

#### 단계 1: 함수 추가

```typescript
// packages/widget/src/utils/myUtils.ts
export const myUtilityFunction = (input: string): string => {
  // 유틸리티 로직
  if (!input) return "";
  
  return input.toUpperCase();
};

// 타입 정의
export type MyUtilityResult = {
  value: string;
  isValid: boolean;
};

export const myComplexUtility = (input: string): MyUtilityResult => {
  return {
    value: input.toUpperCase(),
    isValid: input.length > 0,
  };
};
```

#### 단계 2: 함수 사용

```typescript
import { myUtilityFunction } from "@/utils/myUtils";

const MyComponent = () => {
  const result = myUtilityFunction("hello");
  return <div>{result}</div>;
};
```

#### 단계 3: 테스트 작성

```typescript
// packages/widget/src/utils/__tests__/myUtils.test.ts
import { describe, test, expect } from "vitest";
import { myUtilityFunction } from "../myUtils";

describe("myUtilityFunction", () => {
  test("should convert to uppercase", () => {
    expect(myUtilityFunction("hello")).toBe("HELLO");
  });
  
  test("should handle empty string", () => {
    expect(myUtilityFunction("")).toBe("");
  });
});
```

---

## 상태 관리 작업 (실무)

### 원자 추가하기

#### 기본 원자 추가

**위치**: 도메인별 파일에 추가
- 지갑 관련: `packages/widget/src/state/wallets.ts`
- 스왑 관련: `packages/widget/src/state/swapPage.ts`
- 라우트 관련: `packages/widget/src/state/route.ts`

**예시**:
```typescript
// packages/widget/src/state/myState.ts
import { atom } from "jotai";

export const myAtom = atom<string>("initial value");
```

#### 로컬 스토리지 동기화 원자

```typescript
import { atomWithStorageNoCrossTabSync } from "@/utils/storage";
import { LOCAL_STORAGE_KEYS } from "./localStorageKeys";

// LOCAL_STORAGE_KEYS에 키 추가
export const LOCAL_STORAGE_KEYS = {
  // ... 기존 키들
  myKey: "myKey",
} as const;

// 원자 생성
export const myPersistedAtom = atomWithStorageNoCrossTabSync<string>(
  LOCAL_STORAGE_KEYS.myKey,
  "default value",
);
```

**주의사항**:
- `atomWithStorageNoCrossTabSync`는 크로스 탭 동기화를 하지 않음 (성능 최적화)
- 크로스 탭 동기화가 필요하면 `atomWithStorage` 사용 (하지만 성능 저하 가능)

#### 파생 원자 (읽기 전용)

```typescript
export const derivedAtom = atom((get) => {
  const myValue = get(myAtom);
  const anotherValue = get(anotherAtom);
  
  // 계산 로직
  return myValue + anotherValue;
});
```

#### 쓰기 가능한 파생 원자

```typescript
export const writableDerivedAtom = atom(
  (get) => get(myAtom),
  (_get, set, newValue: string) => {
    set(myAtom, newValue);
    // 추가 로직
    console.log("Value updated:", newValue);
  },
);
```

#### 비동기 원자 (API 호출)

```typescript
import { atomWithQuery } from "jotai-tanstack-query";
import { getMyData } from "@skip-go/client";

export const asyncAtom = atomWithQuery((get) => {
  const dependency = get(myAtom);
  
  // 조건부 쿼리 활성화
  if (!dependency) {
    return { 
      queryKey: ["myQuery", "skip"], 
      queryFn: () => null 
    };
  }
  
  return {
    queryKey: ["myQuery", dependency],
    queryFn: async () => {
      const response = await getMyData({ id: dependency });
      return response.data;
    },
    // 옵션
    retry: 1,
    refetchInterval: 1000 * 30, // 30초마다 재조회
  };
});
```

**사용**:
```typescript
const MyComponent = () => {
  const { data, isLoading, error } = useAtomValue(asyncAtom);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data}</div>;
};
```

#### Effect 원자 (사이드 이펙트)

```typescript
import { atomEffect } from "jotai-effect";

export const myEffect = atomEffect((get) => {
  const value = get(myAtom);
  const callbacks = get(callbacksAtom);
  
  // 사이드 이펙트 로직
  if (callbacks?.onValueChanged) {
    callbacks.onValueChanged(value);
  }
  
  // 정리 함수 (선택사항)
  return () => {
    // cleanup
  };
});
```

**컴포넌트에서 활성화**:
```typescript
import { useAtom } from "jotai";
import { myEffect } from "@/state/myState";

const MyComponent = () => {
  useAtom(myEffect); // Effect 활성화
  // ...
};
```

### 원자 사용 패턴

#### 읽기 전용

```typescript
const value = useAtomValue(myAtom);
```

#### 읽기/쓰기

```typescript
const [value, setValue] = useAtom(myAtom);
```

#### 쓰기 전용

```typescript
const setValue = useSetAtom(myAtom);
```

#### 조건부 구독

```typescript
const value = useAtomValue(
  useMemo(() => atom((get) => {
    const condition = get(conditionAtom);
    if (!condition) return null;
    return get(myAtom);
  }), [])
);
```

---

## API 통합 작업 (실무)

### Client 패키지에서 API 함수 추가

#### 단계 1: API 엔드포인트 함수 생성

**위치**: `packages/client/src/api/getMyData.ts`

```typescript
import { ApiState } from "../state/apiState";
import type { ApiResponse } from "../utils/generateApi";

export const getMyData = async (
  params: MyParams,
): Promise<ApiResponse<"myData">> => {
  const api = ApiState.getInstance();
  const response = await api.getMyData(params);
  return response;
};
```

#### 단계 2: 타입 정의

**위치**: `packages/client/src/types/client-types.ts`

```typescript
export type MyParams = {
  id: string;
  chainId?: string;
};
```

#### 단계 3: 공개 함수로 래핑 (필요시)

**위치**: `packages/client/src/public-functions/getMyDataWithProcessing.ts`

```typescript
import { getMyData } from "../api/getMyData";
import type { MyParams } from "../types/client-types";

export const getMyDataWithProcessing = async (params: MyParams) => {
  const response = await getMyData(params);
  
  // 추가 처리
  const processed = {
    ...response.data,
    processedAt: new Date().toISOString(),
  };
  
  return processed;
};
```

#### 단계 4: Export

**위치**: `packages/client/src/index.ts`

```typescript
export { getMyData } from "./api/getMyData";
export { getMyDataWithProcessing } from "./public-functions/getMyDataWithProcessing";
export type { MyParams } from "./types/client-types";
```

### Widget에서 API 사용

#### 방법 1: 직접 호출

```typescript
import { getMyData } from "@skip-go/client";

const MyComponent = () => {
  const handleClick = async () => {
    const data = await getMyData({ id: "123" });
    console.log(data);
  };
  
  return <button onClick={handleClick}>Get Data</button>;
};
```

#### 방법 2: 원자와 통합 (권장)

```typescript
import { atomWithQuery } from "jotai-tanstack-query";
import { getMyData } from "@skip-go/client";

export const myDataAtom = atomWithQuery((get) => {
  const id = get(idAtom);
  
  if (!id) {
    return { queryKey: ["myData", "skip"], queryFn: () => null };
  }
  
  return {
    queryKey: ["myData", id],
    queryFn: () => getMyData({ id }),
  };
});

// 컴포넌트에서 사용
const MyComponent = () => {
  const { data, isLoading } = useAtomValue(myDataAtom);
  // ...
};
```

---

## 지갑 통합 작업 (실무)

### Cosmos 지갑 추가

#### 단계 1: 지갑 정보 확인

**위치**: `packages/widget/src/hooks/useCreateCosmosWallets.tsx`

**기존 지갑 목록 확인**:
```typescript
const cosmosWallets = getAvailableWallets();
// ['keplr', 'leap', 'cosmostation', ...]
```

#### 단계 2: 지갑 추가

```typescript
// useCreateCosmosWallets.tsx 내부
const wallets: MinimalWallet[] = [];

for (const wallet of cosmosWallets) {
  // ... 기존 지갑들
  
  // 새 지갑 추가
  if (wallet === "my-wallet") {
    wallets.push({
      walletName: "my-wallet",
      walletPrettyName: "My Wallet",
      walletChainType: ChainType.Cosmos,
      walletInfo: {
        logo: "/path/to/logo.png",
      },
      connect: async (chainIdToConnect?: string) => {
        // 연결 로직
        const response = await connect({
          chainId: chainIdToConnect || initialChainIds,
          walletType: wallet,
        });
        // ...
      },
      disconnect: async () => {
        await disconnectAsync();
      },
      isWalletConnected: currentWallet === wallet,
      getAddress: async (props) => {
        // 주소 가져오기 로직
        const key = await getWallet(wallet).getKey(chainId);
        return { address: key.bech32Address };
      },
    });
  }
}
```

#### 단계 3: 지갑 아이콘 추가

**위치**: `assets/wallet-icon-my-wallet.png`

**크기**: 권장 512x512px

#### 단계 4: 초기 체인 ID 설정

**위치**: `packages/widget/src/constants/graz.ts`

```typescript
export const myWalletChainIdsInitialConnect = [
  "cosmoshub-4",
  "osmosis-1",
  // ...
];
```

### EVM 지갑 추가

**위치**: `packages/widget/src/hooks/useCreateEvmWallets.tsx`

유사한 패턴으로 추가 (Cosmos와 동일한 구조)

### Solana 지갑 추가

**위치**: `packages/widget/src/hooks/useCreateSolanaWallets.tsx`

유사한 패턴으로 추가

---

## UI 컴포넌트 작업 (실무)

### Styled Components 사용

```typescript
import { styled } from "styled-components";

export const MyComponent = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;
```

### 테마 사용

```typescript
import { useAtomValue } from "jotai";
import { themeAtom } from "@/state/skipClient";

const MyComponent = () => {
  const theme = useAtomValue(themeAtom);
  
  return (
    <div style={{ 
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    }}>
      {/* ... */}
    </div>
  );
};
```

### 모달 사용

```typescript
import NiceModal from "@ebay/nice-modal-react";
import { Modals } from "@/modals/registerModals";

const MyComponent = () => {
  const handleOpenModal = () => {
    NiceModal.show(Modals.AssetAndChainSelectorModal, {
      context: "source",
      onSelect: (asset) => {
        console.log("Selected:", asset);
        NiceModal.hide(Modals.AssetAndChainSelectorModal);
      },
    });
  };
  
  return <button onClick={handleOpenModal}>Open Modal</button>;
};
```

### 새 모달 추가

#### 단계 1: 모달 컴포넌트 생성

**위치**: `packages/widget/src/modals/MyModal/MyModal.tsx`

```typescript
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal } from "@/components/Modal";

export const MyModal = NiceModal.create<{
  title: string;
  onConfirm: () => void;
}>(({ title, onConfirm }) => {
  const modal = useModal();
  
  return (
    <Modal onClose={modal.hide}>
      <h2>{title}</h2>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={modal.hide}>Cancel</button>
    </Modal>
  );
});
```

#### 단계 2: 모달 등록

**위치**: `packages/widget/src/modals/registerModals.ts`

```typescript
import { MyModal } from "./MyModal/MyModal";

export const Modals = {
  // ... 기존 모달들
  MyModal: "MyModal",
} as const;

// 등록
NiceModal.register(Modals.MyModal, MyModal);
```

#### 단계 3: 모달 사용

```typescript
NiceModal.show(Modals.MyModal, {
  title: "Confirm",
  onConfirm: () => {
    console.log("Confirmed");
    NiceModal.hide(Modals.MyModal);
  },
});
```

---

## 트랜잭션 로직 작업

### 트랜잭션 실행 로직 수정

**위치**: `packages/client/src/private-functions/executeTransactions.ts`

**주의사항**:
- 이 파일은 내부 함수이므로 직접 수정보다는 공개 함수를 통해 확장
- 트랜잭션 실행 플로우 이해 필요

### 새 체인 타입 추가

**위치**: `packages/client/src/private-functions/`

1. 새 디렉토리 생성 (예: `starknet/`)
2. 체인별 함수 구현:
   - `executeStarknetTransaction.ts`
   - `signStarknetTransaction.ts`
   - `validateStarknetGasBalance.ts`
3. `executeTransactions.ts`에 통합

---

## 테스트 작성 (실무)

### Client 패키지 테스트

**위치**: `packages/client/src/__test__/`

**예시**:
```typescript
import { describe, test, expect } from "vitest";
import { myFunction } from "../utils/myUtils";

describe("myFunction", () => {
  test("should handle normal case", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });
  
  test("should handle error case", () => {
    expect(() => myFunction("invalid")).toThrow();
  });
});
```

**실행**:
```bash
yarn workspace @skip-go/client run test
```

### Widget 패키지 테스트

**위치**: `packages/widget/src/__tests__/`

**예시** (Playwright):
```typescript
import { test, expect } from "@playwright/test";

test("should render widget", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("[data-testid='widget']")).toBeVisible();
});
```

**실행**:
```bash
yarn workspace @skip-go/widget run test
```

---

## 디버깅 (실무)

### Jotai 원자 값 확인

```typescript
// 개발 중 원자 값 로깅
const MyComponent = () => {
  const value = useAtomValue(myAtom);
  console.log("Atom value:", value);
  // ...
};
```

### React DevTools

- 컴포넌트 트리 확인
- Props 및 State 확인
- Hook 값 확인

### 네트워크 요청 확인

- 브라우저 개발자 도구 → Network 탭
- API 요청/응답 확인
- 에러 상태 코드 확인

### 에러 바운더리

에러는 `Router.tsx`의 ErrorBoundary에서 처리됩니다.

---

## 성능 최적화 (실무)

### 메모이제이션

```typescript
import { useMemo } from "react";

const MyComponent = ({ data }) => {
  const processedData = useMemo(() => {
    // 비용이 큰 계산
    return expensiveCalculation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
};
```

### 컴포넌트 메모이제이션

```typescript
import { memo } from "react";

export const MyComponent = memo(({ prop }) => {
  return <div>{prop}</div>;
});
```

### 디바운싱

원자에 디바운싱이 필요한 경우 `atomWithDebounce` 사용:

```typescript
import { atomWithDebounce } from "@/utils/atomWithDebounce";

const {
  debouncedValueAtom,
  valueInitialized,
  clearTimeoutAtom,
} = atomWithDebounce<string>();
```

---

## 일반적인 문제 해결

### 문제 1: 원자가 업데이트되지 않음

**원인**: 원자 구독이 제대로 되지 않음

**해결**:
```typescript
// 잘못된 방법
const value = myAtom; // ❌

// 올바른 방법
const value = useAtomValue(myAtom); // ✅
```

### 문제 2: 무한 리렌더링

**원인**: Effect 원자에서 원인 원자를 업데이트

**해결**:
```typescript
// 잘못된 방법
export const badEffect = atomEffect((get, set) => {
  const value = get(myAtom);
  set(myAtom, value + 1); // ❌ 무한 루프
});

// 올바른 방법
export const goodEffect = atomEffect((get) => {
  const value = get(myAtom);
  // 읽기만 하거나, 다른 원자 업데이트
  console.log(value);
});
```

### 문제 3: API 호출이 너무 많음

**원인**: 디바운싱 없이 원자 업데이트

**해결**: `atomWithDebounce` 사용

---

**문서 버전**: 2.0  
**최종 업데이트**: 2024

