import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class RequireLoggedInGuard implements CanActivate {
  constructor(private serviceManager: LoginService,
              private router: Router){  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.serviceManager.isLoggedIn().then(
        (isLoggedIn) => {
          if(isLoggedIn){
            return true;
          }else{
            const attemptedLoc : string = state.url;
            console.log(attemptedLoc);
            return this.router.navigate(["/login"]);
          }
        }
      );
  }
  
}
