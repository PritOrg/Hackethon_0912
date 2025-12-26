import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

/**
 * Error Interceptor - Handles HTTP errors globally
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              errorMessage = 'Network error - please check your connection';
              break;
            case 400:
              errorMessage = error.error?.message || 'Bad request';
              break;
            case 401:
              errorMessage = 'Unauthorized - please login again';
              // Token refresh is handled by JWT interceptor
              break;
            case 403:
              errorMessage = 'Forbidden - you do not have permission';
              break;
            case 404:
              errorMessage = error.error?.message || 'Resource not found';
              break;
            case 422:
              errorMessage = error.error?.message || 'Validation error';
              break;
            case 500:
              errorMessage = 'Server error - please try again later';
              break;
            case 503:
              errorMessage = 'Service unavailable - please try again later';
              break;
            default:
              errorMessage = error.error?.message || `Error: ${error.status}`;
          }
        }

        // Show error notification (except for 401 which is handled by JWT interceptor)
        if (error.status !== 401) {
          this.notificationService.error(errorMessage);
        }

        // Log error for debugging
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          error: error
        });

        return throwError(() => ({
          status: 'error',
          message: errorMessage,
          statusCode: error.status,
          originalError: error
        }));
      })
    );
  }
}
