import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { faHome, faInfo, faEnvelope, faSignInAlt, faTachometerAlt, faCalendarPlus, faHistory, faUser, faBell, faSignOutAlt, faPerson } from '@fortawesome/free-solid-svg-icons';
import { fadeInOutAnimation } from '../assets/animation';
import { ApiEmployeeService } from './api-employee.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [fadeInOutAnimation]
})
export class AppComponent {
  title = 'project';
  storedUserRole = sessionStorage.getItem('userRole');
  isAdmin = this.storedUserRole && this.storedUserRole.includes('admin');

  showSidebarAndNavbar = true;

  constructor(private router: Router, private _api: ApiEmployeeService, private _auth: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check the current route and decide whether to show/hide sidebar and navbar
        this.showSidebarAndNavbar = !['/sign-in', '/sign-up'].includes(router.url);
      }
    })
  };

  isSignedIn = this._auth.isLoggedIn();

  logout() {
    this._api.logout();
  }
  getLogout() {
    return this._auth.isLoggedIn() ? {
      name: 'Sign Out',
      link: '/',
      icon: faSignOutAlt,
    } : {
      name: 'Sign In',
      link: '/sign-in',
      icon: faSignInAlt,
    }
  }
  navItemsAdmin = [
    {
      name: 'Home',
      link: '/',
      icon: faHome
    },
    {
      name:'Employees',
      link:'admin/employees',
      icon: faPerson
    },
    {
      name: 'ADD Employees',
      link: 'admin/add-employee',
      icon: faPerson
    },
    {
      name: 'Notifications',
      link: '/notification',
      icon: faBell
    },
    {
      name: 'About',
      link: '/about',
      icon: faInfo
    },
    {
      name: 'Contact',
      link: '/contact',
      icon: faEnvelope
    },
  ]
  navItems = [
    {
      name: 'Home',
      link: '/',
      icon: faHome
    },

    {
      name: 'Dashboard',
      link: '/dashboard',
      icon: faTachometerAlt
    },
    {
      name: 'Apply for Leave',
      link: '/apply-leave',
      icon: faCalendarPlus
    },
    {
      name: 'Leave History',
      link: '/leave-history',
      icon: faHistory
    },
    {
      name: 'Profile',
      link: '/profile',
      icon: faUser
    },
    {
      name: 'Notifications',
      link: '/notification',
      icon: faBell
    },
    {
      name: 'About',
      link: '/about',
      icon: faInfo
    },
    {
      name: 'Contact',
      link: '/contact',
      icon: faEnvelope
    },
  ]

}

