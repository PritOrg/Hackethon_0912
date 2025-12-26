import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * JWT Interceptor - Handles authentication token injection and refresh
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token for auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      console.log('🔓 Skipping token for auth endpoint:', request.url);
      return next.handle(request);
    }

    // Add token to request
    const token = this.getToken();
    console.log('🔐 JWT Interceptor - Token for', request.url, ':', token ? '✅ Found' : '❌ Missing');
    
    if (token) {
      request = this.addTokenToRequest(request, token);
      console.log('🔐 Authorization header added');
    } else {
      console.warn('⚠️ No token available for request:', request.url);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            const newToken = response.data.accessToken;
            this.setToken(newToken);
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addTokenToRequest(request, newToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.handleLogout();
            return throwError(() => error);
          })
        );
      } else {
        this.handleLogout();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token!));
        })
      );
    }
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/forgot-password'];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Getting token from localStorage (access_token):', token ? '✅ Exists' : '❌ Missing');
    return token;
  }

  private getRefreshToken(): string | null {
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('🔄 Getting refresh token from localStorage (refresh_token):', refreshToken ? '✅ Exists' : '❌ Missing');
    return refreshToken;
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
    console.log('💾 Token saved to localStorage (access_token)');
  }

  private handleLogout(): void {
    console.log('🚪 Logging out - clearing localStorage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/sign-in']);
  }
}
