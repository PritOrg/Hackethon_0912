import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor - Shows/hides loading indicator for HTTP requests
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private excludedUrls: string[] = [
    '/auth/refresh-token',
    '/notifications'
  ];

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip loading indicator for certain endpoints
    if (this.shouldSkipLoading(request.url)) {
      return next.handle(request);
    }

    // Show loading
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        // Hide loading when request completes (success or error)
        this.loadingService.hide();
      })
    );
  }

  private shouldSkipLoading(url: string): boolean {
    return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
  }
}
