import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, QueryParams } from '../models/api.model';

/**
 * Base API Service - Provides common HTTP methods with error handling
 * All feature services should extend this base service
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected apiUrl: string = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  /**
   * GET request with optional query params
   */
  protected get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET request that returns ApiResponse wrapper
   */
  protected getWithResponse<T>(endpoint: string, params?: QueryParams): Observable<ApiResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET request that returns PaginatedResponse
   */
  protected getPaginated<T>(endpoint: string, params?: QueryParams): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PaginatedResponse<T>>(`${this.apiUrl}${endpoint}`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   */
  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * POST request that returns ApiResponse wrapper
   */
  protected postWithResponse<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   */
  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PUT request that returns ApiResponse wrapper
   */
  protected putWithResponse<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PATCH request
   */
  protected patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request that returns ApiResponse wrapper
   */
  protected deleteWithResponse<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload file
   */
  protected uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Build HTTP params from QueryParams object
   */
  private buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (!params) return httpParams;

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.filters) {
      Object.keys(params.filters).forEach(key => {
        httpParams = httpParams.set(key, params.filters![key]);
      });
    }

    return httpParams;
  }

  /**
   * Central error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - please login again';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden - you do not have permission';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 500) {
      errorMessage = 'Server error - please try again later';
    }

    return throwError(() => ({
      status: 'error',
      message: errorMessage,
      statusCode: error.status,
      originalError: error
    }));
  }
}
