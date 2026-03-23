import { Injectable } from '@angular/core';
import { DecodedToken } from '../models/auth';

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  } catch {
    return '';
  }
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  decode(token: string): DecodedToken {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload as DecodedToken;
  }
}
