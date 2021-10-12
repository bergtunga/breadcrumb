import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  signInWithPopup,
  Auth,
  GoogleAuthProvider,
  signOut,
  user,
  User,
  UserCredential
} from "@angular/fire/auth"
import { Observable, firstValueFrom } from 'rxjs';
//https://stackoverflow.com/questions/68940657/using-google-oauth-in-angular-12-with-angular-fire7-0-0-firebase9-0-0

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {
  user$: Observable<User | null>;
  username: String | null = null; 
  welcomeName: String | null = null; 
  id: String | null = null;  

  constructor(private auth: Auth, private router: Router) {
    this.user$ = user(this.auth);
  }

  ngOnInit(){
    //TODO: check cookies for valid login
    this.user$.subscribe((input) => {
      console.log("subscribed to: ", input);
    });
    //setTimeout(()=>{
      this.auth.onAuthStateChanged((content) => {
        console.log("content of auth change = ", content);
      })
    //}, 5000);
  }
  _doLogin(doRedirect: boolean){
    signInWithPopup(this.auth, new GoogleAuthProvider()).then((uc: UserCredential) => {
      console.log("user = ", uc.user);
      this.username = uc.user.email;
      this.welcomeName = uc.user.displayName;
      this.id = uc.user.uid;
      if(doRedirect)
        this.router.navigate(["/breadcrumb"]);
    });
  }
  doLogin(){ this._doLogin(false); }
  doLoginWithRedirect(){ this._doLogin(true); }
  doLogout(){
    signOut(this.auth).then(
      () => {
        this.router.navigate(["./login"]);
        //console.log("Loggedout");
      },
      () => {
        //console.log("Rejected logout");
      });
    //console.log("called signOut");
  }
  async isLoggedIn(): Promise<boolean> {
    // only use in code, use observable in template
    return !! await firstValueFrom(this.user$);
  }
  /**
   * 
   * @returns null if not logged in, string if 
   */
  getUsername(): String | null{
    return this.username;
      //return user$; 
  }
}
