import { useState, useEffect } from 'react';

/**
 * 값의 변경을 지연시키는 커스텀 훅
 * 주로 검색 입력 등에서 API 호출을 줄이기 위해 사용
 *
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}