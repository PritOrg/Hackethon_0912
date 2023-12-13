
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private user: any;

  constructor(private _router: Router) {
    // Check if the user is stored in local storage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.loggedIn = true;
    }
  }

  login(user: any) {
    this.loggedIn = true;
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user.email));
  }
  
  logout() {
    this.loggedIn = false;
    this.user = null;
    sessionStorage.removeItem('user');
    this._router.navigate(['/sign-in']);
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  getUser() {
    return this.user;
  }
}
