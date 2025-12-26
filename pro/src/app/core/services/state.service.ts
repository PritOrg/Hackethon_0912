import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth.model';
import { Notification } from '../models/notification.model';

/**
 * State Management Service - Global application state using RxJS
 * Manages shared state across components without complex state management libraries
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // User State
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Notifications State
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  // Sidebar State (for responsive layouts)
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  public sidebarOpen$: Observable<boolean> = this.sidebarOpenSubject.asObservable();

  // Theme State
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor() {
    // Load persisted state
    this.loadPersistedState();
  }

  // =============== User State Methods ===============

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserProfile(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setCurrentUser(updatedUser);
    }
  }

  // =============== Notifications State Methods ===============

  setNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount(notifications);
  }

  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.setNotifications([notification, ...current]);
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
    );
    this.setNotifications(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({
      ...n,
      isRead: true,
      readAt: new Date()
    }));
    this.setNotifications(notifications);
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n._id !== notificationId);
    this.setNotifications(notifications);
  }

  clearAllNotifications(): void {
    this.setNotifications([]);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // =============== Sidebar State Methods ===============

  toggleSidebar(): void {
    const current = this.sidebarOpenSubject.value;
    this.setSidebarOpen(!current);
  }

  setSidebarOpen(isOpen: boolean): void {
    this.sidebarOpenSubject.next(isOpen);
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }

  isSidebarOpen(): boolean {
    return this.sidebarOpenSubject.value;
  }

  // =============== Theme State Methods ===============

  toggleDarkMode(): void {
    const current = this.darkModeSubject.value;
    this.setDarkMode(!current);
  }

  setDarkMode(enabled: boolean): void {
    this.darkModeSubject.next(enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    
    // Apply theme to document
    if (enabled) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  // =============== Persistence Methods ===============

  private loadPersistedState(): void {
    // Load user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }

    // Load sidebar state
    const sidebarOpen = localStorage.getItem('sidebarOpen');
    if (sidebarOpen !== null) {
      this.sidebarOpenSubject.next(JSON.parse(sidebarOpen));
    }

    // Load dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode !== null) {
      this.setDarkMode(JSON.parse(darkMode));
    }
  }

  /**
   * Clear all state (used on logout)
   */
  clearState(): void {
    this.currentUserSubject.next(null);
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
