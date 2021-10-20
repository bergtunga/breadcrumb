import { Component, OnInit } from '@angular/core';
import { RoomService } from '../room.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  constructor(private rs: RoomService, private rt: ActivatedRoute) { }
  activeRoom = 'General';
  ngOnInit(): void {
    this.rt.params.subscribe((params: Params) =>{
      this.activeRoom = params['roomID'];
    });
  }
  sendMessage(){
    this.rs.makePost("abc123", this.activeRoom);
  }
}
