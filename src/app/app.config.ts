import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_BASE_URL } from './core/tokens/api-base-url.token';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill', floatLabel: 'always' },
    },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([loadingInterceptor, refreshTokenInterceptor, authInterceptor, errorInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    
    
  ]
};
