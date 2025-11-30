'use client';

import { useState, useMemo } from 'react';
import { Alert, AlertEvent, AlertSeverity, AlertStatus, AlertComment } from '@/types/alert';
import { AlertCounterCard } from '@/components/monitoring/AlertCounterCard';
import { EventTimeline } from '@/components/monitoring/EventTimeline';
import { AlertsTable } from '@/components/monitoring/AlertsTable';
import { AlertDetailModal } from '@/components/monitoring/AlertDetailModal';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/common';

// Mock Data
const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: '디바이스 SW001 연결 끊김',
    description: '스위치 SW001이 네트워크에서 응답하지 않습니다. 즉시 확인이 필요합니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    status: 'active',
    source: 'SW001',
    affectedResource: '네트워크 스위치',
    soundEnabled: true,
  },
  {
    id: '2',
    severity: 'warning',
    title: 'CPU 사용률 높음',
    description: '라우터 R002의 CPU 사용률이 85%를 초과했습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    status: 'acknowledged',
    source: 'R002',
    affectedResource: '라우터',
    acknowledgedBy: '관리자',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30),
    soundEnabled: false,
  },
  {
    id: '3',
    severity: 'info',
    title: '펌웨어 업데이트 가능',
    description: '디바이스 SW003에 새로운 펌웨어 버전이 출시되었습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    status: 'active',
    source: 'SW003',
    soundEnabled: false,
  },
  {
    id: '4',
    severity: 'critical',
    title: '네트워크 포트 오류',
    description: '스위치 SW002의 포트 5에서 반복적인 오류가 감지되었습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    status: 'active',
    source: 'SW002',
    affectedResource: 'Port 5',
    escalated: true,
    escalatedTo: '네트워크 팀장',
    escalatedAt: new Date(Date.now() - 1000 * 60 * 150),
    soundEnabled: true,
    comments: [
      {
        id: 'c1',
        userId: 'user1',
        userName: '김관리자',
        comment: '문제 확인 중입니다. 하드웨어 점검이 필요할 수 있습니다.',
        timestamp: new Date(Date.now() - 1000 * 60 * 160),
      },
    ],
  },
  {
    id: '5',
    severity: 'warning',
    title: '트래픽 임계값 초과',
    description: '링크 L001에서 트래픽이 설정된 임계값의 90%를 초과했습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    status: 'active',
    source: 'L001',
    soundEnabled: false,
  },
];

const mockEvents: AlertEvent[] = [
  {
    id: 'e1',
    alertId: '1',
    type: 'alert_created',
    title: '디바이스 SW001 연결 끊김',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'e2',
    alertId: '2',
    type: 'alert_acknowledged',
    title: 'CPU 사용률 높음 경고 확인됨',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: '관리자',
  },
  {
    id: 'e3',
    alertId: '2',
    type: 'alert_created',
    title: 'CPU 사용률 높음',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'e4',
    alertId: '4',
    type: 'comment_added',
    title: '네트워크 포트 오류에 코멘트 추가',
    timestamp: new Date(Date.now() - 1000 * 60 * 160),
    user: '김관리자',
  },
  {
    id: 'e5',
    alertId: '4',
    type: 'alert_escalated',
    title: '네트워크 포트 오류 에스컬레이션',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
    user: '시스템',
  },
  {
    id: 'e6',
    alertId: '4',
    type: 'alert_created',
    title: '네트워크 포트 오류',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [events] = useState<AlertEvent[]>(mockEvents);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity[]>([]);
  const [statusFilter, setStatusFilter] = useState<AlertStatus[]>([]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
      active: alerts.filter((a) => a.status === 'active').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
    };
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search filter
      if (
        searchQuery &&
        !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Severity filter
      if (severityFilter.length > 0 && !severityFilter.includes(alert.severity)) {
        return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(alert.status)) {
        return false;
      }

      return true;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged' as AlertStatus,
              acknowledgedBy: '현재 사용자',
              acknowledgedAt: new Date(),
            }
          : alert
      )
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'resolved' as AlertStatus,
              resolvedBy: '현재 사용자',
              resolvedAt: new Date(),
            }
          : alert
      )
    );
  };

  const handleMute = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              soundEnabled: !alert.soundEnabled,
            }
          : alert
      )
    );
  };

  const handleEscalate = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              escalated: true,
              escalatedTo: '네트워크 관리자',
              escalatedAt: new Date(),
            }
          : alert
      )
    );
  };

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleAddComment = (alertId: string, comment: string) => {
    const newComment: AlertComment = {
      id: `c${Date.now()}`,
      userId: 'current-user',
      userName: '현재 사용자',
      comment,
      timestamp: new Date(),
    };

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              comments: [...(alert.comments || []), newComment],
            }
          : alert
      )
    );

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({
        ...selectedAlert,
        comments: [...(selectedAlert.comments || []), newComment],
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSeverityFilter([]);
    setStatusFilter([]);
  };

  const hasActiveFilters = searchQuery || severityFilter.length > 0 || statusFilter.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">경고 및 이벤트 관리</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          시스템 경고를 모니터링하고 관리합니다
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AlertCounterCard severity="critical" count={stats.critical} />
        <AlertCounterCard severity="warning" count={stats.warning} />
        <AlertCounterCard severity="info" count={stats.info} />
        <AlertCounterCard severity="all" count={stats.total} />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="경고 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex gap-2">
            {(['critical', 'warning', 'info'] as AlertSeverity[]).map((severity) => (
              <button
                key={severity}
                onClick={() => {
                  setSeverityFilter((prev) =>
                    prev.includes(severity)
                      ? prev.filter((s) => s !== severity)
                      : [...prev, severity]
                  );
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  severityFilter.includes(severity)
                    ? severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : severity === 'warning'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {severity === 'critical' ? '위험' : severity === 'warning' ? '경고' : '정보'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['active', 'acknowledged', 'resolved'] as AlertStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter((prev) =>
                    prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
                  );
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter.includes(status)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'active' ? '활성' : status === 'acknowledged' ? '확인됨' : '해결됨'}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="secondary"
              size="sm"
              leftIcon={<X size={18} />}
            >
              필터 초기화
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            미해결 경고 ({filteredAlerts.length})
          </h2>
          <AlertsTable
            alerts={filteredAlerts}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onViewDetails={handleViewDetails}
            onMute={handleMute}
            onEscalate={handleEscalate}
          />
        </div>

        {/* Event Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            최근 24시간 이벤트
          </h2>
          <EventTimeline events={events} />
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAlert(null);
        }}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
