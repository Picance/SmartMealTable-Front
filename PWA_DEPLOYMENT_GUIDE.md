# Smart Meal Table PWA 배포 가이드

## 📱 PWA 설정 완료!

프로젝트가 Progressive Web App(PWA)으로 설정되었습니다.

## 🔧 현재 설정 내용

### 1. Vite PWA 플러그인 설정

- Service Worker 자동 생성 및 업데이트
- 오프라인 캐싱 지원
- API 요청 캐싱 전략 구성

### 2. PWA Manifest

- 앱 이름: Smart Meal Table
- 독립 실행형(standalone) 모드
- 세로 방향(portrait) 고정

## 🎨 아이콘 생성 필요

현재 placeholder 아이콘 파일들이 생성되어 있습니다. 실제 아이콘으로 교체해주세요:

### 필요한 아이콘 파일들 (public 폴더):

- `pwa-64x64.png` (64x64px)
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `maskable-icon-512x512.png` (512x512px, maskable용)
- `apple-touch-icon.png` (180x180px 권장)
- `favicon.ico`

### 아이콘 생성 도구 추천:

- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
- **Favicon Generator**: https://realfavicongenerator.net/
- **Figma/Canva**: 직접 디자인

## 🚀 빌드 및 배포 방법

### 로컬에서 PWA 테스트

```bash
# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 버전 미리보기
npm run preview
```

빌드 후 `http://localhost:4173`에서 PWA 기능 테스트 가능 (설치 프롬프트, 오프라인 모드 등)

## 🌐 배포 옵션

### 옵션 1: Vercel (추천) ⭐

무료이며 설정이 가장 간단합니다.

**장점:**

- 자동 HTTPS 지원
- GitHub 연동 시 자동 배포
- 글로벌 CDN
- 무료 플랜으로 충분
- PWA 완벽 지원

**배포 방법:**

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

**또는 Vercel 웹사이트 사용:**

1. https://vercel.com 접속
2. GitHub 저장소 연결
3. Import 클릭 (자동으로 Vite 프로젝트 감지)
4. Deploy 클릭

### 옵션 2: Netlify

Vercel과 비슷한 무료 호스팅 서비스

**배포 방법:**

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=dist
```

**또는 웹 인터페이스:**

1. https://netlify.com 접속
2. 빌드 폴더(`dist`) 드래그 앤 드롭

### 옵션 3: GitHub Pages

무료이지만 약간의 설정 필요

**vite.config.ts에 base 경로 추가:**

```typescript
export default defineConfig({
  base: "/저장소이름/",
  // ... 나머지 설정
});
```

**package.json에 스크립트 추가:**

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**배포:**

```bash
npm install -D gh-pages
npm run deploy
```

### 옵션 4: Firebase Hosting

Google의 호스팅 서비스

```bash
# Firebase CLI 설치
npm i -g firebase-tools

# Firebase 프로젝트 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy
```

## 📱 PWA 설치 방법

배포 후 사용자가 앱을 설치하는 방법:

### 데스크톱 (Chrome/Edge):

1. 배포된 사이트 접속
2. 주소창 오른쪽의 "설치" 아이콘 클릭
3. "설치" 버튼 클릭

### 모바일 (iOS Safari):

1. Safari에서 사이트 접속
2. 공유 버튼 탭
3. "홈 화면에 추가" 선택

### 모바일 (Android Chrome):

1. Chrome에서 사이트 접속
2. 메뉴(⋮) → "앱 설치" 또는 "홈 화면에 추가"

## ✅ PWA 체크리스트

설치 전 확인사항:

- [x] vite-plugin-pwa 설치됨
- [x] PWA 설정 완료
- [ ] 실제 아이콘 파일 교체
- [ ] HTTPS 환경에서 배포 (필수!)
- [ ] 브라우저에서 설치 프롬프트 확인

## 🔍 PWA 검증 도구

배포 후 PWA가 제대로 작동하는지 확인:

1. **Chrome DevTools**

   - F12 → Application 탭 → Manifest, Service Workers 확인

2. **Lighthouse**

   - Chrome DevTools → Lighthouse 탭
   - "Progressive Web App" 카테고리 분석

3. **PWA Builder**
   - https://www.pwabuilder.com/
   - URL 입력하여 PWA 품질 확인

## 📊 권장 배포 전략

### 개발/테스트용

- **Vercel Preview Deployments**: PR마다 자동 배포
- 팀원들과 쉽게 공유 가능

### 프로덕션용

- **Vercel 또는 Netlify**: 안정적이고 빠른 성능
- 커스텀 도메인 연결 가능

## 🎯 추가 개선사항

### PWA 기능 강화:

```bash
# Push Notification 추가
# Background Sync 구현
# Offline 페이지 커스터마이징
```

### 성능 최적화:

- 이미지 최적화 (WebP 포맷)
- Code Splitting
- Lazy Loading

## 🆘 문제 해결

### PWA가 설치되지 않을 때:

1. HTTPS 환경인지 확인 (localhost는 예외)
2. manifest.json이 올바르게 로드되는지 확인
3. Service Worker가 등록되었는지 확인
4. 아이콘 파일들이 존재하는지 확인

### Service Worker 업데이트 문제:

```bash
# 브라우저 DevTools에서
Application → Service Workers → Unregister
새로고침 (Shift + Cmd + R)
```

## 📞 추가 도움

- Vite PWA 문서: https://vite-pwa-org.netlify.app/
- PWA 체크리스트: https://web.dev/pwa-checklist/
- MDN PWA 가이드: https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps
