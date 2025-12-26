import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminDashboardData {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  attritionRate: string;
  todayAttendance: number;
  absentToday: number;
  pendingLeaveRequests: number;
  totalProjects: number;
  activeProjects: number;
  budgetData: {
    totalBudget: number;
    totalSpent: number;
  };
  totalAssets: number;
  assignedAssets: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getAdminDashboard(companyId: string): Observable<AdminDashboardData> {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/admin`, { params });
  }

  getHRDashboard(companyId: string): Observable<any> {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<any>(`${this.apiUrl}/hr`, { params });
  }

  getManagerDashboard(companyId: string): Observable<any> {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<any>(`${this.apiUrl}/manager`, { params });
  }
}
