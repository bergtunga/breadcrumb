import { Component, OnInit } from '@angular/core';
import { RoomService } from '../room.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  constructor(private rs: RoomService) { }

  ngOnInit(): void {
    
  }
  sendMessage(){
    this.rs.makePost("abc123", "General");
  }
}
