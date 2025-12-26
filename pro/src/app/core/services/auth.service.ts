import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';

import {
  User,
  LoginCredentials,
  AuthResponse,
  RegisterCompanyDto,
  TwoFactorSetupResponse,
  RefreshTokenResponse
} from '../models/auth.model';
import { StateService } from './state.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private stateService: StateService
  ) {}

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('🔐 Login attempt:', { email: credentials.email });
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        console.log('🔐 Raw login response (FULL):', JSON.stringify(response, null, 2));
        console.log('🔐 Response keys:', Object.keys(response));
        console.log('🔐 response.data keys:', response.data ? Object.keys(response.data) : 'No data property');
        console.log('🔐 Checking for 2FA...');
        
        if (!response.requires2FA && !(response as any).data?.requires2FA) {
          console.log('✅ No 2FA required, handling auth response...');
          this.handleAuthResponse(response);
        } else {
          console.log('⚠️ 2FA required, skipping auth handling');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register a new company with admin user
   */
  registerCompany(data: RegisterCompanyDto): Observable<AuthResponse> {
    console.log('Sending registration request:', data);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register-company`, data).pipe(
      tap(response => {
        console.log('Registration response received:', response);
        this.handleAuthResponse(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verify 2FA code
   */
  verify2FA(email: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/verify-2fa`, { email, code }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Resend 2FA code
   */
  resend2FA(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/resend-2fa`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Setup 2FA for current user
   */
  setup2FA(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(`${this.API_URL}/auth/setup-2fa`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Disable 2FA for current user
   */
  disable2FA(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/disable-2fa`, { password }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, email: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/reset-password`, {
      token,
      email,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/auth/refresh-token`, {
      refreshToken
    }).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    // Call logout endpoint (optional - backend cleanup)
    this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    // Clear local storage
    this.clearAuthData();

    // Update state
    this.currentUserSubject.next(null);
    this.stateService.setCurrentUser(null);

    // Navigate to login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    console.log('🔒 isAuthenticated check:', { hasToken: !!token });
    
    if (!token) {
      console.log('❌ No token found');
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;
      console.log('🔒 Token validity:', { 
        expires: new Date(payload.exp * 1000).toISOString(),
        isValid 
      });
      return isValid;
    } catch (error) {
      console.error('❌ Token decode error:', error);
      return false;
    }
  }

  /**
   * Get current user from state
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    console.log('=== handleAuthResponse START ===');
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    // Backend wraps response in { success, message, data: {...} }
    const responseData = response.data || response;
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    // Handle tokens - check both direct and wrapped
    const accessToken = response.accessToken || responseData.accessToken;
    const refreshToken = response.refreshToken || responseData.refreshToken;
    
    console.log('Extracted tokens:', { 
      accessToken: accessToken ? '✅ Found' : '❌ Missing',
      refreshToken: refreshToken ? '✅ Found' : '❌ Missing'
    });
    
    if (accessToken) {
      this.setAccessToken(accessToken);
      console.log('✅ Access token saved to localStorage');
    } else {
      console.error('❌ No access token in response!');
    }
    
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
      console.log('✅ Refresh token saved to localStorage');
    } else {
      console.error('❌ No refresh token in response!');
    }
    
    // Handle user data - could be 'user' (login) or 'employee' (registration)
    const userData = response.user || response.employee || 
                     responseData.user || responseData.employee;
    
    console.log('User data found:', userData ? '✅ Yes' : '❌ No');
    
    if (userData) {
      // Transform employee data to user format if needed
      const user: User = {
        _id: userData._id || userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
        companyId: userData.companyId,
        profilePicture: userData.profilePic || userData.profilePicture,
        phoneNumber: userData.phoneNumber,
        twoFactorEnabled: userData.twoFactorEnabled || false
      };
      
      console.log('✅ User object created:', user);
      this.setUser(user);
      this.currentUserSubject.next(user);
      this.stateService.setCurrentUser(user);
      console.log('✅ User saved to localStorage and state');
    } else {
      console.error('❌ No user/employee data in response!');
    }
    
    // Verify localStorage
    console.log('LocalStorage verification:');
    console.log('  - access_token:', localStorage.getItem(this.TOKEN_KEY) ? '✅ Exists' : '❌ Missing');
    console.log('  - refresh_token:', localStorage.getItem(this.REFRESH_TOKEN_KEY) ? '✅ Exists' : '❌ Missing');
    console.log('  - current_user:', localStorage.getItem(this.USER_KEY) ? '✅ Exists' : '❌ Missing');
    console.log('=== handleAuthResponse END ===\n');
  }

  /**
   * Save user to local storage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from local storage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Auth service error:', error);
    return throwError(() => error);
  }
}
