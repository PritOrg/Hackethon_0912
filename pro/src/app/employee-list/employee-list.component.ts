import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeeApiService } from '../services/employee-api.service';
import { Router } from '@angular/router';
import { Employee } from '../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchControl = new FormControl('');
  
  // New Filter Controls
  statusFilter: string = 'Active'; // Default to Active
  deptFilter: string = 'all';

  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  viewMode: 'list' | 'grid' = 'list';
  
  constructor(
    private _employeeService: EmployeeApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyLocalFilters();
    });

    this.loadEmployees();
  }

  // Updated to pass filters to backend
  loadEmployees() {
    this.isLoading = true;
    
    // Prepare API filters
    const params: any = {};
    
    if (this.statusFilter === 'all') {
      params.includeInactive = true; // Backend flag to fetch all statuses
    } else {
      params.status = this.statusFilter;
    }

    if (this.deptFilter !== 'all') {
      params.department = this.deptFilter;
    }

    this._employeeService.getEmployees(params).subscribe({
      next: (response: any) => {
        console.log('📋 Raw employees response:', response);
        
        const data = response.data || response;
        this.employees = Array.isArray(data) ? data : [];
        
        console.log('✅ Loaded', this.employees.length, 'employees');
        this.applyLocalFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading employees:', error);
        this.isLoading = false;
      }
    });
  }

  // Handle status/department dropdown change
  onFilterChange() {
    this.currentPage = 1; // Reset to page 1
    this.loadEmployees(); // Re-fetch from server
  }

  applyLocalFilters() {
    const searchTerm = (this.searchControl.value || '').toLowerCase();
    
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm);
        
      return matchesSearch;
    });
  }

  // Restore functionality
  restoreEmployee(id: string) {
    if (confirm('Are you sure you want to reactivate this employee?')) {
      this._employeeService.restoreEmployee(id).subscribe({
        next: () => {
          // Remove from list if viewing "Inactive" list
          if (this.statusFilter === 'Inactive') {
            this.employees = this.employees.filter(e => e._id !== id);
            this.applyLocalFilters();
          } else {
            this.loadEmployees();
          }
        },
        error: (err) => console.error('❌ Error restoring employee:', err)
      });
    }
  }

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to archive/delete this employee?')) {
      this._employeeService.deleteEmployee(id).subscribe({
        next: () => {
          // If viewing "Active", remove immediately. Otherwise refresh.
          if (this.statusFilter === 'Active') {
            this.employees = this.employees.filter(e => e._id !== id);
            this.applyLocalFilters();
          } else {
            this.loadEmployees();
          }
        },
        error: (err) => console.error('❌ Error deleting employee:', err)
      });
    }
  }

  editEmployee(id: string) {
    this.router.navigate(['/edit-employee', id]);
  }

  addEmployee() {
    this.router.navigate(['/add-employee']);
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  get paginatedEmployees() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEmployees.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
  }
}
