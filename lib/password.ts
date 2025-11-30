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
