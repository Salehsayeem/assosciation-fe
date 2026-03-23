import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from '../services/cookie.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookie = inject(CookieService);
  const accessToken = cookie.get('accessToken');
  // Skip attaching for auth endpoints if needed
  const isAuthCall = /\/(auth|User)\/(login|refresh-token|register|change-password)/i.test(req.url);
  const authReq = accessToken && !isAuthCall
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;
  return next(authReq);
};
