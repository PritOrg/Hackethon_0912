import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobile = false;
  @Output() closeMenu = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-home', route: '/dashboard' },
    { label: 'Employees', icon: 'fa-solid fa-users', route: '/employees' },
    { label: 'Attendance', icon: 'fa-solid fa-clock', route: '/attendance' },
    { label: 'Leave', icon: 'fa-solid fa-calendar-alt', route: '/leave' },
    { label: 'Projects', icon: 'fa-solid fa-project-diagram', route: '/projects' },
    { label: 'Payroll', icon: 'fa-solid fa-money-bill-wave', route: '/payroll' },
    { label: 'Settings', icon: 'fa-solid fa-cog', route: '/settings' }
  ];

  onLinkClick() {
    if (this.isMobile) {
      this.closeMenu.emit();
    }
  }
}
