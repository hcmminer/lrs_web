import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import {CONFIG} from '../../../utils/constants';

@Injectable({ providedIn: 'root' })
export class ProvInfastructureGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      if (currentUser.userRole === CONFIG.USER_ROLE.CMS_PROV_INFA_STAFF) {
        // logged in so return true
        return true;
      }

      // return this.router.navigate(['/']);
    }

    // not logged in so redirect to login page with the return url
    this.authService.logout();
    return false;
  }
}
