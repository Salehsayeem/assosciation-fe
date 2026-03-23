
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../shared/services/loading.service';
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP Interceptor that shows/hides the global loader for all API requests
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Show loader when request starts
  loadingService.show();

  // Hide loader when request completes (success or error)
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
