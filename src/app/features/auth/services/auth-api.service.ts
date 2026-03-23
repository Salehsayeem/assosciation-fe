import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../../../core/services/api-client.service';
import { LoginRequest, LoginResponse } from '../../../core/models/auth';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('User/login', body);
  }

  logout(accessToken: string): Observable<any> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/User/logout`;
    // Send accessToken as a raw string, not a JSON object
    return this.http.post<any>(url, JSON.stringify(accessToken), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  register(body: { email: string; password: string }): Observable<any> {
    return this.api.post<any>('User/register', body);
  }
  changePassword(body: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.api.post<any>('User/change-password', body);
  }
  forgotPassword(body: { email: string }): Observable<any> {
    return this.api.post<any>('User/forgot-password', body);
  }
  resetPassword(body: { token: string; newPassword: string }): Observable<any> {
    return this.api.post<any>('User/reset-password', body);
  }
}
