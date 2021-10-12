import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login: boolean = false;
  constructor(private userManager: LoginService,
              private router: Router) { }

  ngOnInit(): void {
  }
  doLogin(){
    this.userManager.doLoginWithRedirect();
  }
}
