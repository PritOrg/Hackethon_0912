import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  newHiresThisMonth: number;
  departmentCount: number;
  activeProjects?: number;
  pendingLeaveRequests?: number;
  pendingAttendance?: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  recentActivities?: any[];
  upcomingBirthdays?: any[];
  leaveRequests?: any[];
  attendanceToday?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get admin dashboard data
   */
  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.API_URL}/dashboard/admin`);
  }

  /**
   * Get HR dashboard data
   */
  getHRDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/dashboard/hr`);
  }

  /**
   * Get manager dashboard data
   */
  getManagerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/dashboard/manager`);
  }

  /**
   * Global search
   */
  globalSearch(query: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/dashboard/search`, {
      params: { q: query }
    });
  }
}
