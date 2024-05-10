import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SignUpComponent } from './sign-up/sign-up.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { LeaveHistoryComponent } from './leave-history/leave-history.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationComponent } from './notification/notification.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CircularChartComponent } from '../componants/circular-chart/circular-chart.component';
import { AddEmployeeComponent } from './admin/add-employee/add-employee.component';
import { EmployeeComponent } from './admin/employee/employee.component';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './calendar/calendar.component';
import { ProgressIndicatorComponent } from './progress-indicator/progress-indicator.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HomeComponent,
    SignUpComponent,
    DashboardComponent,
    ApplyLeaveComponent,
    LeaveHistoryComponent,
    ProfileComponent,
    NotificationComponent,
    CircularChartComponent,
    AddEmployeeComponent,
    EmployeeComponent,
    CalendarComponent,
    ProgressIndicatorComponent,
  ],
  imports: [
    HttpClientModule,
    FullCalendarModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatProgressSpinnerModule ,
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
