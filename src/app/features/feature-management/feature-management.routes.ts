import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { FeatureManagementPageComponent } from './feature-management.page';

export const FEATURE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: FeatureManagementPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' }
  }
];
