import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  message: string;
  type: NotificationType;
  duration: number;
  timestamp: number;
}

/**
 * Notification Service - Displays toast messages to users
 * Provides consistent user feedback across the application
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsList: ToastMessage[] = [];
  private notificationSubject = new BehaviorSubject<ToastMessage[]>([]);
  public notifications$: Observable<ToastMessage[]> = this.notificationSubject.asObservable();

  /**
   * Show success message
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show error message
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show warning message
   */
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info message
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show generic notification with custom type
   */
  show(message: string, type: NotificationType = 'info', duration: number = 3000): void {
    const notification: ToastMessage = {
      message,
      type,
      duration,
      timestamp: Date.now()
    };
    
    this.notificationsList.push(notification);
    this.notificationSubject.next([...this.notificationsList]);
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
    
    // Also log to console for debugging
    const logMethod = type === 'error' ? console.error : type === 'warning' ? console.warn : console.log;
    logMethod(`[${type.toUpperCase()}] ${message}`);
  }
  
  /**
   * Remove a notification
   */
  removeNotification(notification: ToastMessage): void {
    const index = this.notificationsList.findIndex(n => n.timestamp === notification.timestamp);
    if (index > -1) {
      this.notificationsList.splice(index, 1);
      this.notificationSubject.next([...this.notificationsList]);
    }
  }

  /**
   * Show notification with custom duration
   */
  showWithDuration(message: string, type: NotificationType, duration: number): void {
    this.show(message, type, duration);
  }
}
