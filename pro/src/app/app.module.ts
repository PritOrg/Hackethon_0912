import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CompanySignUpComponent } from './company-sign-up/company-sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LeaveRequestAdminComponent } from './leave-request-admin/leave-request-admin.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EmployeeListComponent,
    AdminLayoutComponent,
    CompanySignUpComponent,
    SignInComponent,
    LeaveRequestAdminComponent,
    EmployeeFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
