import { Component, OnInit, Output } from '@angular/core';
import { Firestore, doc, collection, Timestamp, serverTimestamp } from '@angular/fire/firestore';
import { RoomService } from '../room.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  constructor(private fs: Firestore, private rs: RoomService) { }
  //crumbs : string[] = ["example Crumb 1", "example crumb 2"];
  @Output() crumbs: Message[] = []; //TODO: Replace with B-Tree

  ngOnInit(): void {
    //let general = doc(this.fs, 'Rooms/General');
    //console.log("init room");
    this.rs.getCrumbs("General").subscribe(doc => {
      //console.log("docs",doc);
      for(let iter in doc){
        //console.log("docitem", doc[iter]);
        let message = doc[iter] as Message;
        console.log("checking ", message);
        let equality = this.crumbs.filter(crumb => Message.equals(crumb, message)).length === 0;
        if(equality){
          this.crumbs.push(message);
        }
      }
      this.crumbs.sort(Message.invertCompareFn);
      console.log(this.crumbs);
    });
  }

}
class Message{
  private constructor(){this.message = ""; this.time=serverTimestamp() as Timestamp; }
  message: string;
  time: Timestamp;
  toString(): String{
    return '"' + this.message + '" at ' + this.time;
  }
  static compareFn(a: Message, b: Message): number{
    //console.log("comparing", a, b);
    let am = a.time;
    let bm = b.time;
    if(am > bm){
      return 1;
    }else if (bm > am){
      return -1;
    }else{
      return 0;
    }
  }
  static invertCompareFn(a: Message, b: Message): number{
    return Message.compareFn(a, b) * -1;
  }
  static equals(a: Message, b: Message){
    return(a.message === b.message) && a.time.isEqual(b.time);
  }
}