import { Injectable, inject, signal } from '@angular/core';
import { CookieService } from './cookie.service';
import { JwtService } from './jwt.service';
import { DecodedToken, TokenInfo } from '../models/auth';
import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly cookie = inject(CookieService);
  private readonly jwt = inject(JwtService);
  private readonly authApi = inject(AuthApiService);

  readonly user = signal<DecodedToken | null>(null);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from existing cookies
   */
  private initializeAuth(): void {
    const accessToken = this.cookie.get('accessToken');
    if (accessToken && this.isTokenValid(accessToken)) {
      try {
        const decoded = this.jwt.decode(accessToken);
        this.user.set(decoded);
      } catch (error) {
        // Invalid token, clear cookies
        this.clearAuth();
      }
    } else if (accessToken) {
      // Token exists but is expired, clear everything
      this.clearAuth();
    }
    // If no token exists, do nothing (user stays null)
  }

  /**
   * Clear authentication data without triggering side effects
   */
  private clearAuth(): void {
    this.cookie.delete('accessToken');
    this.cookie.delete('refreshToken');
    this.user.set(null);
  }

  /**
   * Check if token is valid and not expired
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded = this.jwt.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      // Check if token is expired (with 10 second buffer)
      return decoded.exp > currentTime + 10;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  handleLogin(token: TokenInfo, rememberMe: boolean): void {
    const accessExpiresDays = rememberMe && token.refreshTokenExpiresIn
      ? token.refreshTokenExpiresIn / 86400 
      : undefined;
    
    this.cookie.set('accessToken', token.accessToken, {
      secure: true,
      sameSite: 'Lax',
      expiresDays: accessExpiresDays
    });

    // Store refresh token only when rememberMe is true
    if (rememberMe && token.refreshToken) {
      const refreshExpiresDays = token.refreshTokenExpiresIn 
        ? token.refreshTokenExpiresIn / 86400 
        : undefined;

      this.cookie.set('refreshToken', token.refreshToken, {
        secure: true,
        sameSite: 'Lax',
        expiresDays: refreshExpiresDays
      });
    }

    const decoded = this.jwt.decode(token.accessToken);
    this.user.set(decoded);
  }

  /**
   * Logout user and call logout API
   */
  logout(): Observable<any> {
    const accessToken = this.cookie.get('accessToken');
    
    // Call logout API with refresh token if available
    if (accessToken) {
      return this.authApi.logout(accessToken).pipe(
        catchError((error) => {
          // Log error but continue with logout even if API call fails
          console.error('Logout API error:', error);
          return of(null);
        }),
        finalize(() => {
          // Always clear local auth state regardless of API response
          this.clearAuth();
        })
      );
    } else {
      // No refresh token, just clear auth state
      this.clearAuth();
      return of(null);
    }
  }

  hasPermission(featureName: string, perm: 'CREATE' | 'READ' | 'DELETE'): boolean {
    const u = this.user();
    if (!u) return false;
    try {
      const map = JSON.parse(u.Permissions) as Record<string, { feature_Id: number; permissions: string[] }>;
      const normalizedFeatureName = featureName.trim().toUpperCase();
      const entry = Object.entries(map).find(
        ([name]) => name.trim().toUpperCase() === normalizedFeatureName
      )?.[1];
      const permissionList = Array.isArray(entry?.permissions) ? entry.permissions : [];
      return permissionList.some((permission) => String(permission).toUpperCase() === perm);
    } catch {
      return false;
    }
  }
}
