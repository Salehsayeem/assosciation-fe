import { Routes } from '@angular/router';
import { RolePermissionsPageComponent } from './role-permissions.page';
import { UserPermissionsPageComponent } from './user-permissions.page';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const PERMISSIONS_ROUTES: Routes = [
  {
    path: 'users',
    component: UserPermissionsPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' }
  },
  {
    path: 'roles',
    component: RolePermissionsPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' }
  },
  {
    path: '',
    redirectTo: 'roles',
    pathMatch: 'full'
  }
];
