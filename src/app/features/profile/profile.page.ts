import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DecodedToken } from '../../core/models/auth';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../shared/material/material.module';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../core/models/response/user.response';
import { FeatureApiService } from '../feature-api';
import { BaseComponent } from '../../core/components/base.component';

interface FeatureCard {
  name: string;
  featureId: number;
  permissions: string[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePageComponent extends BaseComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileApi = inject(FeatureApiService);

  user: DecodedToken | null = null;
  userProfile: UserProfile | null = null;
  featureCards: FeatureCard[] = [];
  permissions: Record<string, { feature_Id: number; permissions: string[] }> = {};
  isLoading = true;
  error: string | null = null;

  private colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C1EF65'
  ];

  ngOnInit(): void {
    this.user = this.auth.user();
    if (this.user) {
      this.fetchUserProfile();
      this.loadPermissions();
    } else {
      this.isLoading = false;
      this.error = 'User not authenticated';
    }
  }

  /**
   * Fetch user profile from API
   */
  private fetchUserProfile(): void {
    if (!this.user) return;
    
    this.profileApi.getUserProfile(this.user.UserId, environment.applicationId).subscribe({
      next: (response: any) => {
        this.runInZone(() => {
          if (response.isSuccess) {
            this.userProfile = response.data;
          } else {
            this.error = response.message || 'Failed to load profile';
          }
          this.isLoading = false;
          this.markForCheck();
        });
      },
      error: (err) => {
        console.error('Failed to fetch user profile:', err);
        this.runInZone(() => {
          this.error = 'Failed to load profile data';
          this.isLoading = false;
          this.markForCheck();
        });
      }
    });
  }

  /**
   * Load permissions from decoded token
   */
  private loadPermissions(): void {
    if (this.user && this.user.Permissions) {
      try {
        this.permissions = JSON.parse(this.user.Permissions);
        this.buildFeatureCards();
      } catch (e) {
        console.error('Failed to parse permissions');
      }
    }
  }

  private buildFeatureCards(): void {
    this.featureCards = Object.entries(this.permissions).map(([name, data], index) => ({
      name,
      featureId: data.feature_Id,
      permissions: data.permissions,
      icon: this.getIconForFeature(name),
      color: this.colorPalette[index % this.colorPalette.length]
    }));
  }

  private getIconForFeature(featureName: string): string {
    const iconMap: Record<string, string> = {
      'MEMBER MANAGEMENT': 'people',
      'DEPOSIT MANAGEMENT': 'savings',
      'GOAL MANAGEMENT': 'flag',
      'INVESTMENT MANAGEMENT': 'trending_up',
      'MEETING MANAGEMENT': 'event_note',
      'PENALTY SYSTEM': 'warning',
      'PROPORTIONAL PROFIT DISTRIBUTION': 'distribute',
      'REPORTING': 'assessment',
      'NOTIFICATIONS': 'notifications'
    };
    return iconMap[featureName] || 'dashboard';
  }

  hasPermission(featureName: string, permission: 'CREATE' | 'READ' | 'DELETE'): boolean {
    return this.permissions[featureName]?.permissions?.includes(permission) || false;
  }
}
