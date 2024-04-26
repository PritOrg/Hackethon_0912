import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const storedUserRole = sessionStorage.getItem('userRole');
    const isAdmin = storedUserRole && storedUserRole.includes('admin');
    if (this.authService.isLoggedIn() && isAdmin) {
      console.log('Access granted.');
      return true;
    } else {
      this.authService.logout();
      window.alert('You are not authorized to access this page. Please log in as an admin.');
      this.router.navigate(['/sign-in']);
      return false;
    }
  }
}
