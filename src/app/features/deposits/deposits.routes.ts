import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { DepositsPageComponent } from './deposits.page';

export const DEPOSITS_ROUTES: Routes = [
  { path: '', component: DepositsPageComponent, canActivate: [authGuard, roleGuard], data: { feature: 'DEPOSIT MANAGEMENT', permission: 'READ' } }
];
