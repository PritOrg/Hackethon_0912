import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Validation errors
            errorMessage = error.error.errors.map((e: any) => e.message).join(', ');
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }

        console.error('HTTP Error:', errorMessage);
        
        // You can show a toast/notification here
        // this.notificationService.error(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
