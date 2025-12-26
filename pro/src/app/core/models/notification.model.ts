// Notification Models
export interface Notification {
  _id: string;
  recipientId: string;
  type: 'Leave Request' | 'Attendance Alert' | 'Payroll' | 'Asset Assignment' | 'Project Update' | 'System' | 'Announcement';
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  companyId: string;
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationDto {
  recipientId: string | string[]; // Can be single or multiple recipients
  type: 'Leave Request' | 'Attendance Alert' | 'Payroll' | 'Asset Assignment' | 'Project Update' | 'System' | 'Announcement';
  title: string;
  message: string;
  priority?: 'Low' | 'Medium' | 'High';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  todayNotifications: number;
}
