'use client';

import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/utils/chartUtils';
import { Button } from '@/components/common';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  className?: string;
}

export function ExportButtons({ data, filename, className = '' }: ExportButtonsProps) {
  const handleExportCSV = () => {
    exportToCSV(data, filename);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleExportCSV}
        variant="primary"
        size="sm"
        leftIcon={<Download className="h-4 w-4" />}
        aria-label="CSV로 내보내기"
      >
        CSV 내보내기
      </Button>
    </div>
  );
}
