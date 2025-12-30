# Skip Go 프로젝트 착수 가이드

이 문서는 Skip Go 프로젝트에 **처음 합류한 개발자**가 프로젝트를 이해하고 개발을 시작하기 위한 **전체적인 흐름**을 제공합니다.

## 목차

1. [문서 읽기 순서](#문서-읽기-순서)
2. [프로젝트 이해 단계별 가이드](#프로젝트-이해-단계별-가이드)
3. [실습: 첫 번째 작업 수행하기](#실습-첫-번째-작업-수행하기)
4. [일반적인 작업 흐름](#일반적인-작업-흐름)
5. [체크리스트](#체크리스트)

---

## 문서 읽기 순서

### 1단계: 프로젝트 목적 이해

**읽을 문서**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**목표**:
- Skip Go가 무엇인지 이해
- 프로젝트가 해결하는 문제 이해
- 핵심 기능 파악

**예상 시간**: 15-20분

**확인 사항**:
- [ ] Skip Go의 목적을 설명할 수 있는가?
- [ ] 크로스체인 스왑이 무엇인지 이해했는가?
- [ ] Gas on Receive 기능을 이해했는가?

### 2단계: 아키텍처 이해

**읽을 문서**: [ARCHITECTURE.md](./ARCHITECTURE.md)

**목표**:
- 전체 아키텍처 구조 이해
- 패키지별 책임 이해
- 데이터 플로우 이해

**예상 시간**: 30-45분

**확인 사항**:
- [ ] Client와 Widget 패키지의 차이를 이해했는가?
- [ ] 데이터가 어떻게 흐르는지 설명할 수 있는가?
- [ ] 상태 관리가 어떻게 작동하는지 이해했는가?

### 3단계: 개발 환경 설정

**읽을 문서**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - "개발 환경 설정" 섹션

**목표**:
- 개발 환경 구축
- 프로젝트 실행 확인

**예상 시간**: 10-15분

**확인 사항**:
- [ ] `yarn install` 성공했는가?
- [ ] `yarn dev`로 개발 서버가 실행되는가?
- [ ] 브라우저에서 위젯이 보이는가?

### 4단계: 개발 가이드 숙지

**읽을 문서**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

**목표**:
- 일반적인 개발 작업 방법 이해
- 실제 작업 수행 방법 학습

**예상 시간**: 20-30분

**확인 사항**:
- [ ] 컴포넌트를 추가하는 방법을 이해했는가?
- [ ] 원자를 추가하는 방법을 이해했는가?
- [ ] API를 통합하는 방법을 이해했는가?

---

## 프로젝트 이해 단계별 가이드

### 단계 1: 프로젝트 목적 파악 (30분)

#### 1.1 프로젝트 개요 읽기

[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)를 읽으면서 다음을 이해하세요:

- **Skip Go가 해결하는 문제**: 크로스체인 자산 이동의 복잡성
- **핵심 기능**: 크로스체인 스왑, 멀티체인 지갑, Gas on Receive
- **사용 사례**: DeFi 사용자, NFT 거래자, 개발자

#### 1.2 실제 동작 확인

개발 서버를 실행하고 실제로 사용해보세요:

```bash
yarn dev
```

브라우저에서 `http://localhost:3000` 접속

**체험할 것**:
1. 자산 선택 (소스/대상)
2. 금액 입력
3. 라우트 확인
4. 지갑 연결 (가능한 경우)

### 단계 2: 코드베이스 탐색 (1-2시간)

#### 2.1 주요 파일 읽기

다음 파일들을 순서대로 읽어보세요:

**1. Widget 진입점**:
- `packages/widget/src/widget/Widget.tsx` (50줄 정도)
- 위젯이 어떻게 초기화되는지 확인

**2. 라우팅**:
- `packages/widget/src/widget/Router.tsx`
- 페이지 전환이 어떻게 이루어지는지 확인

**3. 스왑 페이지**:
- `packages/widget/src/pages/SwapPage/SwapPage.tsx` (처음 100줄)
- 사용자 입력이 어떻게 처리되는지 확인

**4. 상태 관리**:
- `packages/widget/src/state/swapPage.ts` (처음 100줄)
- 원자가 어떻게 정의되고 사용되는지 확인

**5. Client 진입점**:
- `packages/client/src/index.ts`
- 어떤 함수들이 공개되는지 확인

**6. 라우트 실행**:
- `packages/client/src/public-functions/executeRoute.ts` (처음 50줄)
- 트랜잭션이 어떻게 실행되는지 확인

#### 2.2 데이터 플로우 추적

다음 시나리오를 따라 데이터가 어떻게 흐르는지 확인하세요:

**시나리오**: 사용자가 금액을 입력했을 때

1. `SwapPage.tsx`에서 사용자 입력
2. `sourceAssetAmountAtom` 업데이트
3. `debouncedSourceAssetAmountAtom` 업데이트 (디바운스)
4. `skipRouteRequestAtom` 재계산
5. `_skipRouteAtom` (atomWithQuery) 트리거
6. `route()` API 호출
7. `skipRouteAtom` 업데이트
8. UI 업데이트

**추적 방법**:
- 각 파일에서 `console.log` 추가
- 브라우저 개발자 도구에서 확인

### 단계 3: 아키텍처 심화 이해 (1시간)

#### 3.1 아키텍처 문서 읽기

[ARCHITECTURE.md](./ARCHITECTURE.md)를 읽으면서 다음을 이해하세요:

- **전반적 아키텍처**: 레이어 구조, 패키지 간 의존성
- **데이터 플로우**: 초기화, 스왑, 트랜잭션 실행
- **상태 관리**: Jotai 원자 구조
- **컴포넌트 아키텍처**: 계층 구조, 책임 분리

#### 3.2 실제 코드와 대조

아키텍처 문서의 설명과 실제 코드를 대조해보세요:

- 문서에서 설명한 구조가 실제 코드와 일치하는가?
- 이해가 안 되는 부분은 코드를 직접 확인

### 단계 4: 개발 가이드 숙지 (1시간)

#### 4.1 개발 가이드 읽기

[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)를 읽으면서 다음을 이해하세요:

- **일반적인 개발 작업**: 컴포넌트, Hook, 유틸리티 추가
- **상태 관리 작업**: 원자 추가 및 사용
- **API 통합 작업**: API 함수 추가 및 사용
- **지갑 통합 작업**: 새 지갑 추가

#### 4.2 예제 코드 실행

개발 가이드의 예제 코드를 실제로 실행해보세요:

- 예제 컴포넌트 추가
- 예제 원자 추가
- 브라우저에서 확인

---

## 실습: 첫 번째 작업 수행하기

### 작업: 간단한 컴포넌트 추가

이 실습을 통해 전체 개발 워크플로우를 경험할 수 있습니다.

#### 1. 작업 계획

**목표**: 스왑 페이지에 "최근 거래" 버튼 추가

**요구사항**:
- 버튼 클릭 시 거래 내역 페이지로 이동
- 스왑 페이지 헤더에 배치

#### 2. 브랜치 생성

```bash
git checkout -b feature/add-recent-transactions-button
```

#### 3. 컴포넌트 생성

**파일**: `packages/widget/src/components/RecentTransactionsButton.tsx`

```typescript
import { styled } from "styled-components";
import { useSetAtom } from "jotai";
import { currentPageAtom, Routes } from "@/state/router";
import { MainButton } from "@/components/MainButton";
import { ICONS } from "@/icons";

export const RecentTransactionsButton = () => {
  const setCurrentPage = useSetAtom(currentPageAtom);
  
  const handleClick = () => {
    setCurrentPage(Routes.TransactionHistoryPage);
  };
  
  return (
    <MainButton
      label="Recent Transactions"
      icon={ICONS.history}
      onClick={handleClick}
    />
  );
};
```

#### 4. 컴포넌트 사용

**파일**: `packages/widget/src/pages/SwapPage/SwapPageHeader.tsx`

```typescript
import { RecentTransactionsButton } from "@/components/RecentTransactionsButton";

// SwapPageHeader 컴포넌트 내부에 추가
<RecentTransactionsButton />
```

#### 5. 테스트

1. 개발 서버 실행: `yarn dev`
2. 브라우저에서 확인
3. 버튼 클릭 시 거래 내역 페이지로 이동하는지 확인

#### 6. 커밋

```bash
git add .
git commit -m "feat: add recent transactions button to swap page"
```

#### 7. Changeset 생성

```bash
npx changeset
```

- 패키지 선택: `@skip-go/widget`
- 버전 타입: `patch`
- 설명: "Added recent transactions button to swap page header"

#### 8. PR 생성

GitHub에서 Pull Request 생성

---

## 일반적인 작업 흐름

### 작업 시작 전

1. **이슈 확인**: GitHub Issues에서 작업할 이슈 확인
2. **요구사항 이해**: 이슈 설명과 관련 문서 읽기
3. **브랜치 생성**: `git checkout -b feature/my-feature`

### 작업 중

1. **코드 작성**: 개발 가이드 참고하여 코드 작성
2. **로컬 테스트**: `yarn dev`로 개발 서버 실행하여 테스트
3. **에러 확인**: 린터 에러 확인 및 수정

### 작업 완료 후

1. **테스트**: 기능이 정상 작동하는지 확인
2. **커밋**: 의미 있는 커밋 메시지 작성
3. **Changeset**: `npx changeset` 실행
4. **PR 생성**: GitHub에서 Pull Request 생성
5. **리뷰 대기**: 팀원의 리뷰 대기

### PR 머지 후

1. **브랜치 삭제**: 로컬 및 원격 브랜치 삭제
2. **최신 코드 가져오기**: `git checkout main && git pull`

---

## 체크리스트

### 프로젝트 이해 체크리스트

- [ ] 프로젝트 목적을 이해했는가?
- [ ] 아키텍처 구조를 이해했는가?
- [ ] 데이터 플로우를 이해했는가?
- [ ] 상태 관리 방식을 이해했는가?

### 개발 환경 체크리스트

- [ ] Node.js 18+ 설치되어 있는가?
- [ ] `yarn install` 성공했는가?
- [ ] `yarn dev`로 개발 서버가 실행되는가?
- [ ] 브라우저에서 위젯이 보이는가?

### 개발 능력 체크리스트

- [ ] 컴포넌트를 추가할 수 있는가?
- [ ] 원자를 추가할 수 있는가?
- [ ] API를 통합할 수 있는가?
- [ ] 테스트를 작성할 수 있는가?

### 워크플로우 체크리스트

- [ ] 브랜치를 생성할 수 있는가?
- [ ] Changeset을 생성할 수 있는가?
- [ ] PR을 생성할 수 있는가?

---

## 다음 단계

### 기본 작업 수행

다음 작업들을 순서대로 수행해보세요:

1. **간단한 UI 개선**: 버튼 스타일 변경, 텍스트 수정
2. **상태 추가**: 간단한 원자 추가 및 사용
3. **유틸리티 함수 추가**: 간단한 헬퍼 함수 추가
4. **버그 수정**: 작은 버그 찾아서 수정

### 중급 작업 수행

기본 작업에 익숙해지면:

1. **새 기능 추가**: 작은 기능 추가
2. **API 통합**: 새 API 엔드포인트 사용
3. **지갑 통합**: 새 지갑 추가 (선택사항)

### 고급 작업 수행

충분히 익숙해지면:

1. **아키텍처 개선**: 리팩토링
2. **성능 최적화**: 성능 개선
3. **복잡한 기능 추가**: 큰 기능 추가

---

## 도움 요청

### 문서 확인

문제가 발생하면 먼저 다음 문서를 확인하세요:

1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 프로젝트 목적
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - 아키텍처
3. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 개발 가이드

### 팀에 질문

문서로 해결되지 않으면:

1. **GitHub Issues**: 유사한 이슈 검색
2. **팀 채널**: 팀 채널에서 질문
3. **코드 리뷰**: PR에서 질문

---

## 결론

이 가이드를 따라하면 Skip Go 프로젝트에 효과적으로 기여할 수 있습니다. 

**핵심 포인트**:
1. **문서를 먼저 읽기**: 코드를 보기 전에 문서 이해
2. **작은 것부터 시작**: 간단한 작업부터 시작
3. **실습**: 예제 코드를 실제로 실행
4. **질문**: 모르는 것은 주저하지 말고 질문

**행운을 빕니다! 🚀**

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024

