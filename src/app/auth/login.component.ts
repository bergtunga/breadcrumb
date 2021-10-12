import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';

import { firstValueFrom } from 'rxjs';
import { map } from '@firebase/util';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private userManager: LoginService,
              private router: Router,
              private ar: ActivatedRoute) { }

  ngOnInit(): void {

  }
  async doLogin(){
    //console.log(this.ar.snapshot.fragment);
    //this.ar.params.forEach((test) => console.log("test", test.key));
    //let currentNav = 
    // await firstValueFrom(this.ar.paramMap).then((paramMap) => {
    //   console.log(paramMap.keys);
    // });
    //let state$ = this.ar.paramMap.pipe(map(() => window.history.state))
    if(! this.ar.snapshot.fragment || this.ar.snapshot.fragment.startsWith("/login")){
     this.userManager.doLoginWithRedirect();
    }else{
      //console.log("currentnav=",this.router.routerState.snapshot);
      this.userManager.doLogin(this.ar.snapshot.fragment);
    }
  }
}
