import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Loading Service - Manages global loading states
 * Used by HTTP interceptor and can be manually controlled
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();
  
  private activeRequests = 0;

  /**
   * Show loading indicator
   */
  show(message?: string): void {
    this.activeRequests++;
    this.loadingSubject.next({ isLoading: true, message });
  }

  /**
   * Hide loading indicator
   */
  hide(): void {
    this.activeRequests--;
    
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.loadingSubject.next({ isLoading: false });
    }
  }

  /**
   * Force hide loading (reset all requests)
   */
  forceHide(): void {
    this.activeRequests = 0;
    this.loadingSubject.next({ isLoading: false });
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  /**
   * Get active requests count
   */
  get requestCount(): number {
    return this.activeRequests;
  }
}
