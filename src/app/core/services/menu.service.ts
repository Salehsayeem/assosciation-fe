import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface SubMenuItem {
  name: string;
  route?: string;
  icon?: string;
  children?: SubMenuItem[];
}

export interface MenuItem {
  name: string;
  route?: string;
  icon?: string;
  children?: SubMenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(AuthService);
  readonly menuItems = signal<MenuItem[]>([]);

  constructor() {
    effect(() => {
      this.auth.user();
      this.initializeMenu();
    });
  }

  private initializeMenu(): void {
    const user = this.auth.user();
    if (!user?.Permissions) {
      this.menuItems.set([]);
      return;
    }

    try {
      const permissions = JSON.parse(user.Permissions) as Record<string, { feature_Id: number; permissions: string[] }>;
      const items: MenuItem[] = Object.entries(permissions)
        .filter(([, data]) => Array.isArray(data?.permissions) && data.permissions.length > 0)
        .map(([rawName]) => {
        const featureName = this.normalizeFeatureName(rawName);
        const item: MenuItem = {
          name: this.getMenuNames(featureName),
          route: this.getRouteForFeature(featureName),
          icon: this.getIconForFeature(featureName)
        };
        
        // Add submenu items for MEMBER MANAGEMENT
        if (featureName === 'MEMBER MANAGEMENT') {
          item.children = [
            //{ name: 'Features', route: '/features', icon: 'view_module' },
            { name: 'Users', route: '/users', icon: 'person' },
            { name: 'Roles', route: '/roles', icon: 'admin_panel_settings' },
            {
              name: 'Permissions',
              icon: 'security',
              children: [
                { name: 'User Permissions', route: '/permissions/users', icon: 'person_check' },
                { name: 'Role Permissions', route: '/permissions/roles', icon: 'admin_panel_settings' }
              ]
            }
          ];
          item.route = undefined; // Parent is a group header only
        }
        
        return item;
      });
      this.menuItems.set(items);
    } catch {
      this.menuItems.set([]);
    }
  }

  private normalizeFeatureName(featureName: string): string {
    return featureName.trim().toUpperCase();
  }

  private getRouteForFeature(featureName: string): string {
    const routeMap: Record<string, string> = {
      'MEMBER MANAGEMENT': '#',
      'DEPOSIT MANAGEMENT': '/deposits',
      'GOAL MANAGEMENT': '/goals',
      'INVESTMENT MANAGEMENT': '/investments',
      'MEETING MANAGEMENT': '/meetings',
      'PENALTY SYSTEM': '/penalties',
      'PROPORTIONAL PROFIT DISTRIBUTION': '/distribution',
      'REPORTING': '/reports',
      'NOTIFICATIONS': '/notifications'
    };
    return routeMap[featureName] || '#';
  }

  private getMenuNames(featureName: string): string {
    const routeMap: Record<string, string> = {
      'MEMBER MANAGEMENT': 'MEMBER',
      'DEPOSIT MANAGEMENT': 'DEPOSIT',
      'GOAL MANAGEMENT': 'GOAL',
      'INVESTMENT MANAGEMENT': 'INVESTMENT',
      'MEETING MANAGEMENT': 'MEETING',
      'PENALTY SYSTEM': 'PENALTY',
      'PROPORTIONAL PROFIT DISTRIBUTION': 'PROFIT DISTRIBUTION',
      'REPORTING': 'REPORTING',
      'NOTIFICATIONS': 'NOTIFICATIONS'
    };
    return routeMap[featureName] || featureName;
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

  refreshMenu(): void {
    this.initializeMenu();
  }
}
