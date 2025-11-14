import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FeatureID } from '../data/feature-authorization/feature-id';
import { AuthService } from './auth.service';
import { AuthorizationDataService } from '../data/feature-authorization/authorization-data.service';

/**
 * Guard that allows access to admin routes for site administrators, uploaders and reviewers.
 */
export const adminModuleAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean> => {
  const authService = inject(AuthService);
  const authorizationService = inject(AuthorizationDataService);

  return authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(
    switchMap((isAdmin: boolean) => {
      if (isAdmin) {
        return of(true);
      }
      return authService.getAuthenticatedUserFromStore().pipe(map((user) => {
        const role = user?.role?.toUpperCase();
        return role === 'UPLOADER' || role === 'REVIEWER';
      }));
    }));
};

