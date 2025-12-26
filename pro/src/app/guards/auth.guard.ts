import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('🛡️ AuthGuard checking access to:', state.url);
    
    const isAuth = this.authService.isAuthenticated();
    console.log('🛡️ isAuthenticated:', isAuth);
    
    if (isAuth) {
      // Check for role-based access if specified in route data
      const requiredRoles = route.data['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const currentUser = this.authService.getCurrentUser();
        console.log('🛡️ Role check required:', { requiredRoles, userRole: currentUser?.role });
        
        if (currentUser && requiredRoles.includes(currentUser.role)) {
          console.log('✅ Access granted - role matches');
          return true;
        } else {
          // User doesn't have required role, redirect to dashboard
          console.log('❌ Access denied - role mismatch, redirecting to /dashboard');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      console.log('✅ Access granted - authenticated');
      return true;
    }

    // Not logged in, redirect to login page with return url
    console.log('❌ Not authenticated, redirecting to login with returnUrl:', state.url);
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
