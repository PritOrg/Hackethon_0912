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
    ).subscribe(value => {
      this.filterEmployees(value || '');
    });

    // Load initial data
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this._employeeService.getEmployees().subscribe(
      (response: any): void => {
        console.log('📋 Raw employees response:', response);
        
        // Backend wraps response in { success, data, message }
        // Extract the actual array from response.data
        const employeesData = response.data || response;
        
        console.log('📋 Extracted employees data:', employeesData);
        console.log('📋 Is array?', Array.isArray(employeesData));
        
        if (Array.isArray(employeesData)) {
          this.employees = employeesData as Employee[];
          this.filteredEmployees = [...this.employees];
          console.log('✅ Loaded', this.employees.length, 'employees');
        } else {
          console.error('❌ Response is not an array:', employeesData);
          this.employees = [];
          this.filteredEmployees = [];
        }
        
        this.isLoading = false;
      },
      (error): void => {
        console.error('❌ Error loading employees:', error);
        this.employees = [];
        this.filteredEmployees = [];
        this.isLoading = false;
      }
    );
  }

  filterEmployees(searchTerm: string) {
    this.filteredEmployees = this.employees.filter(employee => 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  } 

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this._employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp._id !== id);
          this.filteredEmployees = this.filteredEmployees.filter(emp => emp._id !== id);
        },
        error: (err) => console.error('Error deleting employee:', err)
      });
    }
  }

  editEmployee(id: string) {
    this.router.navigate(['/edit-employee', id]);
  }

  addEmployee() {
    this.router.navigate(['/add-employee']);
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
