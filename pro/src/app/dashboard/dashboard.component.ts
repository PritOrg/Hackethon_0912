// dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AttendanceService, Attendance } from '../services/attendance.service';
import { DashboardService, DashboardStats } from '../core/services/dashboard.service';
import { AuthService } from '../core/services/auth.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Birthday {
  name: string;
  date: string;
  avatar: string;
}

interface Activity {
  type: 'leave' | 'project';
  user: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isDarkMode = false;
  isSidebarOpen = true;
  currentTime: Date = new Date();
  todayAttendance: Attendance | null = null;
  clockedIn: boolean = false;
  workingHours: string = '00:00:00';
  employeeId: string = '';
  companyId: string = '';
  loading = true;
  error: string | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}
  
  navigationItems = [
    { icon: 'users', label: 'Employees' },
    { icon: 'briefcase', label: 'Projects' },
    { icon: 'calendar', label: 'Leave Management' },
    { icon: 'clock', label: 'Attendance' }
  ];

  upcomingBirthdays: Birthday[] = [];
  recentActivity: Activity[] = [];

  quickStats: DashboardStats = {
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveToday: 0,
    newHiresThisMonth: 0,
    departmentCount: 0,
    activeProjects: 0,
    pendingLeaveRequests: 0
  };

  ngOnInit(): void {
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.employeeId = currentUser._id;
      this.companyId = currentUser.companyId || '';
    }

    // Load dashboard data
    this.loadDashboardData();

    // Check stored attendance
    const storedAttendance = localStorage.getItem('todayAttendance');
    if (storedAttendance) {
      this.todayAttendance = JSON.parse(storedAttendance);
      this.clockedIn = true;
    }

    // Update time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
        this.updateWorkingHours();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getAdminDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Dashboard data:', response);
          const data = response.data || response;
          
          // Update stats
          if (data.stats) {
            this.quickStats = {
              totalEmployees: data.stats.totalEmployees || 0,
              activeEmployees: data.stats.activeEmployees || 0,
              onLeaveToday: data.stats.onLeaveToday || 0,
              newHiresThisMonth: data.stats.newHiresThisMonth || 0,
              departmentCount: data.stats.departmentCount || 0,
              activeProjects: data.stats.activeProjects || 0,
              pendingLeaveRequests: data.stats.pendingLeaveRequests || 0
            };
          }

          // Update birthdays if available
          if (data.upcomingBirthdays && Array.isArray(data.upcomingBirthdays)) {
            this.upcomingBirthdays = data.upcomingBirthdays.map((b: any) => ({
              name: `${b.firstName} ${b.lastName}`,
              date: new Date(b.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              avatar: `https://ui-avatars.com/api/?name=${b.firstName}+${b.lastName}`
            }));
          }

          // Update recent activity if available
          if (data.recentActivities && Array.isArray(data.recentActivities)) {
            this.recentActivity = data.recentActivities;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load dashboard data:', err);
          this.error = 'Failed to load dashboard data. Using default values.';
          this.loading = false;
          // Keep default/mock data
        }
      });
  }
  clockIn() {
    if (!this.employeeId || !this.companyId) {
      console.error('Employee ID or Company ID missing');
      return;
    }

    this.attendanceService.clockIn(this.employeeId, this.companyId).subscribe({
      next: (response) => {
        this.todayAttendance = response;
        this.clockedIn = true;
        localStorage.setItem('todayAttendance', JSON.stringify(response));
      },
      error: (error) => console.error('Clock-in failed:', error)
    });
  }

  clockOut() {
    if (!this.employeeId) {
      console.error('Employee ID missing');
      return;
    }

    this.attendanceService.clockOut(this.employeeId).subscribe({
      next: (response) => {
        this.todayAttendance = response;
        this.clockedIn = false;
        localStorage.removeItem('todayAttendance');
      },
      error: (error) => console.error('Clock-out failed:', error)
    });
  }

  private updateWorkingHours() {
    if (this.todayAttendance && this.clockedIn) {
      const start = new Date(this.todayAttendance.clockIn).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.workingHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}