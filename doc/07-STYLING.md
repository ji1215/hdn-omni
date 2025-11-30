# 7. 스타일링 가이드

## Tailwind CSS

이 프로젝트는 **Tailwind CSS**를 사용합니다. 유틸리티 클래스 기반의 스타일링 방식입니다.

### 설정 파일

`tailwind.config.js`에서 커스텀 설정을 관리합니다.

---

## 커스텀 테마 색상

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 기본 색상
        primary: '#FF6B4A',           // 메인 브랜드 색상 (주황/코랄)
        'primary-50': '#fff5f2',
        'primary-100': '#ffe8e0',
        'primary-200': '#ffd0c2',
        'primary-300': '#ffb199',
        'primary-400': '#ff8a65',
        'primary-500': '#FF6B4A',
        'primary-600': '#f04e2b',
        'primary-700': '#d43d1e',
        'primary-800': '#b02f18',
        'primary-900': '#8f2715',

        secondary: '#FF8A65',

        // 상태 색상
        success: '#10b981',           // 성공/온라인
        warning: '#f59e0b',           // 경고
        error: '#ef4444',             // 에러/오프라인

        // 레이아웃 색상
        'sidebar-bg': '#1A1A1A',      // 사이드바 배경
        'sidebar-hover': '#2D2D2D',   // 사이드바 호버
        'sidebar-active': '#3A3A3A',  // 사이드바 활성

        'header-bg': '#ffffff',       // 헤더 배경
        'bg-main': '#F5F6FA',         // 메인 배경
        'card-bg': '#ffffff',         // 카드 배경
        'border-color': '#E8E9F1',    // 테두리

        // 텍스트 색상
        'text-primary': '#1A1A1A',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',

        // 다크 모드
        'dark-bg': '#111827',
        'dark-card': '#1f2937',
      },
    },
  },
};
```

### 색상 사용 예시

```tsx
// 기본 색상
<div className="bg-primary text-white">Primary Button</div>

// 상태 색상
<span className="text-success">온라인</span>
<span className="text-warning">경고</span>
<span className="text-error">오프라인</span>

// 레이아웃 색상
<aside className="bg-sidebar-bg">사이드바</aside>
<main className="bg-bg-main">메인 콘텐츠</main>
```

---

## 다크 모드

Tailwind의 `class` 기반 다크 모드를 사용합니다.

### 설정

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // 'class' 전략 사용
  // ...
};
```

### 사용 방법

```tsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">
    라이트/다크 모드에 따라 색상이 변경됩니다.
  </p>
</div>
```

### 다크 모드 토글

`store/useStore.ts`의 `toggleTheme` 함수를 사용합니다:

```typescript
// 스토어
const useStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));

// 컴포넌트
const { theme, toggleTheme } = useStore();

<button onClick={toggleTheme}>
  {theme === 'dark' ? <Sun /> : <Moon />}
</button>
```

`ThemeProvider`가 `document.documentElement`에 `dark` 클래스를 추가/제거합니다.

---

## 반응형 디자인

### 브레이크포인트

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      sm: '640px',    // 모바일 가로/소형 태블릿
      md: '768px',    // 태블릿
      lg: '1024px',   // 데스크톱
      xl: '1280px',   // 대형 데스크톱
      '2xl': '1536px', // 초대형 화면
    },
  },
};
```

### 사용 패턴 (모바일 우선)

```tsx
// 기본: 모바일 스타일
// sm: 640px 이상
// md: 768px 이상
// lg: 1024px 이상

<div className="
  grid
  grid-cols-1           // 모바일: 1열
  md:grid-cols-2        // 태블릿: 2열
  lg:grid-cols-3        // 데스크톱: 3열
  gap-4
">

<div className="
  flex
  flex-col              // 모바일: 세로 배치
  lg:flex-row           // 데스크톱: 가로 배치
  gap-4
">

<p className="
  text-sm               // 모바일: 작은 텍스트
  md:text-base          // 태블릿: 기본 텍스트
  lg:text-lg            // 데스크톱: 큰 텍스트
">
```

### 반응형 패딩/마진

```tsx
<div className="
  p-4                   // 모바일: 16px
  md:p-6                // 태블릿: 24px
  lg:p-8                // 데스크톱: 32px
">
```

### 숨기기/보이기

```tsx
<div className="hidden md:block">  // 모바일에서 숨김
<div className="block md:hidden">  // 태블릿 이상에서 숨김
```

---

## 커스텀 애니메이션

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-out': 'fadeOut 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // ...
      },
    },
  },
};
```

### 사용 예시

```tsx
<div className="animate-slide-in">사이드바 슬라이드</div>
<div className="animate-fade-in">페이드 인</div>
```

---

## 글로벌 스타일

`styles/globals.css`에서 기본 스타일과 유틸리티 클래스를 정의합니다.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-main text-text-primary;
  }
}

@layer components {
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6;
  }

  .btn-primary {
    @apply bg-primary hover:bg-primary-600 text-white rounded-lg px-4 py-2;
  }
}

@layer utilities {
  .sidebar-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-600 rounded;
  }
}
```

---

## 자주 사용하는 스타일 패턴

### 카드

```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
  {/* 카드 내용 */}
</div>

// 또는 글로벌 스타일의 .card 클래스 사용
<div className="card">
  {/* 카드 내용 */}
</div>
```

### 버튼

```tsx
// Primary
<button className="bg-primary hover:bg-primary-600 text-white rounded-lg px-4 py-2 transition-colors">
  저장
</button>

// Secondary
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors">
  취소
</button>

// Ghost
<button className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors">
  더보기
</button>
```

### 입력 필드

```tsx
<input
  type="text"
  className="
    w-full
    px-4 py-2
    border border-gray-300 dark:border-gray-600
    rounded-lg
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    placeholder-gray-400
    transition-colors
  "
  placeholder="입력하세요"
/>
```

### 테이블

```tsx
<table className="w-full">
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
        이름
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        홍길동
      </td>
    </tr>
  </tbody>
</table>
```

### 배지/태그

```tsx
// 상태 배지
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  온라인
</span>

<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
  오프라인
</span>

// 역할 배지
<span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
  관리자
</span>
```

---

## cn() 유틸리티 함수

조건부 클래스와 클래스 병합을 처리합니다.

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 사용 예시

```tsx
import { cn } from '@/lib/utils';

// 조건부 클래스
<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>

// props로 받은 className 병합
<button className={cn(
  'bg-primary text-white rounded-lg px-4 py-2',
  className  // 외부에서 전달된 className
)}>
```
