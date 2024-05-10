import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridMonth from '@fullcalendar/daygrid';
import interaction from '@fullcalendar/interaction';
import { ApiEmployeeService } from '../api-employee.service';
import Swal from 'sweetalert2';


interface EmployeeEvent {
  title: string;
  date: string;
  color: string;
  allDay?: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  employees: any = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridMonth, interaction],
    initialView: 'dayGridMonth',
    events: [],
    eventClick: this.handleEventClick.bind(this), // Ensure correct binding
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '' 
    },
    customButtons: {
      refreshButton: {
        text: 'Refresh',
        click: () => this.fetchEmployeeEvents()
      }
    },
    height: 'auto', // Set the height to auto to adjust based on content
    eventBackgroundColor: 'lightblue', // Set the background color of events
    eventBorderColor: 'white', // Set the border color of events
    eventTextColor: 'black',
    dayCellDidMount: this.handleDayCellMount.bind(this),
    firstDay: 1 ,
  };

  constructor(private employeeService: ApiEmployeeService) { }

  ngOnInit(): void {
    this.fetchEmployees();
  }

  handleEventClick(arg: any) {
    const event = arg.event;
    Swal.fire({
      title: event.title,
      text: 'Event details...',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  private fetchEmployees() {
    this.employeeService.getAllEmp().subscribe({
      next: (data) => {
        this.employees = data;
        this.fetchEmployeeEvents();
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        // Handle error and display a user-friendly message
      }
    });
  }

  private fetchEmployeeEvents() {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Iterate through each employee
      const events: EmployeeEvent[] = this.employees.flatMap((employee: { firstName: any; birthdate: any; }) => {
        const employeeBirthday = new Date(employee.birthdate);
        const employeeBirthYear = employeeBirthday.getFullYear();

        // Generate events for each year until the current year
        const employeeEvents: EmployeeEvent[] = [];
        for (let year = employeeBirthYear; year <= currentYear; year++) {
          // Clone the employee's birthday and set the year
          const birthdayInThisYear = new Date(employeeBirthday);
          birthdayInThisYear.setFullYear(year);

          // Add the event for this year
          employeeEvents.push({
            title: `${employee.firstName}'s Birthday`,
            date: birthdayInThisYear.toISOString().substr(0, 10), // Format the date as YYYY-MM-DD
            color: 'lightblue',
            allDay: true
          });
        }
        return employeeEvents;
      });

      this.calendarOptions.events = events;
    } catch (error) {
      console.error('Error fetching employee events:', error);
    }
  }
  
  private handleDayCellMount(arg: any) {
    const cellDate = new Date(arg.date);
    const dayOfWeek = cellDate.getDay();
    const today = new Date(); // Get today's date
    today.setHours(0, 0, 0, 0);

    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
      arg.el.style.backgroundColor = 'rgba(241, 115, 0, 0.31)'; // Set reddish background color for weekends
    }

    if (cellDate.toDateString() === today.toDateString()) {
      arg.el.style.backgroundColor = 'rgba(0, 115, 90, 0.31)';
      arg.el.innerHTML = 'TODAY' // Set today's date background color
    }
  }
}
