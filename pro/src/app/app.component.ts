import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, ToastMessage } from './core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pro';
  private destroy$ = new Subject<void>();
  
  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    // Auto-remove notifications after their duration
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        notifications.forEach(notification => {
          setTimeout(() => {
            this.removeNotification(notification);
          }, notification.duration);
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getToastTitle(type: string): string {
    const titles: {[key: string]: string} = {
      'success': '✓ Success',
      'error': '✕ Error',
      'warning': '⚠ Warning',
      'info': 'ℹ Info'
    };
    return titles[type] || 'Notification';
  }

  removeNotification(notification: ToastMessage): void {
    // This will be handled by the service
  }
}
