import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.css'],
})
export class ApplyLeaveComponent {
  leaveRequestForm!: FormGroup;
  leaveTypes = ['Sick Leave', 'Vacation Leave', 'Personal Leave', 'Other'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.leaveRequestForm = this.fb.group({
      userId: ['',],
      startDate: [this.getCurrentDate(), Validators.required],
      endDate: [this.getCurrentDate(), Validators.required],
      status: ['pending',],
      reason: ['', Validators.required],
      createdAt: [this.getCurrentDateTime(), Validators.required],
      leaveType: ['Sick Leave', Validators.required],
    });
  }

  validateDateRange(group: FormGroup) {
    const startDate = group.get('startDate')!.value;
    const endDate = group.get('endDate')!.value;
  
    if (startDate && endDate && startDate > endDate) {
      return { invalidDateRange: true }; // Invalid date range error
    }
  
    return null; // Allow other validation checks to proceed
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentDateTime(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  onSubmit() {
    // Handle form submission (e.g., send data to server)
    console.log(this.leaveRequestForm.value);
  }
}
