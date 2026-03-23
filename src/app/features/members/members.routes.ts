import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { MembersPageComponent } from './members.page';

export const MEMBERS_ROUTES: Routes = [
  { path: '', component: MembersPageComponent, canActivate: [authGuard, roleGuard], data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' } },
  { path: 'users', loadComponent: () => import('./users.page').then(m => m.UsersPageComponent), canActivate: [authGuard, roleGuard], data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' } },
  { path: 'roles', loadComponent: () => import('./roles.page').then(m => m.RolesPageComponent), canActivate: [authGuard, roleGuard], data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' } },
  { path: 'permissions', loadComponent: () => import('./permissions.page').then(m => m.PermissionsPageComponent), canActivate: [authGuard, roleGuard], data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' } }
];
