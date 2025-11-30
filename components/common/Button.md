# Button Component

공통 버튼 컴포넌트입니다. 프로젝트 전체에서 일관된 스타일의 버튼을 사용할 수 있습니다.

## 사용법

```tsx
import { Button } from '@/components/common';
import { Plus, Trash2 } from 'lucide-react';

// 기본 사용
<Button onClick={handleClick}>
  클릭
</Button>

// Primary 버튼 (기본값)
<Button variant="primary" onClick={handleSave}>
  저장
</Button>

// Secondary 버튼
<Button variant="secondary" onClick={handleCancel}>
  취소
</Button>

// Danger 버튼
<Button variant="danger" onClick={handleDelete}>
  삭제
</Button>

// Ghost 버튼 (텍스트 버튼)
<Button variant="ghost" onClick={handleEdit}>
  편집
</Button>

// Icon 버튼
<Button variant="icon" onClick={handleClose}>
  <X className="h-5 w-5" />
</Button>

// 아이콘과 함께 사용
<Button leftIcon={<Plus />} onClick={handleAdd}>
  추가
</Button>

<Button rightIcon={<ChevronRight />} onClick={handleNext}>
  다음
</Button>

// 로딩 상태
<Button loading onClick={handleSubmit}>
  제출 중...
</Button>

// 비활성화
<Button disabled onClick={handleSubmit}>
  비활성화
</Button>

// 전체 너비
<Button fullWidth onClick={handleSubmit}>
  전체 너비 버튼
</Button>

// 크기 변경
<Button size="sm" onClick={handleClick}>
  작은 버튼
</Button>

<Button size="md" onClick={handleClick}>
  중간 버튼 (기본)
</Button>

<Button size="lg" onClick={handleClick}>
  큰 버튼
</Button>

// Form 제출 버튼
<Button type="submit" variant="primary">
  제출
</Button>
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'icon'` | `'primary'` | 버튼의 시각적 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 버튼의 크기 |
| `loading` | `boolean` | `false` | 로딩 상태 표시 |
| `disabled` | `boolean` | `false` | 비활성화 상태 |
| `fullWidth` | `boolean` | `false` | 전체 너비로 확장 |
| `leftIcon` | `ReactNode` | - | 왼쪽에 표시할 아이콘 |
| `rightIcon` | `ReactNode` | - | 오른쪽에 표시할 아이콘 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 버튼 타입 |
| `onClick` | `(event: MouseEvent) => void` | - | 클릭 이벤트 핸들러 |
| `className` | `string` | - | 추가 CSS 클래스 |
| `children` | `ReactNode` | - | 버튼 내용 |

## Variant 스타일

### Primary
기본 파란색 버튼입니다. 주요 액션에 사용합니다.
- 배경: `bg-blue-600` (dark: `bg-blue-700`)
- 텍스트: `text-white`
- Hover: `hover:bg-blue-700` (dark: `hover:bg-blue-600`)

### Secondary
테두리가 있는 버튼입니다. 보조 액션에 사용합니다.
- 테두리: `border border-gray-300` (dark: `border-gray-600`)
- 텍스트: `text-gray-700` (dark: `text-gray-300`)
- Hover: `hover:bg-gray-50` (dark: `hover:bg-gray-700`)

### Danger
위험한 액션(삭제 등)에 사용하는 빨간색 버튼입니다.
- 배경: `bg-red-600` (dark: `bg-red-700`)
- 텍스트: `text-white`
- Hover: `hover:bg-red-700` (dark: `hover:bg-red-600`)

### Ghost
배경이 없는 텍스트 버튼입니다. 덜 중요한 액션에 사용합니다.
- 텍스트: `text-blue-600` (dark: `text-blue-400`)
- Hover: `hover:text-blue-700` (dark: `hover:text-blue-300`)
- Hover 배경: `hover:bg-blue-50` (dark: `hover:bg-blue-900/20`)

### Icon
아이콘만 있는 버튼입니다. 닫기 버튼, 액션 버튼 등에 사용합니다.
- 텍스트: `text-gray-400`
- Hover: `hover:text-gray-600` (dark: `hover:text-gray-300`)
- Hover 배경: `hover:bg-gray-100` (dark: `hover:bg-gray-700`)

## 실제 사용 예제

### 모달에서 사용
```tsx
<div className="flex items-center justify-end gap-3 p-4">
  <Button variant="secondary" onClick={handleClose}>
    취소
  </Button>
  <Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
    {isSubmitting ? '제출 중...' : '제출'}
  </Button>
</div>
```

### 테이블 액션에서 사용
```tsx
<div className="flex gap-2">
  <Button variant="ghost" size="sm" leftIcon={<Edit />} onClick={() => handleEdit(row)}>
    편집
  </Button>
  <Button variant="ghost" size="sm" leftIcon={<Trash2 />} onClick={() => handleDelete(row)}>
    삭제
  </Button>
</div>
```

### 페이지 헤더에서 사용
```tsx
<div className="flex items-center justify-between">
  <h1>사용자 관리</h1>
  <Button variant="primary" leftIcon={<Plus />} onClick={handleAddUser}>
    사용자 추가
  </Button>
</div>
```

## 접근성

- `disabled` 상태일 때 자동으로 `disabled` 속성이 추가됩니다.
- 포커스 링(`focus:ring-2`)이 자동으로 적용됩니다.
- 아이콘 전용 버튼의 경우 최소 터치 영역(`min-w-touch`, `min-h-touch`)이 보장됩니다.

## 다크 모드

모든 variant는 다크 모드를 지원합니다. 다크 모드는 자동으로 감지되며, Tailwind의 `dark:` prefix를 사용합니다.

## 마이그레이션 가이드

기존 버튼을 공통 Button 컴포넌트로 마이그레이션하는 방법:

### Before
```tsx
<button
  onClick={handleClick}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  클릭
</button>
```

### After
```tsx
<Button variant="primary" onClick={handleClick}>
  클릭
</Button>
```

### Before (아이콘 버튼)
```tsx
<button
  onClick={handleClose}
  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
>
  <X className="h-5 w-5" />
</button>
```

### After
```tsx
<Button variant="icon" onClick={handleClose}>
  <X className="h-5 w-5" />
</Button>
```
