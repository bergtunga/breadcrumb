import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Firestore, doc, collection, Timestamp, serverTimestamp } from '@angular/fire/firestore';

import { RoomService, Message } from '../room.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  constructor(private fs: Firestore, private rs: RoomService, private rt: ActivatedRoute) { }
  //crumbs : string[] = ["example Crumb 1", "example crumb 2"];
  @Output() crumbs: Message[] = []; //TODO: Replace with B-Tree
  sub: Subscription | undefined;

  ngOnInit(): void {
    //let general = doc(this.fs, 'Rooms/General');
    //console.log("init room");
    this.rt.params.subscribe((params:Params) =>{
      if(this.sub) this.sub.unsubscribe();
      this.crumbs = [];
      this.sub = this.rs.getCrumbs(params["roomID"]).subscribe(doc => {
        //console.log("docs",doc);
        if(doc.addNotRemove){
          this.crumbs.push(doc.m);
          this.crumbs.sort(Message.invertCompareFn);
          //console.log("updated: ", this.i++);
        }else {
          for(let i = 0; i < this.crumbs.length; i++){
            if(Message.equals(doc.m, this.crumbs[i])){
              this.crumbs.splice(i, 1);
              break;
            }
          }
        }
      });
    
      //console.log(this.crumbs);
    });
  }
  isSelf(crumb: Message): boolean{
    return this.rs.madePost(crumb);
  }
}