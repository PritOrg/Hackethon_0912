// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AttendanceService, Attendance } from '../services/attendance.service';

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
export class DashboardComponent implements OnInit {
  isDarkMode = false;
  isSidebarOpen = true;
  currentTime: Date = new Date();
  todayAttendance: Attendance | null = null;
  clockedIn: boolean = false;
  workingHours: string = '00:00:00';
  employeeId: string = '67bee971cccfa6b1a7d85363';
  companyId: string = '67bee6e5cb181c7311127135';

  constructor(private attendanceService: AttendanceService) {}
  navigationItems = [
    { icon: 'users', label: 'Employees' },
    { icon: 'briefcase', label: 'Projects' },
    { icon: 'calendar', label: 'Leave Management' },
    { icon: 'clock', label: 'Attendance' }
  ];

  upcomingBirthdays: Birthday[] = [
    { name: 'John Doe', date: 'Feb 15', avatar: `https://ui-avatars.com/api/+?name=`+ 'John Doe' },
    { name: 'Jane Smith', date: 'Feb 20', avatar: `https://ui-avatars.com/api/+?name=`+ 'Jane Smith' }
  ];

  recentActivity: Activity[] = [
    { type: 'leave', user: 'Mike Wilson', status: 'approved', date: '2h ago' },
    { type: 'project', user: 'Sarah Parker', status: 'assigned', date: '3h ago' }
  ];

  quickStats = {
    totalEmployees: 156,
    onLeaveToday: 8,
    activeProjects: 12
  };

  ngOnInit(): void {
    const storedAttendance = localStorage.getItem('todayAttendance');
    if (storedAttendance) {
      this.todayAttendance = JSON.parse(storedAttendance);
      this.clockedIn = true;
    }
  }
  clockIn() {
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