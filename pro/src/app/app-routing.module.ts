import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CompanySignUpComponent } from './company-sign-up/company-sign-up.component';
import { LeaveRequestAdminComponent } from './leave-request-admin/leave-request-admin.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { AuthGuard } from './guards/auth.guard';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // App routes (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) 
      },
      // Keep existing routes for now, but they should eventually be moved to feature modules
      { path: 'employees', component: EmployeeListComponent },
      { path: 'leave-requests', component: LeaveRequestAdminComponent },
      { path: 'add-employee', component: EmployeeFormComponent },
      { path: 'edit-employee/:id', component: EmployeeFormComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Legacy company sign-up (redirect to new register)
  { 
    path: 'company-sign-up', 
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },

  // Wildcard route (404)
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
