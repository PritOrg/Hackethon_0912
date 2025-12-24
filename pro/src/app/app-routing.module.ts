import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CompanySignUpComponent } from './company-sign-up/company-sign-up.component';
import { LeaveRequestAdminComponent } from './leave-request-admin/leave-request-admin.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'leave-requests', component: LeaveRequestAdminComponent },
      { path: 'add-employee', component: EmployeeFormComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: 'company-sign-up', component: CompanySignUpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
