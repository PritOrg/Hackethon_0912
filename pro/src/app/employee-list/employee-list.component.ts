import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeeApiService } from '../services/employee-api.service';

interface Employee {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  position: string;
  jobShift: 'Morning' | 'Evening' | 'Night';
  profilePic?: string;
  salary: Map<string, number>;
  joiningDate: Date;
}

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
  
  constructor(private _employeeService: EmployeeApiService) {}

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
      (employees: Employee[]): void => {
      this.employees = employees;
      this.filteredEmployees = [...this.employees];
      this.isLoading = false;
      },
      (error: any): void => {
      console.error('Error loading employees:', error);
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
      this.employees = this.employees.filter(emp => emp._id !== id);
      this.filteredEmployees = this.filteredEmployees.filter(emp => emp._id !== id);
    }
  }

  editEmployee(id: string) {
    console.log('Edit employee:', id);
  }

  addEmployee() {
    console.log('Add new employee');
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
