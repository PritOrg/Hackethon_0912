import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AdminDashboardData {
  employees: {
    total: number;
    active: number;
    newHiresThisMonth: number;
    attritionRate: number;
  };
  attendance: {
    presentToday: number;
    absentToday: number;
    attendanceRate: string;
  };
  leaves: {
    pendingRequests: number;
  };
  projects: {
    total: number;
    active: number;
    totalBudget: number;
    totalSpent: number;
    remaining: number;
  };
  assets: {
    total: number;
    assigned: number;
    available: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getAdminDashboard(companyId: string): Observable<AdminDashboardData> {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<any>(`${this.apiUrl}/admin`, { params }).pipe(
      map(response => response.data)
    );
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
