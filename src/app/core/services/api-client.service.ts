import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(url: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.get<T>(this.resolve(url), { headers: options?.headers });
  }
  post<T>(url: string, body: unknown, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.post<T>(this.resolve(url), this.sanitize(body), { headers: options?.headers });
  }
  put<T>(url: string, body: unknown, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.put<T>(this.resolve(url), this.sanitize(body), { headers: options?.headers });
  }
  delete<T>(url: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.delete<T>(this.resolve(url), { headers: options?.headers });
  }

  private resolve(url: string): string {
    return url.startsWith('http') ? url : `${this.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }
  private sanitize<T>(payload: T): T {
    if (payload && typeof payload === 'object') {
      const clone: any = Array.isArray(payload) ? [...(payload as any)] : { ...(payload as any) };
      for (const key of Object.keys(clone)) {
        const val = clone[key];
        if (typeof val === 'string') clone[key] = val.trim();
      }
      return clone as T;
    }
    return payload;
  }
}
