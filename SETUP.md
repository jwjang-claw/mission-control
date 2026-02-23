# 🚀 Mission Control - Task Board Setup Guide

## Initial Setup Required

이 프로젝트는 Convex 실시간 데이터베이스를 사용합니다. 첫 실행 전에 다음 설정을 완료해주세요.

### 1️⃣ Convex 계정 생성 및 로그인

[convex.dev](https://convex.dev)에서 무료 계정을 만드세요.

```bash
npx convex login
```

### 2️⃣ Convex 프로젝트 초기화

```bash
npx convex dev
```

이 명령은 다음을 수행합니다:
- 새 Convex 프로젝트 생성
- `convex/_generated/` 디렉토리에 타입 정의 생성
- Convex 개발 서버 시작 (http://127.0.0.1:3210)

### 3️⃣ 환경 변수 설정

`.env.local` 파일이 자동으로 생성됩니다. 확인하세요:

```env
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

### 4️⃣ 개발 서버 시작

**중요**: 두 개의 터미널이 필요합니다!

**터미널 1 - Convex 서버:**
```bash
npx convex dev
```

**터미널 2 - Next.js 개발 서버:**
```bash
npm run dev
```

이제 http://localhost:3000에서 Task Board를 사용할 수 있습니다!

## 테스트 실행

Convex 없이 테스트를 실행할 수 있습니다:

```bash
npm run test:run
```

## 프로덕션 빌드

프로덕션 빌드 전에 Convex를 배포하세요:

```bash
# Convex 배포
npx convex deploy

# Next.js 빌드
npm run build
npm start
```

## 문제 해결

### "Cannot find module './_generated/server'" 오류

해결책:
```bash
npx convex dev
```

### 타입 오류

해결책:
```bash
npx convex dev
# 타입이 재생성됩니다
```

### 환경 변수 오류

`.env.local` 파일이 있는지 확인하세요:
```bash
ls -la .env.local
```

## 프로젝트 구조

```
mission-control/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ConvexProvider 설정
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/
│   ├── TaskBoard.tsx      # 메인 Task Board 컴포넌트
│   └── __tests__/         # 단위 테스트
├── convex/
│   ├── schema.ts          # 데이터베이스 스키마
│   ├── tasks.ts           # Task CRUD 작업
│   └── _generated/        # 자동 생성된 타입 (convex dev 후)
├── lib/
│   └── convex.tsx         # Convex 클라이언트 설정
└── vitest.config.ts       # 테스트 설정
```

## 기능

- ✅ **실시간 동기화**: Convex 구독을 통한 즉시 업데이트
- 📋 **3열 레이아웃**: In Progress 🔥, Done ✅, Pending/Blocked 📌
- 👥 **담당자 관리**: Kuro 🐱 또는 snail 👤
- 🎨 **모던 UI**: Tailwind CSS를 사용한 반응형 디자인
- 🔄 **전체 CRUD**: 생성, 읽기, 업데이트, 삭제
- 🧪 **단위 테스트**: Vitest로 9개 테스트 통과
