import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const requiredFeature = route.data?.['feature'] as string | undefined;
  const requiredPerm = route.data?.['permission'] as ('CREATE'|'READ'|'DELETE') | undefined;
  if (!requiredFeature || !requiredPerm) return true;
  return auth.hasPermission(requiredFeature, requiredPerm);
};
