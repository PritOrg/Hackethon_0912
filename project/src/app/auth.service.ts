
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAdmin = false;
  private loggedIn = false;
  private user: any;

  constructor(private _router: Router) {
    const storedUser = sessionStorage.getItem('user');
    const role = sessionStorage.getItem('userRole');
    if (storedUser && role) {
      this.user = JSON.parse(storedUser);
      this.loggedIn = true;
      this.isAdmin = (role === 'admin');
    }
  }

  login(user: any) {
    this.loggedIn = true;
    this.user = user;
    this.isAdmin = (this.user.role === 'admin');
    sessionStorage.setItem('user', JSON.stringify(user.email));
    sessionStorage.setItem('userRole', JSON.stringify(user.role));
      if(this.isAdmin)
      this._router.navigate(['/admin']); 
    else
      this._router.navigate(['/']);
  }
  
  logout() {
    this.loggedIn = false;
    this.user = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    this._router.navigate(['/sign-in']);
  }

  isLoggedIn() {
    return this.loggedIn;
  }
  isAdminUser(): boolean {
    return this.isAdmin;
  }
  getUser() {
    return this.user;
  }
}
