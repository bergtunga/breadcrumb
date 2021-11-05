import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private service: SettingsService) { }

  ngOnInit(): void {
  }
  onSubmit(form: NgForm): void {
    /*let newValue = form.value["room-name"];
    let index = this.rooms.indexOf(newValue);
    if(index === -1){
      this.rooms.push(newValue);
    }else{
      this.notify = index;
      setTimeout(() =>{this.notify = -1;}, 3000)
    }
    form.resetForm();*/
  }
  onSubmitName(form: NgForm){
    console.log(form.value['new-name']);
    this.service.setName(form.value['new-name']);
  }
}
