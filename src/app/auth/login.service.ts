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
export class LoginService {
  user$: Observable<User | null>;
  username: String | null = null; 
  welcomeName: String | null = null; 
  id: string | null = null;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = user(this.auth);
    firstValueFrom(this.user$).then((cu) =>{
      
      if(!cu){
        this.doLogout();
        //This happens when page loads and user is not logged in.
      }else{
        console.log(cu);
        this.username = cu.email;
        this.welcomeName = cu.displayName;
        this.id = cu.uid;
      }
    });
  }
/* ngOnInit does not get called for services */
  // ngOnInit() : void {
  //   //TODO: check cookies for valid login
  //   // this.user$.subscribe((input) => {
  //   //   console.log("subscribed to: ", input);
  //   // });
  //   // //setTimeout(()=>{
  //   //   this.auth.onAuthStateChanged((content) => {
  //   //     console.log("content of auth change = ", content);
  //   //   })
  //   // //}, 5000);
  //   // firstValueFrom(this.user$).then((cu) =>{
  //   //   console.log("fvf");
  //   //   //if(log){
  //   //   //  let cu = this.auth.currentUser as User;
  //   //   if(!cu){
  //   //     this.doLogout();
  //   //     console.log("shouldnt happen");
  //   //   }else{
  //   //     this.username = cu.email;
  //   //     this.welcomeName = cu.displayName;
  //   //     this.id = cu.uid;
  //   //   }
  //   // }
  //   // });
  // }

  _doLogin(redirect: string = "/breadcrumb"){
    signInWithPopup(this.auth, new GoogleAuthProvider()).then((uc: UserCredential) => {
      console.log("user = ", uc.user);
      this.username = uc.user.email;
      this.welcomeName = uc.user.displayName;
      this.id = uc.user.uid;
      this.router.navigate([redirect]);
    });
  }
  doLogin(redirect: string){ this._doLogin(redirect); }
  doLoginWithRedirect(){ this._doLogin(); }

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
