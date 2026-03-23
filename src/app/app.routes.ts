import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
		canActivate: [authGuard],
		children: [
			{
				path: 'profile',
				loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
			},
			{
				path: 'users',
				loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
			},
			{
				path: 'roles',
				loadChildren: () => import('./features/roles/roles.routes').then(m => m.ROLES_ROUTES)
			},
			{
				path: 'permissions',
				loadChildren: () => import('./features/permissions/permissions.routes').then(m => m.PERMISSIONS_ROUTES)
			},
			{
				path: 'deposits',
				loadChildren: () => import('./features/deposits/deposits.routes').then(m => m.DEPOSITS_ROUTES)
			},
			{
				path: 'features',
				loadChildren: () => import('./features/feature-management/feature-management.routes').then(m => m.FEATURE_MANAGEMENT_ROUTES)
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'profile'
			}
		]
	},
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
	},
	{
		path: 'access-denied',
		loadComponent: () => import('./features/access-denied/access-denied.page').then(m => m.AccessDeniedPageComponent)
	},
	{ path: '**', redirectTo: 'profile' }
];
