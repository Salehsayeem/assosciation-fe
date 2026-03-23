import { Component, inject, input, output } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  template: `
    <mat-toolbar color="primary" class="dashboard-header">
      <button 
        mat-icon-button 
        (click)="toggleSidebar.emit()" 
        class="menu-button"
        [attr.aria-label]="sidebarOpen() ? 'Close sidebar' : 'Open sidebar'"
        matTooltip="Toggle sidebar"
      >
        <mat-icon>{{ sidebarOpen() ? 'close' : 'menu' }}</mat-icon>
      </button>
      
      <span class="spacer"></span>
      
      <div class="user-info">
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-email">{{ userEmail }}</div>
        </div>
        <button mat-icon-button [matMenuTriggerFor]="menu" class="user-avatar">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="viewProfile()">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .dashboard-header {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .menu-button {
      margin-right: 1rem;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-details {
      text-align: right;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.95rem;
    }

    .user-email {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .user-avatar {
      font-size: 2rem;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    @media (max-width: 600px) {
      .user-details {
        display: none;
      }

      .menu-button {
        margin-right: 0.5rem;
      }
    }
  `]
})
export class DashboardHeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sidebarOpen = input<boolean>(true);
  toggleSidebar = output<void>();

  get userName(): string {
    return this.auth.user()?.Email?.split('@')[0] || 'User';
  }

  get userEmail(): string {
    return this.auth.user()?.Email || '';
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still navigate to login even if logout API fails
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
