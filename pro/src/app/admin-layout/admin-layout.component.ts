import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  isDarkMode = false;
  isSidebarOpen = true;
  constructor(public router: Router) {}
  navigationItems = [
    { label: 'Dashboard', icon: 'tachometer-alt', route: '/admin/dashboard' },
    { label: 'Employees', icon: 'users', route: '/admin/employees' },
    { label: 'Leave Management', icon: 'calendar-alt', route: '/admin/leave-requests' },
    { label: 'Projects', icon: 'project-diagram', route: '/admin/projects' },
    { label: 'Reports', icon: 'chart-bar', route: '/admin/reports' },
    { label: 'Settings', icon: 'cog', route: '/admin/settings' }
  ];
  getCurrentPageTitle(): string {
    const currentRoute = this.router.url as string;
    const routeMap: { [key: string]: string } = {
      '/admin/dashboard': 'Dashboard',
      '/admin/employees': 'Employee Management',
      '/admin/leave-requests': 'Leave Management',
      '/admin/projects': 'Projects',
      '/admin/reports': 'Reports',
      '/admin/settings': 'Settings'
    };
    return routeMap[currentRoute] || 'Dashboard';
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    // Add logic to persist theme preference
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
