/**
 * 비밀번호 생성 및 검증 유틸리티
 */

/**
 * 임시 비밀번호를 생성합니다.
 * - 최소 12자 이상
 * - 대문자, 소문자, 숫자, 특수문자 포함
 *
 * @param length 비밀번호 길이 (기본: 12)
 * @returns 생성된 임시 비밀번호
 */
export function generateTemporaryPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + special;

  // 각 카테고리에서 최소 1개씩 포함
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // 나머지 길이만큼 랜덤하게 채우기
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 문자열을 섞어서 패턴이 예측 불가능하게 만들기
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * 비밀번호 강도를 검증합니다.
 *
 * @param password 검증할 비밀번호
 * @returns 강도 점수 (0-4)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * 비밀번호 강도에 따른 레이블을 반환합니다.
 *
 * @param strength 강도 점수 (0-4)
 * @returns 강도 레이블
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
  return labels[strength] || labels[0];
}

/**
 * 비밀번호 강도에 따른 색상 클래스를 반환합니다.
 *
 * @param strength 강도 점수 (0-4)
 * @returns Tailwind 색상 클래스
 */
export function getPasswordStrengthColor(strength: number): string {
  const colors = [
    'text-red-600',
    'text-orange-600',
    'text-yellow-600',
    'text-green-600',
    'text-green-700',
  ];
  return colors[strength] || colors[0];
}

/**
 * 비밀번호 유효성 검증 결과 타입
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 비밀번호가 최소 길이 요구사항을 충족하는지 검증합니다.
 *
 * @param password 검증할 비밀번호
 * @param minLength 최소 길이 (기본: 9)
 * @returns 검증 결과
 */
export function validatePasswordLength(password: string, minLength: number = 9): boolean {
  return password.length >= minLength;
}

/**
 * 비밀번호에 3가지 이상의 문자 조합이 포함되어 있는지 검증합니다.
 * (숫자, 대문자, 소문자, 특수문자 중 3가지 이상)
 *
 * @param password 검증할 비밀번호
 * @returns 검증 결과
 */
export function validatePasswordComplexity(password: string): boolean {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const typeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  return typeCount >= 3;
}

/**
 * 비밀번호가 사용자 ID와 동일하지 않은지 검증합니다.
 *
 * @param password 검증할 비밀번호
 * @param userId 사용자 ID
 * @returns 검증 결과
 */
export function validatePasswordNotSameAsUserId(password: string, userId: string): boolean {
  return password.toLowerCase() !== userId.toLowerCase();
}

/**
 * 동일한 문자/숫자가 연속적으로 반복되는지 검증합니다.
 * (예: "aaa", "111" 금지)
 *
 * @param password 검증할 비밀번호
 * @param maxRepeat 허용되는 최대 반복 횟수 (기본: 2, 즉 3회 이상 반복 금지)
 * @returns 검증 결과
 */
export function validateNoConsecutiveRepeats(password: string, maxRepeat: number = 2): boolean {
  for (let i = 0; i < password.length - maxRepeat; i++) {
    const char = password[i];
    let isRepeating = true;

    for (let j = 1; j <= maxRepeat; j++) {
      if (password[i + j] !== char) {
        isRepeating = false;
        break;
      }
    }

    if (isRepeating) {
      return false;
    }
  }
  return true;
}

/**
 * 키보드상의 연속된 문자 또는 숫자가 순차적으로 입력되었는지 검증합니다.
 * (예: "abc", "123", "qwerty" 금지)
 *
 * @param password 검증할 비밀번호
 * @param maxSequence 허용되는 최대 시퀀스 길이 (기본: 2, 즉 3자 이상 시퀀스 금지)
 * @returns 검증 결과
 */
export function validateNoSequentialInput(password: string, maxSequence: number = 2): boolean {
  // 키보드 배열 정의
  const keyboardRows = [
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    '1234567890',
    'qwertyuiopasdfghjklzxcvbnm', // 전체 알파벳
  ];

  const lowerPassword = password.toLowerCase();

  // 각 키보드 배열에 대해 검증
  for (const row of keyboardRows) {
    for (let i = 0; i <= row.length - (maxSequence + 1); i++) {
      const sequence = row.substring(i, i + maxSequence + 1);
      const reverseSequence = sequence.split('').reverse().join('');

      if (lowerPassword.includes(sequence) || lowerPassword.includes(reverseSequence)) {
        return false;
      }
    }
  }

  // 숫자 순차 증가/감소 검증 (예: 123, 321, 456, 654)
  for (let i = 0; i < lowerPassword.length - maxSequence; i++) {
    const charCodes = [];
    let isSequential = true;

    for (let j = 0; j <= maxSequence; j++) {
      const code = lowerPassword.charCodeAt(i + j);
      charCodes.push(code);
    }

    // 연속 증가 검증
    for (let j = 1; j < charCodes.length; j++) {
      if (charCodes[j] !== charCodes[j - 1] + 1) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) return false;

    // 연속 감소 검증
    isSequential = true;
    for (let j = 1; j < charCodes.length; j++) {
      if (charCodes[j] !== charCodes[j - 1] - 1) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) return false;
  }

  return true;
}

/**
 * 비밀번호에 대한 전체 유효성 검증을 수행합니다.
 *
 * @param password 검증할 비밀번호
 * @param userId 사용자 ID (선택)
 * @returns 검증 결과 및 오류 메시지 목록
 */
export function validatePassword(password: string, userId?: string): PasswordValidationResult {
  const errors: string[] = [];

  // 1. 최소 길이 검증 (9자 이상)
  if (!validatePasswordLength(password, 9)) {
    errors.push('비밀번호는 최소 9자 이상이어야 합니다.');
  }

  // 2. 문자 조합 검증 (숫자, 대문자, 소문자, 특수문자 중 3가지 이상)
  if (!validatePasswordComplexity(password)) {
    errors.push('숫자, 대문자, 소문자, 특수문자 중 3가지 이상을 조합해야 합니다.');
  }

  // 3. 사용자 ID와 동일 여부 검증
  if (userId && !validatePasswordNotSameAsUserId(password, userId)) {
    errors.push('비밀번호는 사용자 ID와 동일할 수 없습니다.');
  }

  // 4. 연속된 반복 문자 검증
  if (!validateNoConsecutiveRepeats(password)) {
    errors.push('동일한 문자 또는 숫자를 연속으로 3회 이상 사용할 수 없습니다.');
  }

  // 5. 순차적 입력 검증
  if (!validateNoSequentialInput(password)) {
    errors.push('키보드상의 연속된 문자 또는 숫자를 순차적으로 사용할 수 없습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
