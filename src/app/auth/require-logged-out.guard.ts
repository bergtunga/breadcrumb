import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class RequireLoggedOutGuard implements CanActivate {
  constructor(private serviceManager: LoginService){  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.serviceManager.isLoggedIn().then(
        (isLoggedIn) => {
          return !isLoggedIn;
        }
      );

  }
  
}
