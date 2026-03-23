import { Routes } from '@angular/router';
import { RolesPageComponent } from './roles.page';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    component: RolesPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' }
  }
];
