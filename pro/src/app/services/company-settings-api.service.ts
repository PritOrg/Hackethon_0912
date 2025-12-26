import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  Company,
  UpdateCompanySettingsDto,
  UpgradeSubscriptionDto
} from '../core/models/company.model';
import { ApiResponse } from '../core/models/api.model';

/**
 * Company Settings API Service - Handles company settings and billing
 */
@Injectable({
  providedIn: 'root'
})
export class CompanySettingsApiService extends BaseApiService {
  private endpoint = '/company-settings';

  /**
   * Get company settings
   */
  getCompanySettings(): Observable<ApiResponse<Company>> {
    return this.getWithResponse<Company>(this.endpoint);
  }

  /**
   * Update company settings
   */
  updateCompanySettings(data: UpdateCompanySettingsDto): Observable<ApiResponse<Company>> {
    return this.putWithResponse<Company>(this.endpoint, data);
  }

  /**
   * Get billing information
   */
  getBillingInfo(): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.endpoint}/billing`);
  }

  /**
   * Upgrade subscription
   */
  upgradeSubscription(data: UpgradeSubscriptionDto): Observable<ApiResponse<Company>> {
    return this.postWithResponse<Company>(`${this.endpoint}/upgrade-subscription`, data);
  }

  /**
   * Get audit logs
   */
  getAuditLogs(params?: any): Observable<ApiResponse<any[]>> {
    return this.getWithResponse<any[]>(`${this.endpoint}/audit-logs`, params);
  }
}
