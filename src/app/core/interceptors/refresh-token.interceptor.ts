import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { CookieService } from '../services/cookie.service';

// Silent refresh: on 401 due to expired access token, attempt refresh with stored refresh token (remember me only).
export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const baseUrl = inject(API_BASE_URL);
  const cookies = inject(CookieService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isAuthCall = /\/User\/(login|refresh-token)/i.test(req.url);

      if (isUnauthorized && !isAuthCall) {
        const accessToken = cookies.get('accessToken');
        const refreshToken = cookies.get('refreshToken');
        if (!accessToken || !refreshToken) {
          // Nothing to refresh with
          return throwError(() => error);
        }

        const url = `${baseUrl.replace(/\/$/, '')}/User/refresh-token`;
        return http.post<any>(url, { accessToken, refreshToken }).pipe(
          switchMap((res) => {
            const token = res?.data ?? res;
            const newAccess = token?.accessToken;
            const newRefresh = token?.refreshToken;
            const expiresIn = token?.expiresIn;
            const refreshTokenExpiresIn = token?.refreshTokenExpiresIn;

            if (!newAccess) {
              return throwError(() => error);
            }

            // Update cookies (remember me path, since refresh token exists)
            const accessDays = expiresIn ? expiresIn / 86400 : undefined;
            cookies.set('accessToken', newAccess, { secure: true, sameSite: 'Lax', expiresDays: accessDays });
            if (newRefresh) {
              const refreshDays = refreshTokenExpiresIn ? refreshTokenExpiresIn / 86400 : undefined;
              cookies.set('refreshToken', newRefresh, { secure: true, sameSite: 'Lax', expiresDays: refreshDays });
            }

            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } });
            return next(retried);
          }),
          catchError(() => {
            cookies.delete('accessToken');
            cookies.delete('refreshToken');
            // Redirect to login when refresh token is invalid/expired
            window.location.assign('/auth/login');
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
