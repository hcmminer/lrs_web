import {Injectable} from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import {AuthService} from './auth.service';
import {CONFIG} from '../../../utils/constants';

@Injectable({providedIn: 'root'})
export class NocStaffGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      if (currentUser.roleCode === CONFIG.USER_ROLE.CMS_BTS_NOC_STAFF) {
        //   // logged in so return true
        return true;
      }
      // not logged in so redirect to login page with the return url
      this.authService.logout();
      return false;
    }
  }
}
