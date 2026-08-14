# 🍚 SmartMealTable (알뜰식탁) - Frontend

대학생 및 1인 가구를 위한 개인 맞춤형 식비 예산 관리 및 혜택 기반 메뉴/가게 추천 PWA 웹 서비스 **알뜰식탁(SmartMealTable)**의 프론트엔드 저장소입니다.

사용자의 일간/월간 식비 예산, 개인 음식 취향, 위치, 소속(학생/기업 등) 혜택 정보를 종합하여 최적의 식단과 가게를 추천하고, 드래그 앤 드롭 장바구니 및 지출 분석 기능을 제공합니다.

---

## 🔗 주요 링크

- **🌐 웹 서비스 배포**: [https://smartmealtable.netlify.app](https://smartmealtable.netlify.app)
- **🎥 회원가입 프로세스 시연**: [Google Drive 시연 영상 1](https://drive.google.com/file/d/1sTLYnne4dDMCAZ8pLzUhc__oUtmpEb-D/view?usp=drive_link)
- **🎥 전체 시스템 기능 시연**: [Google Drive 시연 영상 2](https://drive.google.com/file/d/17b0PxYFIEindIAHc7txl80GP7VTkQl-W/view?usp=drive_link)

---

## 🛠 기술 스택

### Framework & Core
- **React 19**
- **TypeScript**
- **Vite 6**

### State Management & Styling
- **Zustand** (전역 상태 관리: 인증, 장바구니)
- **Styled-Components** (CSS-in-JS, Design System Token & GlobalStyle)

### Routing & Network
- **React Router v7**
- **Axios** (JWT Interceptor, Token Auto Refresh)

### Interactive UI & Visualization
- **@dnd-kit** (`core`, `sortable`, `utilities`) - 드래그 앤 드롭 장바구니 UI
- **Recharts** - 예산 대비 지출 통계 차트 시각화
- **React Naver Maps** & Geocoder - 위치 기반 식당 검색 및 주소 변환
- **React Icons**

### PWA & Deployment
- **Vite Plugin PWA** (Service Worker, Offline Caching, Web App Manifest)
- **Netlify**

---

## 💡 주요 기능

### 1. 회원가입 및 맞춤 온보딩 (Auth & Onboarding)
- 이메일 회원가입/로그인 및 **Kakao / Google OAuth 2.0** 소셜 로그인 지원
- 단계별 온보딩 프로세스:
  1. 프로필 입력 및 소속(학교/회사 등) 선택
  2. 위치/주소 설정 (네이버 지도 Geocoder 연동)
  3. 월별 / 일별 식비 목표 예산 설정
  4. 음식 선호도 (카테고리, 매운맛 레벨, 선호 태그) 및 알레르기 정보 등록
  5. 약관 동의

### 2. 예산 기반 가성비 메뉴 & 가게 추천 (Recommendation Engine)
- 설정한 남은 예산과 거리 범위 내에서 이용 가능한 메뉴 추천
- 소속(학생 할인, 제휴 혜택 등)에 따른 맞춤형 혜택 정보 적용
- 카테고리별 / 거리별 / 가격대별 식당 및 메뉴 필터링

### 3. 드래그 앤 드롭 장바구니 & 식단 조합 (DnD Cart)
- `@dnd-kit` 기반의 직관적인 메뉴 조합 및 배치 기능
- 장바구니 담기 시 실시간 예산 차감 계산 및 과소비 경고 UI 제공

### 4. 지출 내역 및 예산 분석 (Budget & Expenditure Analytics)
- 일간/월간 잔여 예산 자동 계산 및 소비 상태 리포트
- Recharts를 활용한 카테고리별 지출 분포 시각화
- 결제 내역 직접 등록, 수정, 상세 보기 기능

### 5. 위치 기반 식당 조회 & 마이페이지
- 네이버 지도 연동으로 내 위치 주변 식당 탐색 및 경로 파악
- 자주 찾는 단골 식당/메뉴 즐겨찾기 관리
- 소속 변경, 취향 갱신, 예산 재설정 기능

---

## 📁 프로젝트 구조

```
src/
├── assets/             # 정적 리소스 (이미지, 아이콘 등)
├── components/         # 재사용 가능한 공통 UI 컴포넌트
│   ├── address/        # 주소 검색, 지도 연동 컴포넌트
│   └── ...
├── pages/              # 라우트별 페이지 컴포넌트
│   ├── auth/           # 로그인, 회원가입, OAuth 콜백
│   ├── onboarding/     # 6단계 온보딩 플로우
│   ├── home/           # 홈 메인 대시보드
│   ├── recommendation/ # 맞춤 메뉴/식당 추천
│   ├── store/          # 가게 상세 정보
│   ├── menu/           # 메뉴 상세 정보
│   ├── cart/           # DnD 장바구니 및 식단 구성
│   ├── spending/       # 지출 내역 및 지출 등록/상세
│   ├── favorites/      # 즐겨찾기 목록
│   ├── budget/         # 예산 관리
│   ├── preference/     # 음식 취향 관리
│   └── profile/        # 마이페이지 및 소속 관리
├── services/           # REST API 연동 모듈 (Axios 인스턴스, 서비스별 API)
├── store/              # Zustand 전역 상태 (authStore, cartStore)
├── styles/             # GlobalStyle, Theme 디자인 토큰
├── types/              # TypeScript 인터페이스 및 타입 정의
└── utils/              # OAuth 헬퍼, 포맷터, 공통 유틸 함수
```

---

## 🔍 주요 기술적 구현 포인트

1. **JWT 토큰 기반 인증 및 자동 갱신**
   - `Axios Interceptor`를 활용하여 요청 시 `Authorization: Bearer` 헤더를 자동 주입하며, Access Token 만료 시 Refresh Token을 통한 자동 재발급을 처리하여 매끄러운 로그인 세션을 유지합니다.

2. **`@dnd-kit`을 활용한 예산 반응형 장바구니**
   - 터치 및 마우스 이벤트를 지원하는 드래그 앤 드롭 인터페이스로 식단 메뉴 순서를 변경하거나 장바구니 항목을 직관적으로 관리할 수 있습니다.

3. **네이버 지도 Geocoder 연동 위치 탐색**
   - `react-naver-maps`와 submodules(`geocoder`)를 활용해 사용자 현재 위치 좌표를 도로명 주소로 변환하고 주변 가성비 식당을 위치 기반으로 렌더링합니다.

4. **PWA (Progressive Web App) 최적화**
   - `vite-plugin-pwa`를 도입하여 오프라인 캐싱 및 모바일 홈 화면 추가(Add to Home Screen)를 지원하며 모바일 앱과 유사한 사용성을 제공합니다.

---

## 🚀 시작 가이드

### 1. Repository Clone & Dependency Install

```bash
git clone https://github.com/Picance/SmartMealTable-Front.git
cd SmartMealTable-Front
npm install
```

### 2. Environment Variables (.env) 설정

루트 디렉토리에 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

```env
VITE_API_BASE_URL=https://your-api-server.com/api/v1
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/google/callback
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/oauth/kakao/callback
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드 및 미리보기

```bash
npm run build
npm run preview
```
