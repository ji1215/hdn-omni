'use client';

import { format } from 'date-fns';
import { Download } from 'lucide-react';
import type { Flow } from '@/types/traffic';
import { Button } from '@/components/common';

interface FlowExportButtonProps {
  flows: Flow[];
  isDark?: boolean;
  className?: string;
}

export function FlowExportButton({
  flows,
  isDark = false,
  className = '',
}: FlowExportButtonProps) {
  const exportToCSV = () => {
    if (flows.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    // CSV 데이터 준비
    const csvData = flows.map((flow) => ({
      '플로우 ID': flow.id,
      프로토콜: flow.protocol,
      '소스 IP': flow.sourceIp,
      '소스 포트': flow.sourcePort,
      '목적지 IP': flow.destinationIp,
      '목적지 포트': flow.destinationPort,
      상태: flow.status,
      패킷: flow.packets,
      바이트: flow.bytes,
      '시작 시간': format(new Date(flow.startTime), 'yyyy-MM-dd HH:mm:ss'),
      '종료 시간': flow.endTime
        ? format(new Date(flow.endTime), 'yyyy-MM-dd HH:mm:ss')
        : '',
      '지속 시간(ms)': flow.duration || '',
      애플리케이션: flow.application || '',
      'VLAN ID': flow.vlanId || '',
    }));

    // CSV 문자열 생성
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // 쉼표나 따옴표가 포함된 경우 따옴표로 감싸기
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    // BOM 추가 (Excel에서 한글이 깨지지 않도록)
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `flows_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={exportToCSV}
      variant="primary"
      leftIcon={<Download />}
      className={className}
      title="CSV 파일로 내보내기"
    >
      CSV 내보내기
    </Button>
  );
}
