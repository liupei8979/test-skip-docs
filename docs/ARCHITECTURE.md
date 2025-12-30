# Skip Go 아키텍처 문서

## 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [전반적 아키텍처](#전반적-아키텍처)
3. [패키지별 상세 아키텍처](#패키지별-상세-아키텍처)
4. [데이터 플로우 상세 분석](#데이터-플로우-상세-분석)
5. [상태 관리 아키텍처](#상태-관리-아키텍처)
6. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
7. [API 통합 아키텍처](#api-통합-아키텍처)
8. [지갑 통합 아키텍처](#지갑-통합-아키텍처)
9. [트랜잭션 실행 아키텍처](#트랜잭션-실행-아키텍처)
10. [에러 처리 아키텍처](#에러-처리-아키텍처)

---

## 아키텍처 개요

### 설계 원칙

1. **관심사의 분리**: UI와 비즈니스 로직 분리
2. **모듈화**: 독립적으로 작동하는 모듈 구성
3. **확장성**: 새로운 체인, 지갑, 기능 쉽게 추가
4. **타입 안정성**: TypeScript로 컴파일 타임 오류 방지
5. **성능**: 불필요한 리렌더링 및 API 호출 최소화

### 아키텍처 레이어

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  (Widget: React Components, UI, User Interactions)     │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    State Management Layer                 │
│  (Jotai Atoms, Effects, Derived State)                   │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    Business Logic Layer                   │
│  (Client: API Calls, Transaction Logic, Utilities)       │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    Integration Layer                      │
│  (Wallet Providers, Blockchain RPC, Skip Go API)          │
└───────────────────────────────────────────────────────────┘
```

---

## 전반적 아키텍처

### 시스템 구성

```
┌──────────────────────────────────────────────────────────────┐
│                      Skip Go Ecosystem                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Widget     │────────▶│   Client     │                  │
│  │  (React UI)  │         │  (Core SDK)  │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌──────────────────────────────────────────┐                │
│  │         External Integrations            │                │
│  ├──────────────┬──────────────┬───────────┤                │
│  │   Wallets    │  Blockchains │ Skip API  │                │
│  │              │              │           │                │
│  │ - Keplr      │ - Cosmos Hub │ - Route   │                │
│  │ - MetaMask   │ - Ethereum   │ - Track   │                │
│  │ - Phantom    │ - Solana     │ - Assets  │                │
│  └──────────────┴──────────────┴───────────┘                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 패키지 간 의존성

```
@skip-go/widget
    │
    ├──▶ @skip-go/client (workspace dependency)
    │       │
    │       ├──▶ @cosmjs/* (Cosmos SDK)
    │       ├──▶ viem (EVM)
    │       └──▶ @solana/web3.js (Solana)
    │
    ├──▶ react, react-dom
    ├──▶ jotai (상태 관리)
    ├──▶ @tanstack/react-query (데이터 페칭)
    └──▶ styled-components (스타일링)
```

**의존성 규칙**:
- Widget은 Client에 의존하지만, Client는 Widget에 의존하지 않음
- Client는 순수 TypeScript 라이브러리 (React 의존성 없음)
- 각 패키지는 독립적으로 빌드 및 배포 가능

---

## 패키지별 상세 아키텍처

### 1. @skip-go/client 패키지

#### 디렉토리 구조 및 책임

```
packages/client/src/
│
├── api/                          # API 엔드포인트 함수
│   ├── getRoute.ts              # 라우트 조회
│   ├── postMessages.ts          # 트랜잭션 메시지 생성
│   ├── postSubmitTransaction.ts # 트랜잭션 제출
│   └── postTrackTransaction.ts  # 트랜잭션 추적
│
├── public-functions/             # 공개 API (외부 사용)
│   ├── executeRoute.ts         # 라우트 실행 (메인 함수)
│   ├── getRouteWithGasOnReceive.ts
│   ├── waitForTransaction.ts
│   └── subscribeToRouteStatus.ts
│
├── private-functions/            # 내부 함수 (외부 노출 안 함)
│   ├── cosmos/                  # Cosmos 체인 처리
│   │   ├── executeCosmosTransaction.ts
│   │   ├── signCosmosMessageAmino.ts
│   │   ├── signCosmosMessageDirect.ts
│   │   └── signCosmosTransaction.ts
│   ├── evm/                     # EVM 체인 처리
│   │   ├── executeEvmTransaction.ts
│   │   ├── validateEvmGasBalance.ts
│   │   └── validateEvmTokenApproval.ts
│   ├── svm/                     # Solana 체인 처리
│   │   ├── executeSvmTransaction.ts
│   │   ├── signSvmTransaction.ts
│   │   └── validateSvmGasBalance.ts
│   └── executeTransactions.ts  # 통합 트랜잭션 실행
│
├── state/                       # 클라이언트 상태 관리
│   ├── apiState.ts             # API 클라이언트 싱글톤
│   └── clientState.ts          # 클라이언트 전역 상태
│
├── types/                       # TypeScript 타입 정의
│   ├── client-types.ts
│   └── swaggerTypes.ts         # API 스키마에서 생성
│
└── utils/                      # 유틸리티 함수
    ├── address.ts              # 주소 변환
    ├── convert.ts              # 데이터 변환
    └── generateApi.ts          # API 클라이언트 생성
```

#### 핵심 클래스 및 싱글톤

**ApiState 클래스**:
```typescript
class ApiState {
  // API 클라이언트 싱글톤
  static client: ReturnType<typeof createRequestClient>;
  
  // 어필리에이트 설정
  static chainIdsToAffiliates?: Record<string, ChainAffiliates>;
  
  // 초기화 상태
  static initialized = false;
  static apiCalled = false;
  
  // 싱글톤 인스턴스 가져오기
  static getInstance() {
    if (!this.client) {
      this.client = createRequestClient(/* ... */);
    }
    return this.client;
  }
}
```

**ClientState 클래스**:
```typescript
class ClientState {
  // Cosmos 서명 클라이언트 캐시
  static signingStargateClientByChainId: Record<string, SigningStargateClient>;
  
  // 체인 및 자산 정보 캐시
  static skipChains?: Chain[];
  static skipAssets?: Record<string, Asset[]>;
  
  // 가스 검증 결과
  static validateGasResults: ValidateGasResult[] | undefined;
  
  // Amino 타입 및 레지스트리
  static aminoTypes: AminoTypes;
  static registry: Registry;
}
```

#### API 클라이언트 생성 과정

1. **Swagger 스키마에서 타입 생성**:
   - `swagger-typescript-api` 도구 사용
   - `docs/swagger.yml`에서 TypeScript 타입 자동 생성
   - `packages/client/src/types/swaggerTypes.ts`에 생성됨

2. **API 클라이언트 생성**:
   ```typescript
   // utils/generateApi.ts
   export const createRequestClient = (options: SkipApiOptions) => {
     const api = new Api({
       baseURL: options.apiUrl,
       headers: {
         'authorization': options.apiKey,
         ...options.apiHeaders,
       },
     });
     return api;
   };
   ```

3. **싱글톤 패턴으로 관리**:
   - `ApiState.getInstance()`로 접근
   - 전역에서 하나의 인스턴스만 사용

### 2. @skip-go/widget 패키지

#### 디렉토리 구조 및 책임

```
packages/widget/src/
│
├── widget/                      # 위젯 진입점
│   ├── Widget.tsx              # 메인 위젯 컴포넌트
│   ├── Router.tsx              # 페이지 라우팅
│   ├── useInitWidget.ts        # 위젯 초기화 로직
│   ├── ShadowDomAndProviders.tsx # Shadow DOM 래퍼
│   └── theme.ts                # 테마 정의
│
├── pages/                       # 페이지 컴포넌트
│   ├── SwapPage/               # 스왑 입력 페이지
│   │   ├── SwapPage.tsx
│   │   ├── SwapPageHeader.tsx
│   │   ├── SwapPageAssetChainInput.tsx
│   │   └── useSetMaxAmount.ts
│   ├── SwapExecutionPage/      # 스왑 실행 페이지
│   │   ├── SwapExecutionPage.tsx
│   │   ├── SwapExecutionButton.tsx
│   │   └── TransactionProgress.tsx
│   └── TransactionHistoryPage/ # 거래 내역 페이지
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   └── VirtualList.tsx
│
├── hooks/                       # 커스텀 React Hooks
│   ├── useCreateCosmosWallets.tsx
│   ├── useCreateEvmWallets.tsx
│   ├── useCreateSolanaWallets.tsx
│   ├── useGetBalance.ts
│   └── useFetchAllBalances.ts
│
├── state/                       # Jotai 상태 관리
│   ├── wallets.ts              # 지갑 상태
│   ├── swapPage.ts             # 스왑 페이지 상태
│   ├── route.ts                # 라우트 정보
│   ├── balances.ts             # 잔액 정보
│   └── swapExecutionPage.ts    # 실행 페이지 상태
│
├── providers/                    # Context Providers
│   ├── CosmosProvider.tsx
│   ├── EVMProvider.tsx
│   └── SolanaProvider.tsx
│
├── modals/                      # 모달 컴포넌트
│   ├── AssetAndChainSelectorModal/
│   ├── WalletSelectorModal/
│   └── registerModals.ts
│
└── utils/                       # 유틸리티 함수
    ├── fees.ts                 # 수수료 계산
    ├── route.ts                # 라우트 관련
    ├── number.ts               # 숫자 포맷팅
    └── crypto.ts                # 암호화 관련
```

#### 위젯 초기화 과정

1. **Widget 컴포넌트 마운트**:
   ```typescript
   <Widget props={...} />
   ```

2. **Jotai Store 생성**:
   ```typescript
   const jotaiStore = createStore();
   <Provider store={jotaiStore}>
   ```

3. **위젯 초기화**:
   ```typescript
   useInitWidget(props) {
     // props에서 설정 읽기
     // 원자 초기화
     // 지갑 Provider 초기화
     // 테마 설정
   }
   ```

4. **Provider 체인 구성**:
   ```typescript
   <ShadowDomAndProviders>
     <EVMProvider>
       <QueryClientProvider>
         <CosmosProvider>
           <SolanaProvider>
             <NiceModal.Provider>
               <Router />
             </NiceModal.Provider>
           </SolanaProvider>
         </CosmosProvider>
       </QueryClientProvider>
     </EVMProvider>
   </ShadowDomAndProviders>
   ```

---

## 데이터 플로우 상세 분석

### 1. 위젯 초기화 플로우

```
사용자가 Widget 컴포넌트 마운트
    │
    ├──▶ Widget.tsx 렌더링
    │       │
    │       ├──▶ jotaiStore 생성 (createStore())
    │       ├──▶ Provider로 감싸기
    │       └──▶ WidgetWithinProvider 렌더링
    │
    ├──▶ useInitWidget(props) 실행
    │       │
    │       ├──▶ props 파싱
    │       │   ├── theme 설정
    │       │   ├── apiUrl 설정
    │       │   ├── callbacks 설정
    │       │   └── routeConfig 설정
    │       │
    │       ├──▶ 원자 초기화
    │       │   ├── themeAtom ← props.theme
    │       │   ├── skipClientConfigAtom ← props.apiUrl
    │       │   ├── callbacksAtom ← props.callbacks
    │       │   └── routeConfigAtom ← props.routeConfig
    │       │
    │       └──▶ 지갑 Provider 초기화
    │           ├── CosmosProvider 초기화
    │           ├── EVMProvider 초기화
    │           └── SolanaProvider 초기화
    │
    ├──▶ ShadowDomAndProviders 렌더링
    │       │
    │       └──▶ Shadow DOM 생성 (스타일 격리)
    │
    └──▶ Router 렌더링
            │
            └──▶ SwapPage (기본 페이지) 렌더링
```

### 2. 스왑 플로우 (상세)

#### 2.1 자산 선택 및 금액 입력

```
사용자가 소스 자산 선택 버튼 클릭
    │
    ├──▶ AssetAndChainSelectorModal 열기
    │       │
    │       ├──▶ skipAssetsAtom에서 자산 목록 가져오기
    │       ├──▶ 필터 적용 (filterAtom, filterOutAtom)
    │       └──▶ 자산 목록 표시
    │
    ├──▶ 사용자가 자산 선택
    │       │
    │       └──▶ sourceAssetAtom 업데이트
    │               │
    │               ├──▶ chainId 설정
    │               ├──▶ denom 설정
    │               ├──▶ decimals 설정
    │               └──▶ amount 초기화 ("")
    │
    ├──▶ EVM 체인인 경우 체인 전환
    │       │
    │       └──▶ useSwitchEvmChain() 실행
    │
    └──▶ 콜백 실행
            │
            └──▶ callbacks.onSourceAssetUpdated?.()
```

#### 2.2 금액 입력 및 디바운싱

```
사용자가 금액 입력
    │
    ├──▶ sourceAssetAmountAtom 업데이트
    │       │
    │       ├──▶ sourceAssetAtom.amount 업데이트
    │       └──▶ debouncedSourceAssetAmountAtom 업데이트 (디바운스 시작)
    │
    ├──▶ 디바운스 대기 (500ms)
    │       │
    │       └──▶ 사용자가 입력 중이면 타이머 리셋
    │
    └──▶ 디바운스 완료
            │
            └──▶ debouncedSourceAssetAmountAtom 최종 값 설정
                    │
                    └──▶ skipRouteRequestAtom 재계산 트리거
```

#### 2.3 라우트 조회

```
skipRouteRequestAtom 변경 감지
    │
    ├──▶ skipRouteRequestAtom 계산
    │       │
    │       ├──▶ sourceAsset 확인
    │       ├──▶ destinationAsset 확인
    │       ├──▶ debouncedSourceAssetAmountAtom 확인
    │       └──▶ RouteRequest 객체 생성
    │               {
    │                 sourceAssetChainId: "...",
    │                 sourceAssetDenom: "...",
    │                 destAssetChainId: "...",
    │                 destAssetDenom: "...",
    │                 amountIn: "1000000" (base units)
    │               }
    │
    ├──▶ _skipRouteAtom (atomWithQuery) 트리거
    │       │
    │       ├──▶ queryEnabled 확인
    │       │   ├── params !== undefined
    │       │   ├── amountIn > 0 또는 amountOut > 0
    │       │   ├── !isInvertingSwap
    │       │   ├── currentPage === Routes.SwapPage
    │       │   └── errorWarning === undefined
    │       │
    │       ├──▶ queryFn 실행
    │       │       │
    │       │       └──▶ route() API 호출 (@skip-go/client)
    │       │               │
    │       │               ├──▶ ApiState.getInstance()로 API 클라이언트 가져오기
    │       │               ├──▶ POST /v1/fungible/route
    │       │               └──▶ RouteResponse 받기
    │       │                       {
    │       │                         operations: [...],
    │       │                         estimatedAmountOut: "...",
    │       │                         requiredChainAddresses: [...],
    │       │                         ...
    │       │                       }
    │       │
    │       └──▶ skipRouteAtom 업데이트
    │               │
    │               ├──▶ data: RouteResponse
    │               ├──▶ isLoading: false
    │               └──▶ isError: false
    │
    └──▶ UI 업데이트
            │
            ├──▶ 예상 수령량 표시
            ├──▶ 수수료 정보 표시
            ├──▶ 경로 정보 표시
            └──▶ Swap 버튼 활성화
```

#### 2.4 라우트 업데이트 시 금액 동기화

```
skipRouteAtom 업데이트
    │
    ├──▶ useUpdateAmountWhenRouteChanges() 실행
    │       │
    │       ├──▶ route.data 확인
    │       ├──▶ swapDirection 확인
    │       │
    │       ├──▶ swap-in인 경우
    │       │       │
    │       │       └──▶ destinationAsset.amount 업데이트
    │       │               │
    │       │               └──▶ route.data.amountOut을 human readable로 변환
    │       │
    │       └──▶ swap-out인 경우
    │               │
    │               └──▶ sourceAsset.amount 업데이트
    │                       │
    │                       └──▶ route.data.amountIn을 human readable로 변환
    │
    └──▶ onRouteUpdatedEffect 실행
            │
            └──▶ callbacks.onRouteUpdated?.() 호출
```

### 3. 트랜잭션 실행 플로우 (상세)

#### 3.1 Swap 버튼 클릭

```
사용자가 "Swap" 버튼 클릭
    │
    ├──▶ 유효성 검사
    │       ├── sourceAsset 확인
    │       ├── destinationAsset 확인
    │       ├── amount 확인
    │       ├── 잔액 확인
    │       └── 라우트 확인
    │
    ├──▶ currentPageAtom 업데이트
    │       │
    │       └──▶ Routes.SwapExecutionPage
    │
    └──▶ SwapExecutionPage 렌더링
```

#### 3.2 실행 페이지 초기화

```
SwapExecutionPage 렌더링
    │
    ├──▶ setSwapExecutionStateAtom 실행
    │       │
    │       ├──▶ route 정보 저장
    │       │   ├── swapExecutionStateAtom.route ← route
    │       │   ├── swapExecutionStateAtom.originalRoute ← route
    │       │   └── swapExecutionStateAtom.clientOperations ← getClientOperations(route.operations)
    │       │
    │       ├──▶ userAddresses 초기화
    │       │   └── swapExecutionStateAtom.userAddresses ← []
    │       │
    │       ├──▶ chainAddresses 초기화
    │       │   └── chainAddressesAtom ← {}
    │       │       {
    │       │         0: { chainId: "cosmoshub-4", address: "" },
    │       │         1: { chainId: "osmosis-1", address: "" },
    │       │       }
    │       │
    │       └──▶ 콜백 저장
    │           └── submitSwapExecutionCallbacksAtom ← callbacks
    │
    └──▶ 주소 입력/확인
            │
            ├──▶ 자동 주소 설정 (useAutoSetAddress)
            │       │
            │       ├──▶ 연결된 지갑에서 주소 가져오기
            │       └──▶ chainAddressesAtom 업데이트
            │
            └──▶ 수동 주소 입력 (SetAddressModal)
                    │
                    └──▶ chainAddressesAtom 업데이트
```

#### 3.3 트랜잭션 실행

```
사용자가 "Execute Swap" 버튼 클릭
    │
    ├──▶ skipSubmitSwapExecutionAtom.mutate() 실행
    │       │
    │       ├──▶ userAddresses 생성
    │       │       │
    │       │       └──▶ chainAddressesAtom에서 주소 추출
    │       │               [
    │       │                 { chainId: "cosmoshub-4", address: "cosmos1..." },
    │       │                 { chainId: "osmosis-1", address: "osmo1..." },
    │       │               ]
    │       │
    │       ├──▶ executeRoute() 호출 (@skip-go/client)
    │       │       │
    │       │       ├──▶ updateRouteDetails() - 라우트 상태 초기화
    │       │       │       │
    │       │       │       └──▶ routeId 생성 및 저장
    │       │       │
    │       │       ├──▶ createValidAddressList() - 주소 유효성 검사
    │       │       │
    │       │       ├──▶ messages() API 호출
    │       │       │       │
    │       │       │       ├──▶ POST /v1/fungible/messages
    │       │       │       │       {
    │       │       │       │         amountIn: "...",
    │       │       │       │         sourceAssetChainId: "...",
    │       │       │       │         destAssetChainId: "...",
    │       │       │       │         operations: [...],
    │       │       │       │         addressList: [...],
    │       │       │       │         slippageTolerancePercent: "1"
    │       │       │       │       }
    │       │       │       │
    │       │       │       └──▶ MessagesResponse 받기
    │       │       │               {
    │       │       │                 txs: [
    │       │       │                   { cosmosTx: { chainId: "...", msgs: [...] } },
    │       │       │                   { evmTx: { chainId: "...", ... } },
    │       │       │                 ]
    │       │       │               }
    │       │       │
    │       │       ├──▶ executeTransactions() 실행
    │       │       │       │
    │       │       │       ├──▶ 가스 검증 (validateGasBalances)
    │       │       │       │       ├──▶ 각 체인별 가스 잔액 확인
    │       │       │       │       └──▶ 부족하면 에러 또는 가스 라우트 제안
    │       │       │       │
    │       │       │       ├──▶ 트랜잭션 서명 (batchSignTxs)
    │       │       │       │       ├──▶ Cosmos: signCosmosTransaction()
    │       │       │       │       ├──▶ EVM: signEvmTransaction()
    │       │       │       │       └──▶ Solana: signSvmTransaction()
    │       │       │       │
    │       │       │       └──▶ 트랜잭션 제출
    │       │       │               ├──▶ submitTransaction() API 호출
    │       │       │               └──▶ 각 체인에 트랜잭션 브로드캐스트
    │       │       │
    │       │       └──▶ subscribeToRouteStatus() 실행
    │       │               │
    │       │               ├──▶ 트랜잭션 상태 폴링 시작
    │       │               │       │
    │       │               │       └──▶ trackTransaction() API 주기적 호출
    │       │               │               ├──▶ POST /v1/fungible/track_transaction
    │       │               │               └──▶ 상태 업데이트
    │       │               │                       pending → broadcasted → confirmed → completed
    │       │               │
    │       │               └──▶ 상태 변경 시 콜백 실행
    │       │                       ├──▶ onTransactionBroadcasted?.()
    │       │                       ├──▶ onTransactionComplete?.()
    │       │                       └──▶ onTransactionFailed?.()
    │       │
    │       └──▶ UI 업데이트
    │               │
    │               ├──▶ 진행 상황 표시
    │               ├──▶ 각 체인별 트랜잭션 상태 표시
    │               └──▶ 완료/실패 메시지 표시
    │
    └──▶ 완료 시 TransactionHistoryPage로 이동
```

---

## 상태 관리 아키텍처

### Jotai 원자 구조

#### 원자 타입별 분류

**1. 기본 원자 (Primitive Atoms)**
```typescript
// 단순 값 저장
export const sourceAssetAtom = atomWithStorageNoCrossTabSync<AssetAtom | undefined>(
  LOCAL_STORAGE_KEYS.sourceAsset,
  undefined,
);
```

**2. 파생 원자 (Derived Atoms)**
```typescript
// 다른 원자에서 계산
export const sourceAssetAmountAtom = atom(
  (get) => get(sourceAssetAtom)?.amount ?? "",
  (_get, set, newAmount: string) => {
    set(sourceAssetAtom, (prev) => ({ ...prev, amount: newAmount }));
    set(debouncedSourceAssetAmountAtom, newAmount);
  },
);
```

**3. 비동기 원자 (Async Atoms)**
```typescript
// API 호출 결과 저장
export const skipRouteAtom = atomWithQuery((get) => {
  const params = get(skipRouteRequestAtom);
  // ...
  return {
    queryKey: ["skipRoute", params],
    queryFn: () => route(params),
  };
});
```

**4. Effect 원자 (Effect Atoms)**
```typescript
// 사이드 이펙트 처리
export const onRouteUpdatedEffect = atomEffect((get) => {
  const route = get(skipRouteAtom);
  const callbacks = get(callbacksAtom);
  if (callbacks?.onRouteUpdated) {
    callbacks.onRouteUpdated({ /* ... */ });
  }
});
```

#### 상태 저장소 전략

**로컬 스토리지 동기화**:
- `atomWithStorageNoCrossTabSync`: 크로스 탭 동기화 없이 로컬 스토리지에 저장
- 사용 예: `sourceAssetAtom`, `destinationAssetAtom`, `swapSettingsAtom`
- 이유: 성능 최적화 (크로스 탭 동기화는 비용이 큼)

**메모리만 저장**:
- `atom`: 메모리에만 저장, 새로고침 시 초기화
- 사용 예: `currentPageAtom`, `errorWarningAtom`

**세션 스토리지**:
- 필요시 `atomWithStorage` 사용 (현재 미사용)

### 상태 업데이트 플로우

```
사용자 액션 또는 API 응답
    │
    ├──▶ 원자 업데이트 (set)
    │       │
    │       └──▶ 의존하는 원자 자동 재계산
    │               │
    │               ├──▶ 파생 원자 재계산
    │               └──▶ Effect 원자 트리거
    │
    ├──▶ React 컴포넌트 리렌더링
    │       │
    │       └──▶ useAtomValue() 또는 useAtom() 사용 컴포넌트만 리렌더링
    │
    └──▶ UI 업데이트
```

### 상태 관리 최적화

**1. 디바운싱**:
- 금액 입력 시 불필요한 API 호출 방지
- `atomWithDebounce` 사용

**2. 메모이제이션**:
- 비용이 큰 계산 결과 캐싱
- `useMemo` 사용

**3. 선택적 구독**:
- 필요한 원자만 구독
- `useAtomValue`로 읽기 전용 접근

---

## 컴포넌트 아키텍처

### 컴포넌트 계층 구조

```
Widget (최상위)
│
├── Provider (Jotai Store)
│   │
│   └── WidgetWithinProvider
│       │
│       └── ShadowDomAndProviders
│           │
│           ├── EVMProvider
│           ├── QueryClientProvider
│           ├── CosmosProvider
│           ├── SolanaProvider
│           └── NiceModal.Provider
│               │
│               └── WidgetWrapper
│                   │
│                   └── Router
│                       │
│                       ├── SwapPage
│                       │   ├── SwapPageHeader
│                       │   ├── SwapPageAssetChainInput (소스)
│                       │   ├── SwapPageBridge
│                       │   ├── SwapPageAssetChainInput (대상)
│                       │   └── MainButton
│                       │
│                       ├── SwapExecutionPage
│                       │   ├── SwapExecutionHeader
│                       │   ├── TransactionProgress
│                       │   └── SwapExecutionButton
│                       │
│                       └── TransactionHistoryPage
```

### 컴포넌트 책임 분리

**페이지 컴포넌트**:
- 전체 페이지 레이아웃 관리
- 페이지별 상태 관리
- 하위 컴포넌트 조합

**프레젠테이션 컴포넌트**:
- UI만 담당
- Props로 데이터 받기
- 이벤트 핸들러 Props로 받기

**컨테이너 컴포넌트**:
- 상태 관리
- 비즈니스 로직
- API 호출

### Shadow DOM 아키텍처

**목적**: 스타일 격리

**구현**:
```typescript
<ShadowDomAndProviders theme={theme}>
  {/* 위젯 내용 */}
</ShadowDomAndProviders>
```

**장점**:
- 호스팅 페이지의 CSS와 충돌 방지
- 위젯 스타일 독립성 보장

**단점**:
- Shadow DOM 내부에서 외부 스타일 사용 불가
- 폰트, 이미지 등 리소스 명시적 로드 필요

---

## API 통합 아키텍처

### API 클라이언트 생성

**1. Swagger 스키마에서 타입 생성**:
```bash
yarn workspace @skip-go/client run codegen
```

**2. API 클라이언트 생성**:
```typescript
// utils/generateApi.ts
export const createRequestClient = (options: SkipApiOptions) => {
  const api = new Api({
    baseURL: options.apiUrl,
    headers: {
      'authorization': options.apiKey,
      ...options.apiHeaders,
    },
  });
  return api;
};
```

**3. 싱글톤 패턴**:
```typescript
class ApiState {
  static client: ReturnType<typeof createRequestClient>;
  
  static getInstance() {
    if (!this.client) {
      this.client = createRequestClient(/* ... */);
    }
    return this.client;
  }
}
```

### API 호출 패턴

**1. 직접 호출**:
```typescript
const response = await route({
  sourceAssetChainId: "...",
  sourceAssetDenom: "...",
  // ...
});
```

**2. 원자와 통합**:
```typescript
export const skipRouteAtom = atomWithQuery((get) => {
  const params = get(skipRouteRequestAtom);
  return {
    queryKey: ["route", params],
    queryFn: () => route(params),
  };
});
```

### 에러 처리

**1. API 레벨 에러**:
```typescript
try {
  const response = await route(params);
} catch (error) {
  // 에러 처리
  if (error.code === 404) {
    // 라우트 없음
  }
}
```

**2. 원자 레벨 에러**:
```typescript
export const skipRouteAtom = atom((get) => {
  const { data, isError, error } = get(_skipRouteAtom);
  if (isError) {
    return { data: undefined, isError: true, error };
  }
  return { data, isError: false };
});
```

---

## 지갑 통합 아키텍처

### Provider 패턴

**구조**:
```
<EVMProvider>
  <CosmosProvider>
    <SolanaProvider>
      {/* 앱 */}
    </SolanaProvider>
  </CosmosProvider>
</EVMProvider>
```

**각 Provider의 책임**:
- 해당 체인 타입의 지갑 감지
- 지갑 연결 상태 관리
- 지갑 이벤트 리스닝

### 지갑 인터페이스

**MinimalWallet 타입**:
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

### 지갑 연결 플로우

```
사용자가 지갑 선택
    │
    ├──▶ WalletSelectorModal 표시
    │       │
    │       └──▶ getAvailableWallets() 호출
    │               │
    │               ├──▶ 브라우저 확장 프로그램 확인
    │               └──▶ 사용 가능한 지갑 목록 반환
    │
    ├──▶ 사용자가 지갑 클릭
    │       │
    │       └──▶ wallet.connect() 호출
    │               │
    │               ├──▶ 브라우저 확장 프로그램 연결
    │               ├──▶ 사용자 승인 요청
    │               └──▶ 연결 완료
    │
    ├──▶ walletsAtom 업데이트
    │       │
    │       └──▶ { cosmos: { id: "...", walletName: "keplr" } }
    │
    ├──▶ getConnectedSignersAtom 업데이트
    │       │
    │       └──▶ { getCosmosSigner: (chainId) => ... }
    │
    └──▶ UI 업데이트
            │
            └──▶ 지갑 연결 상태 표시
```

---

## 트랜잭션 실행 아키텍처

### 트랜잭션 실행 단계

**1. 메시지 생성**:
```typescript
const response = await messages({
  amountIn: route.amountIn,
  operations: route.operations,
  addressList: addressList,
  // ...
});
```

**2. 가스 검증**:
```typescript
await validateGasBalances({
  txs: response.txs,
  getCosmosSigner,
  getEvmSigner,
  // ...
});
```

**3. 트랜잭션 서명**:
```typescript
// Cosmos
const signedTx = await signCosmosTransaction({
  tx: cosmosTx,
  getCosmosSigner,
});

// EVM
const signedTx = await signEvmTransaction({
  tx: evmTx,
  getEvmSigner,
});

// Solana
const signedTx = await signSvmTransaction({
  tx: svmTx,
  getSvmSigner,
});
```

**4. 트랜잭션 제출**:
```typescript
await submitTransaction({
  chainId: "...",
  tx: signedTx,
});
```

**5. 상태 추적**:
```typescript
await subscribeToRouteStatus({
  routeId,
  transactionDetails,
  // ...
});
```

### 배치 서명 전략

**batchSignTxs 옵션**:
- `true`: 모든 트랜잭션을 미리 서명
- `false`: 필요할 때마다 서명

**장단점**:
- `true`: 빠른 실행, but 모든 트랜잭션이 준비되어야 함
- `false`: 유연함, but 각 단계마다 서명 필요

---

## 에러 처리 아키텍처

### 에러 타입

**1. API 에러**:
- 네트워크 에러
- 서버 에러
- 비즈니스 로직 에러

**2. 지갑 에러**:
- 지갑 연결 실패
- 서명 거부
- 체인 전환 실패

**3. 트랜잭션 에러**:
- 가스 부족
- 잔액 부족
- 트랜잭션 실패

### 에러 처리 전략

**1. Error Boundary**:
```typescript
<ErrorBoundary
  fallback={null}
  onError={(error) => {
    setErrorWarning({ errorWarningType: ErrorWarningType.Unexpected, error });
  }}
>
  <SwapPage />
</ErrorBoundary>
```

**2. Try-Catch**:
```typescript
try {
  await executeRoute(options);
} catch (error) {
  callbacks.onTransactionFailed?.(error);
}
```

**3. 원자 레벨 에러 처리**:
```typescript
export const skipRouteAtom = atom((get) => {
  const { data, isError, error } = get(_skipRouteAtom);
  if (isError) {
    return { data: undefined, isError: true, error };
  }
  return { data, isError: false };
});
```

---

**문서 버전**: 2.0  
**최종 업데이트**: 2024

