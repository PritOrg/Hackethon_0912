import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService, AdminDashboardData } from '../services/dashboard.service';
import { switchMap, filter, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  currentUser$;
  currentDate = new Date();
  isLoading = true;

  stats = [
    { label: 'Total Employees', value: '0', icon: 'fa-users', color: 'bg-blue-500', trend: '0%' },
    { label: 'Present Today', value: '0', icon: 'fa-user-check', color: 'bg-green-500', trend: '0%' },
    { label: 'On Leave', value: '0', icon: 'fa-plane-departure', color: 'bg-orange-500', trend: '0%' },
    { label: 'Projects', value: '0', icon: 'fa-project-diagram', color: 'bg-purple-500', trend: 'Active' },
  ];

  recentActivities = [
    { user: 'Sarah Smith', action: 'requested leave', time: '2 hours ago', avatar: 'S' },
    { user: 'John Doe', action: 'completed task "API Integration"', time: '4 hours ago', avatar: 'J' },
    { user: 'Mike Ross', action: 'clocked in late', time: '5 hours ago', avatar: 'M' },
    { user: 'Emily Blunt', action: 'updated profile', time: '1 day ago', avatar: 'E' },
  ];

  pendingRequests = [
    { type: 'Leave', user: 'Alex Johnson', details: 'Sick Leave (2 days)', status: 'Pending' },
    { type: 'Expense', user: 'Maria Garcia', details: 'Travel Reimbursement', status: 'Pending' },
    { type: 'Shift Swap', user: 'David Kim', details: 'Night Shift -> Day Shift', status: 'Pending' },
  ];

  constructor(private authService: AuthService, private dashboardService: DashboardService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  }
  loadDashboardData() {
    this.currentUser$
      .pipe(
        filter(user => !!user && !!user.companyId),
        switchMap(user => {
          console.log('📊 Dashboard - Current user:', user);
          console.log('📊 Dashboard - Raw companyId:', user!.companyId, 'Type:', typeof user!.companyId);
          
          // Extract companyId string (handle both object with _id and direct string)
          let companyId: string;
          if (typeof user!.companyId === 'object' && user!.companyId !== null) {
            companyId = (user!.companyId as any)._id || (user!.companyId as any).id || '';
            console.log('📊 Dashboard - Extracted companyId from object:', companyId);
          } else {
            companyId = String(user!.companyId);
            console.log('📊 Dashboard - Using companyId as string:', companyId);
          }
          
          console.log('📊 Dashboard - Final companyId:', companyId);
          
          // Assuming Admin role for now, logic can be expanded for other roles
          return this.dashboardService.getAdminDashboard(companyId);
        })
      )
      .subscribe({
        next: (data: AdminDashboardData) => {
          console.log('✅ Dashboard data loaded successfully:', data);
          this.updateStats(data);
          this.isLoading = false;
        },
        error: err => {
          console.error('❌ Failed to load dashboard data', err);
          this.isLoading = false;
        },
      });
  }

  updateStats(data: AdminDashboardData) {
    this.stats = [
      {
        label: 'Total Employees',
        value: data.employees.total.toString(),
        icon: 'fa-users',
        color: 'bg-blue-500',
        trend: `+${data.employees.newHiresThisMonth} new`,
      },
      {
        label: 'Present Today',
        value: data.attendance.presentToday.toString(),
        icon: 'fa-user-check',
        color: 'bg-green-500',
        trend: `${data.attendance.attendanceRate}%`,
      },
      {
        label: 'On Leave',
        value: data.attendance.absentToday.toString(),
        icon: 'fa-plane-departure',
        color: 'bg-orange-500',
        trend: `${data.leaves.pendingRequests} pending`,
      },
      {
        label: 'Projects',
        value: data.projects.active.toString(),
        icon: 'fa-project-diagram',
        color: 'bg-purple-500',
        trend: 'Active',
      },
    ];
  }
}
