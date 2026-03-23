import { Routes } from '@angular/router';
import { UsersPageComponent } from './users.page';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { feature: 'MEMBER MANAGEMENT', permission: 'READ' }
  }
];
