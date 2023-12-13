import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { faHome, faInfo, faEnvelope, faSignInAlt, faUserGraduate, faUserTie, faLaptop, faTachometerAlt, faCalendarPlus, faHistory, faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import { fadeInOutAnimation } from '../assets/animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [fadeInOutAnimation]
})
export class AppComponent {
  title = 'project';

  showSidebarAndNavbar = true;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check the current route and decide whether to show/hide sidebar and navbar
        this.showSidebarAndNavbar = !['/sign-in', '/sign-up'].includes(router.url);
      }
    })
  };

  navItems = [
    {
      name: 'Home',
      link: '/',
      icon: faHome
    },
    // Additional Features for Logged-In User
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
      link: '/notifications',
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
    {
      name: 'Sign In',
      link: '/sign-in',
      icon: faSignInAlt
    },
  ];
}
