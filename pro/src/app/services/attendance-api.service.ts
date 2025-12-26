import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  Attendance,
  CheckInDto,
  CheckOutDto,
  AttendanceStats,
  AttendanceReport
} from '../core/models/attendance.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Attendance API Service - Handles all attendance-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AttendanceApiService extends BaseApiService {
  private endpoint = '/attendance';

  /**
   * Check in
   */
  checkIn(data: CheckInDto): Observable<ApiResponse<Attendance>> {
    return this.postWithResponse<Attendance>(`${this.endpoint}/check-in`, data);
  }

  /**
   * Check out
   */
  checkOut(data: CheckOutDto): Observable<ApiResponse<Attendance>> {
    return this.postWithResponse<Attendance>(`${this.endpoint}/check-out`, data);
  }

  /**
   * Get my attendance records
   */
  getMyAttendance(params?: QueryParams): Observable<PaginatedResponse<Attendance>> {
    return this.getPaginated<Attendance>(`${this.endpoint}/me`, params);
  }

  /**
   * Get employee attendance by ID
   */
  getEmployeeAttendance(employeeId: string, params?: QueryParams): Observable<PaginatedResponse<Attendance>> {
    return this.getPaginated<Attendance>(`${this.endpoint}/${employeeId}`, params);
  }

  /**
   * Get today's attendance
   */
  getTodayAttendance(): Observable<ApiResponse<Attendance>> {
    return this.getWithResponse<Attendance>(`${this.endpoint}/today`);
  }

  /**
   * Get attendance statistics
   */
  getMyAttendanceStats(startDate?: Date, endDate?: Date): Observable<ApiResponse<AttendanceStats>> {
    const params: QueryParams = {};
    if (startDate) params.filters = { ...params.filters, startDate: startDate.toISOString() };
    if (endDate) params.filters = { ...params.filters, endDate: endDate.toISOString() };
    
    return this.getWithResponse<AttendanceStats>(`${this.endpoint}/stats/me`, params);
  }

  /**
   * Get employee attendance statistics
   */
  getEmployeeAttendanceStats(
    employeeId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<ApiResponse<AttendanceStats>> {
    const params: QueryParams = {};
    if (startDate) params.filters = { ...params.filters, startDate: startDate.toISOString() };
    if (endDate) params.filters = { ...params.filters, endDate: endDate.toISOString() };
    
    return this.getWithResponse<AttendanceStats>(`${this.endpoint}/stats/${employeeId}`, params);
  }

  /**
   * Get attendance report
   */
  getAttendanceReport(
    month: number,
    year: number,
    employeeId?: string
  ): Observable<ApiResponse<AttendanceReport>> {
    const endpoint = employeeId 
      ? `${this.endpoint}/report/${employeeId}` 
      : `${this.endpoint}/report/me`;
    
    return this.getWithResponse<AttendanceReport>(endpoint, {
      filters: { month, year }
    });
  }

  /**
   * Get all attendance records (admin/HR)
   */
  getAllAttendance(params?: QueryParams): Observable<PaginatedResponse<Attendance>> {
    return this.getPaginated<Attendance>(this.endpoint, params);
  }

  /**
   * Manually add attendance record (admin/HR)
   */
  addAttendanceRecord(data: any): Observable<ApiResponse<Attendance>> {
    return this.postWithResponse<Attendance>(this.endpoint, data);
  }

  /**
   * Update attendance record (admin/HR)
   */
  updateAttendanceRecord(id: string, data: any): Observable<ApiResponse<Attendance>> {
    return this.putWithResponse<Attendance>(`${this.endpoint}/${id}`, data);
  }
}
