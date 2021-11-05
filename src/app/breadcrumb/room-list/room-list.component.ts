import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  showForm: boolean =  false;
  notify: Number = -1;
  constructor(private settings: SettingsService) { }
  rooms: string[] = [ ];

  async ngOnInit(): Promise<void> {
    this.rooms = await this.settings.getRooms();
  }
  onSubmit(form: NgForm): void {
    let newValue = form.value["room-name"];
    let index = this.rooms.indexOf(newValue);
    if(index === -1){
      this.rooms.push(newValue);
    }else{
      this.notify = index;
      setTimeout(() =>{this.notify = -1;}, 3000)
    }
    form.resetForm();
  }
  toggleAdd(){
    this.showForm = !this.showForm;
  }

}
