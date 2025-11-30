// Alert and Event Management Types

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  status: AlertStatus;
  source?: string; // Device or service that generated the alert
  affectedResource?: string; // Resource affected by the alert
  acknowledgedBy?: string; // User who acknowledged
  acknowledgedAt?: Date;
  resolvedBy?: string; // User who resolved
  resolvedAt?: Date;
  comments?: AlertComment[];
  escalated?: boolean;
  escalatedTo?: string; // Team or user escalated to
  escalatedAt?: Date;
  soundEnabled?: boolean;
}

export interface AlertComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: Date;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  active: number;
  acknowledged: number;
  resolved: number;
}

export interface AlertFilter {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  source?: string;
}

export interface AlertEvent {
  id: string;
  alertId?: string;
  type: 'alert_created' | 'alert_acknowledged' | 'alert_resolved' | 'alert_escalated' | 'comment_added';
  title: string;
  description?: string;
  severity?: AlertSeverity;
  timestamp: Date;
  user?: string;
}
