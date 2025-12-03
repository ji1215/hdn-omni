// 네트워크 장비 아이콘 SVG 경로 및 유틸리티

// 스위치 아이콘 (네트워크 스위치 모양)
export const switchIconPath = `
  M 4 8 L 4 24 L 28 24 L 28 8 L 4 8 Z
  M 6 12 L 8 12 L 8 14 L 6 14 Z
  M 10 12 L 12 12 L 12 14 L 10 14 Z
  M 14 12 L 16 12 L 16 14 L 14 14 Z
  M 18 12 L 20 12 L 20 14 L 18 14 Z
  M 22 12 L 24 12 L 24 14 L 22 14 Z
  M 26 12 L 26 14
  M 6 18 L 8 18 L 8 20 L 6 20 Z
  M 10 18 L 12 18 L 12 20 L 10 20 Z
  M 14 18 L 16 18 L 16 20 L 14 20 Z
  M 18 18 L 20 18 L 20 20 L 18 20 Z
  M 22 18 L 24 18 L 24 20 L 22 20 Z
`;

// 라우터 아이콘 (라우터 모양)
export const routerIconPath = `
  M 4 10 L 4 22 L 28 22 L 28 10 L 4 10 Z
  M 8 14 L 10 14 L 10 18 L 8 18 Z
  M 13 14 L 19 14 L 19 18 L 13 18 Z
  M 22 14 L 24 14 L 24 18 L 22 18 Z
  M 14 6 L 18 6 L 18 10 L 14 10 Z
  M 16 2 L 16 6
`;

// 호스트/서버 아이콘
export const hostIconPath = `
  M 8 4 L 8 28 L 24 28 L 24 4 L 8 4 Z
  M 12 8 L 20 8 L 20 12 L 12 12 Z
  M 12 14 L 20 14 L 20 18 L 12 18 Z
  M 14 22 L 18 22 L 18 24 L 14 24 Z
`;

// 컨트롤러 아이콘
export const controllerIconPath = `
  M 16 2 L 16 6
  M 16 26 L 16 30
  M 2 16 L 6 16
  M 26 16 L 30 16
  M 6 6 L 9 9
  M 23 23 L 26 26
  M 6 26 L 9 23
  M 23 9 L 26 6
  M 16 8 A 8 8 0 1 1 16 24 A 8 8 0 1 1 16 8
  M 16 11 A 5 5 0 1 1 16 21 A 5 5 0 1 1 16 11
`;

// 방화벽 아이콘
export const firewallIconPath = `
  M 4 6 L 4 26 L 28 26 L 28 6 L 4 6 Z
  M 8 10 L 24 10
  M 8 14 L 24 14
  M 8 18 L 24 18
  M 8 22 L 24 22
  M 12 6 L 12 26
  M 20 6 L 20 26
`;

// 그룹 아이콘 (클라우드 모양)
export const groupIconPath = `
  M 8 20 A 4 4 0 0 1 8 12 A 6 6 0 0 1 14 8 A 6 6 0 0 1 20 12 A 4 4 0 0 1 24 16 A 4 4 0 0 1 20 20 Z
`;

// Canvas에 스위치 아이콘 그리기
export function drawSwitchIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 16;
  ctx.save();
  ctx.translate(x - size, y - size * 0.6);
  ctx.scale(scale, scale);

  // 메인 박스
  ctx.beginPath();
  ctx.roundRect(0, 0, 32, 20, 3);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 포트들 (상단)
  const portColor = isDarkMode ? '#60A5FA' : '#3B82F6';
  const activePortColor = '#22C55E';

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.roundRect(4 + i * 7, 4, 5, 4, 1);
    ctx.fillStyle = i % 2 === 0 ? activePortColor : portColor;
    ctx.fill();
  }

  // 포트들 (하단)
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.roundRect(4 + i * 7, 12, 5, 4, 1);
    ctx.fillStyle = i % 3 === 0 ? activePortColor : portColor;
    ctx.fill();
  }

  ctx.restore();
}

// Canvas에 라우터 아이콘 그리기
export function drawRouterIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 16;
  ctx.save();
  ctx.translate(x - size, y - size * 0.7);
  ctx.scale(scale, scale);

  // 메인 박스
  ctx.beginPath();
  ctx.roundRect(0, 6, 32, 16, 3);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 안테나
  ctx.beginPath();
  ctx.moveTo(16, 6);
  ctx.lineTo(16, 0);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 신호 표시
  ctx.beginPath();
  ctx.arc(16, 0, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();

  // 화살표 (양방향)
  const arrowColor = isDarkMode ? '#60A5FA' : '#3B82F6';
  ctx.fillStyle = arrowColor;

  // 왼쪽 화살표
  ctx.beginPath();
  ctx.moveTo(6, 14);
  ctx.lineTo(10, 11);
  ctx.lineTo(10, 17);
  ctx.closePath();
  ctx.fill();

  // 오른쪽 화살표
  ctx.beginPath();
  ctx.moveTo(26, 14);
  ctx.lineTo(22, 11);
  ctx.lineTo(22, 17);
  ctx.closePath();
  ctx.fill();

  // 연결선
  ctx.beginPath();
  ctx.moveTo(10, 14);
  ctx.lineTo(22, 14);
  ctx.strokeStyle = arrowColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  ctx.restore();
}

// Canvas에 호스트/서버 아이콘 그리기
export function drawHostIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 14;
  ctx.save();
  ctx.translate(x - size * 0.7, y - size);
  ctx.scale(scale, scale);

  // 모니터 화면
  ctx.beginPath();
  ctx.roundRect(2, 0, 24, 18, 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 화면 내부
  ctx.beginPath();
  ctx.roundRect(4, 2, 20, 12, 1);
  ctx.fillStyle = isDarkMode ? '#1F2937' : '#E5E7EB';
  ctx.fill();

  // 화면 내용 (라인들)
  ctx.strokeStyle = isDarkMode ? '#60A5FA' : '#3B82F6';
  ctx.lineWidth = 1 / scale;
  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.lineTo(16, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 9);
  ctx.lineTo(20, 9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 12);
  ctx.lineTo(14, 12);
  ctx.stroke();

  // 받침대
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(16, 18);
  ctx.lineTo(16, 22);
  ctx.lineTo(12, 22);
  ctx.closePath();
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // 베이스
  ctx.beginPath();
  ctx.roundRect(8, 22, 12, 3, 1);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  ctx.restore();
}

// Canvas에 컨트롤러 아이콘 그리기
export function drawControllerIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 16;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 외곽 원
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 내부 원
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = isDarkMode ? '#1F2937' : '#F3F4F6';
  ctx.fill();

  // 중앙 점
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();

  // 연결선들
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  const lines = [0, 45, 90, 135, 180, 225, 270, 315];
  lines.forEach(angle => {
    const rad = (angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(Math.cos(rad) * 10, Math.sin(rad) * 10);
    ctx.lineTo(Math.cos(rad) * 16, Math.sin(rad) * 16);
    ctx.stroke();
  });

  ctx.restore();
}

// Canvas에 방화벽 아이콘 그리기
export function drawFirewallIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 16;
  ctx.save();
  ctx.translate(x - size, y - size * 0.7);
  ctx.scale(scale, scale);

  // 메인 박스
  ctx.beginPath();
  ctx.roundRect(0, 2, 32, 20, 3);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 벽돌 패턴
  ctx.strokeStyle = isDarkMode ? '#374151' : '#9CA3AF';
  ctx.lineWidth = 1 / scale;

  // 가로선
  ctx.beginPath();
  ctx.moveTo(2, 8);
  ctx.lineTo(30, 8);
  ctx.moveTo(2, 14);
  ctx.lineTo(30, 14);
  ctx.moveTo(2, 20);
  ctx.lineTo(30, 20);
  ctx.stroke();

  // 세로선 (엇갈림)
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(10, 8);
  ctx.moveTo(22, 2);
  ctx.lineTo(22, 8);
  ctx.moveTo(5, 8);
  ctx.lineTo(5, 14);
  ctx.moveTo(16, 8);
  ctx.lineTo(16, 14);
  ctx.moveTo(27, 8);
  ctx.lineTo(27, 14);
  ctx.moveTo(10, 14);
  ctx.lineTo(10, 20);
  ctx.moveTo(22, 14);
  ctx.lineTo(22, 20);
  ctx.stroke();

  ctx.restore();
}

// Canvas에 그룹 아이콘 그리기
export function drawGroupIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  const scale = size / 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 클라우드 모양
  ctx.beginPath();
  ctx.arc(-6, 2, 6, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(0, -4, 6, Math.PI, Math.PI * 2);
  ctx.arc(6, 2, 6, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(-6, 8);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  ctx.restore();
}

// 타입에 따라 적절한 아이콘 그리기
export function drawNetworkIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  role: string | undefined,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
) {
  if (type === 'switch' || role === 'spine' || role === 'leaf') {
    drawSwitchIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else if (type === 'router') {
    drawRouterIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else if (type === 'host') {
    drawHostIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else if (type === 'controller') {
    drawControllerIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else if (type === 'firewall') {
    drawFirewallIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else if (type === 'group') {
    drawGroupIcon(ctx, x, y, size, fillColor, strokeColor, isDarkMode);
  } else {
    // 기본: 원형
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// SVG 아이콘 데이터 URL 생성 (Cytoscape, vis.js 용) - 고품질 버전
export function getSwitchIconSvg(fillColor: string, strokeColor: string, isDarkMode: boolean): string {
  const portColor = isDarkMode ? '#60A5FA' : '#3B82F6';
  const activeColor = '#22C55E';
  const highlightColor = isDarkMode ? '#4B5563' : '#E5E7EB';
  const shadowColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44">
      <defs>
        <linearGradient id="switchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${highlightColor};stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="${shadowColor}"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="56" height="36" rx="6" fill="url(#switchGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#shadow)"/>
      <rect x="6" y="6" width="52" height="4" rx="2" fill="${highlightColor}" opacity="0.3"/>
      <g transform="translate(8, 14)">
        <rect x="0" y="0" width="10" height="7" rx="2" fill="${activeColor}">
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="13" y="0" width="10" height="7" rx="2" fill="${portColor}"/>
        <rect x="26" y="0" width="10" height="7" rx="2" fill="${activeColor}">
          <animate attributeName="opacity" values="1;0.6;1" dur="2.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="39" y="0" width="10" height="7" rx="2" fill="${portColor}"/>
      </g>
      <g transform="translate(8, 26)">
        <rect x="0" y="0" width="10" height="7" rx="2" fill="${portColor}"/>
        <rect x="13" y="0" width="10" height="7" rx="2" fill="${activeColor}">
          <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="26" y="0" width="10" height="7" rx="2" fill="${portColor}"/>
        <rect x="39" y="0" width="10" height="7" rx="2" fill="${activeColor}">
          <animate attributeName="opacity" values="1;0.6;1" dur="2.2s" repeatCount="indefinite"/>
        </rect>
      </g>
    </svg>
  `)}`;
}

export function getRouterIconSvg(fillColor: string, strokeColor: string, isDarkMode: boolean): string {
  const arrowColor = isDarkMode ? '#60A5FA' : '#3B82F6';
  const highlightColor = isDarkMode ? '#4B5563' : '#E5E7EB';
  const shadowColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
      <defs>
        <linearGradient id="routerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${highlightColor};stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="rshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="${shadowColor}"/>
        </filter>
      </defs>
      <rect x="4" y="14" width="56" height="30" rx="6" fill="url(#routerGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#rshadow)"/>
      <rect x="6" y="16" width="52" height="4" rx="2" fill="${highlightColor}" opacity="0.3"/>
      <line x1="32" y1="14" x2="32" y2="4" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="4" r="4" fill="#22C55E">
        <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <g transform="translate(10, 26)">
        <polygon points="0,8 12,0 12,16" fill="${arrowColor}"/>
        <rect x="12" y="5" width="20" height="6" rx="2" fill="${arrowColor}"/>
        <polygon points="44,8 32,0 32,16" fill="${arrowColor}"/>
      </g>
    </svg>
  `)}`;
}

export function getHostIconSvg(fillColor: string, strokeColor: string, isDarkMode: boolean): string {
  const screenBg = isDarkMode ? '#1F2937' : '#1E293B';
  const lineColor = isDarkMode ? '#60A5FA' : '#3B82F6';
  const highlightColor = isDarkMode ? '#4B5563' : '#E5E7EB';
  const shadowColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 64">
      <defs>
        <linearGradient id="hostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${highlightColor};stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="hshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="${shadowColor}"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="44" height="34" rx="4" fill="url(#hostGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#hshadow)"/>
      <rect x="7" y="7" width="38" height="26" rx="3" fill="${screenBg}"/>
      <line x1="12" y1="14" x2="32" y2="14" stroke="${lineColor}" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="20" x2="40" y2="20" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <line x1="12" y1="26" x2="28" y2="26" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <rect x="22" y="38" width="8" height="10" fill="${strokeColor}"/>
      <rect x="14" y="48" width="24" height="6" rx="3" fill="${strokeColor}"/>
      <ellipse cx="26" cy="51" rx="8" ry="2" fill="${highlightColor}" opacity="0.3"/>
    </svg>
  `)}`;
}

export function getControllerIconSvg(fillColor: string, strokeColor: string, isDarkMode: boolean): string {
  const innerBg = isDarkMode ? '#1F2937' : '#F3F4F6';
  const highlightColor = isDarkMode ? '#4B5563' : '#E5E7EB';
  const shadowColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="ctrlGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" style="stop-color:${highlightColor};stop-opacity:0.8"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </radialGradient>
        <filter id="cshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="3" flood-color="${shadowColor}"/>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#ctrlGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#cshadow)"/>
      <circle cx="32" cy="32" r="16" fill="${innerBg}" stroke="${strokeColor}" stroke-width="1"/>
      <circle cx="32" cy="32" r="7" fill="#22C55E">
        <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite"/>
      </circle>
      <g stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round">
        <line x1="32" y1="4" x2="32" y2="12"/>
        <line x1="32" y1="52" x2="32" y2="60"/>
        <line x1="4" y1="32" x2="12" y2="32"/>
        <line x1="52" y1="32" x2="60" y2="32"/>
        <line x1="10" y1="10" x2="16" y2="16"/>
        <line x1="48" y1="48" x2="54" y2="54"/>
        <line x1="10" y1="54" x2="16" y2="48"/>
        <line x1="48" y1="16" x2="54" y2="10"/>
      </g>
    </svg>
  `)}`;
}

export function getFirewallIconSvg(fillColor: string, strokeColor: string, isDarkMode: boolean): string {
  const brickColor = isDarkMode ? '#EF4444' : '#DC2626';
  const highlightColor = isDarkMode ? '#4B5563' : '#E5E7EB';
  const shadowColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44">
      <defs>
        <linearGradient id="fwGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${highlightColor};stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="fwshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="${shadowColor}"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="56" height="36" rx="4" fill="url(#fwGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#fwshadow)"/>
      <g fill="${brickColor}" opacity="0.9">
        <rect x="8" y="8" width="18" height="8" rx="1"/>
        <rect x="30" y="8" width="26" height="8" rx="1"/>
        <rect x="8" y="18" width="12" height="8" rx="1"/>
        <rect x="24" y="18" width="16" height="8" rx="1"/>
        <rect x="44" y="18" width="12" height="8" rx="1"/>
        <rect x="8" y="28" width="22" height="8" rx="1"/>
        <rect x="34" y="28" width="22" height="8" rx="1"/>
      </g>
    </svg>
  `)}`;
}

export function getGroupIconSvg(fillColor: string, strokeColor: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44">
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="cloudshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      <path d="M16 28 A12 12 0 0 1 16 12 A14 14 0 0 1 32 4 A14 14 0 0 1 48 16 A10 10 0 0 1 56 26 A10 10 0 0 1 48 38 L16 38 A12 12 0 0 1 16 28"
            fill="url(#cloudGrad)" stroke="${strokeColor}" stroke-width="2.5" filter="url(#cloudshadow)"/>
    </svg>
  `)}`;
}

// 타입에 따라 SVG 아이콘 URL 반환
export function getNetworkIconSvg(
  type: string,
  role: string | undefined,
  fillColor: string,
  strokeColor: string,
  isDarkMode: boolean
): string {
  if (type === 'switch' || role === 'spine' || role === 'leaf') {
    return getSwitchIconSvg(fillColor, strokeColor, isDarkMode);
  } else if (type === 'router') {
    return getRouterIconSvg(fillColor, strokeColor, isDarkMode);
  } else if (type === 'host') {
    return getHostIconSvg(fillColor, strokeColor, isDarkMode);
  } else if (type === 'controller') {
    return getControllerIconSvg(fillColor, strokeColor, isDarkMode);
  } else if (type === 'firewall') {
    return getFirewallIconSvg(fillColor, strokeColor, isDarkMode);
  } else if (type === 'group') {
    return getGroupIconSvg(fillColor, strokeColor);
  }

  // 기본: 원형
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
    </svg>
  `)}`;
}
