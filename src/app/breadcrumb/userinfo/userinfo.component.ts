import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css']
})
export class UserinfoComponent implements OnInit {

  constructor(public loginManager: LoginService) { }

  ngOnInit(): void {
  }
  doLogout(){
    this.loginManager.doLogout();
  }

}
