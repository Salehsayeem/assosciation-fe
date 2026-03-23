import { Injectable } from '@angular/core';

export interface CookieOptions { path?: string; domain?: string; secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None'; expiresDays?: number }

@Injectable({ providedIn: 'root' })
export class CookieService {
  set(name: string, value: string, opts?: CookieOptions): void {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookie += `; path=${opts?.path ?? '/'}`;
    if (opts?.domain) cookie += `; domain=${opts.domain}`;
    
    if (opts?.secure && window.location.protocol === 'https:') {
      cookie += '; Secure';
    }
    
    if (opts?.sameSite) cookie += `; SameSite=${opts.sameSite}`;
    
    if (opts?.expiresDays && opts.expiresDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + opts.expiresDays);
      cookie += `; Expires=${d.toUTCString()}`;
    } else if (opts?.expiresDays && opts.expiresDays < 0) {
      // Delete cookie
      const d = new Date(0);
      cookie += `; Expires=${d.toUTCString()}`;
    }
    
    document.cookie = cookie;
  }
  get(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
  delete(name: string): void {
    this.set(name, '', { expiresDays: -1 });
  }
}
