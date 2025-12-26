import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import { ApiResponse } from '../core/models/api.model';

/**
 * Dashboard API Service - Handles dashboard analytics
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApiService extends BaseApiService {
  private endpoint = '/dashboard';

  /**
   * Get admin dashboard
   */
  getAdminDashboard(): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.endpoint}/admin`);
  }

  /**
   * Get HR dashboard
   */
  getHRDashboard(): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.endpoint}/hr`);
  }

  /**
   * Get manager dashboard
   */
  getManagerDashboard(): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.endpoint}/manager`);
  }

  /**
   * Global search
   */
  globalSearch(query: string): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.endpoint}/search`, {
      search: query
    });
  }
}
