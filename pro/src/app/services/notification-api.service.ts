import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from '../core/services/base-api.service';
import { StateService } from '../core/services/state.service';
import {
  Notification,
  CreateNotificationDto,
  NotificationStats
} from '../core/models/notification.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Notification API Service - Handles all notification-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationApiService extends BaseApiService {
  private endpoint = '/notifications';

  constructor(
    http: HttpClient,
    private stateService: StateService
  ) {
    super(http);
  }

  /**
   * Get my notifications
   */
  getMyNotifications(params?: QueryParams): Observable<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(`${this.endpoint}/me`, params).pipe(
      tap((response: PaginatedResponse<Notification>) => {
        if (response.data) {
          this.stateService.setNotifications(response.data);
        }
      })
    );
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(params?: QueryParams): Observable<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(`${this.endpoint}/unread`, params);
  }

  /**
   * Get notification stats
   */
  getNotificationStats(): Observable<ApiResponse<NotificationStats>> {
    return this.getWithResponse<NotificationStats>(`${this.endpoint}/stats`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<ApiResponse<Notification>> {
    return this.putWithResponse<Notification>(`${this.endpoint}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.stateService.markNotificationAsRead(notificationId);
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.putWithResponse<void>(`${this.endpoint}/read-all`, {}).pipe(
      tap(() => {
        this.stateService.markAllAsRead();
      })
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<ApiResponse<void>> {
    return this.deleteWithResponse<void>(`${this.endpoint}/${notificationId}`).pipe(
      tap(() => {
        this.stateService.removeNotification(notificationId);
      })
    );
  }

  /**
   * Create notification (admin/HR)
   */
  createNotification(data: CreateNotificationDto): Observable<ApiResponse<Notification>> {
    return this.postWithResponse<Notification>(this.endpoint, data);
  }

  /**
   * Get all notifications (admin)
   */
  getAllNotifications(params?: QueryParams): Observable<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(this.endpoint, params);
  }
}
