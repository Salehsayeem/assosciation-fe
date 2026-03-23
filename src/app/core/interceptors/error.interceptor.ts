import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { NotificationService } from '../../shared/services/notification.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';
      if (error.status === 0) {
        message = 'Network error. Please check your connection.';
      } else if (error.status === 403) {
        message = 'Forbidden: You do not have permission to perform this action.';
        // Navigate to an access-denied page for better UX
        router.navigateByUrl('/access-denied');
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        message = error.error.message;
      }
      notify.show(message);
      return throwError(() => ({ ...error, userMessage: message }));
    })
  );
};
