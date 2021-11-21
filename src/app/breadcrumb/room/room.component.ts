import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Firestore, doc, collection, Timestamp, serverTimestamp, DocumentData, DocumentReference, docData } from '@angular/fire/firestore';

import { RoomService, Message, MessageChange } from '../room.service';

import { firstValueFrom, Observable,  Subscriber, Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  host: {'class':'flex-grow-1'},
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  constructor(private fs: Firestore, private rs: RoomService, private rt: ActivatedRoute) { }
  
  @Output() crumbs: Message[] = []; //TODO: Replace with B-Tree
  //sub: Subscription | undefined;
  crumbUpdater: CrumbHelper | undefined;

  ngOnInit(): void {
    this.rt.params.subscribe((params:Params) =>{
      //Subscribe to the activated route parameters.

      if(this.crumbUpdater) this.crumbUpdater.dispose();
      //If a subscription to a previous route already exists, dispose of it.

      this.crumbs = [];
      let room = params["roomID"];
      this.crumbUpdater = new CrumbHelper(room, this.fs, (doc:MessageChange) => {
        //And subscribe to them.
        
        if(doc.addOrRemove === MessageChange.ADD){
          this.crumbs.push(doc.m);
          this.crumbs.sort(Message.compareFn);
          //Add the new message and sort the list.
        }else if(doc.addOrRemove === MessageChange.REMOVE){
          //If it should remove the crumb.
          for(let i = 0; i < this.crumbs.length; i++){
            //Loop through crumbs

            if(Message.equals(doc.m, this.crumbs[i])){
              this.crumbs.splice(i, 1);
              break;
              //If the messages are the same, remove it from the list.
            }
          }
        }
      });
      //this.sub = this.crumbUpdater.subscribe();
        //Get the crumbs of the current room.
        
    
    });
  }

  ngOnDestroy(): void {
    if(this.crumbUpdater){//do cleanup
      this.crumbUpdater.dispose();
    }
  }

  isSelf(crumb: Message): boolean{
    //console.log(crumb);
    return this.rs.madePost(crumb);
  }
}
class CrumbHelper{

  private primarySub: Subscription;
  //Subscription observing who is in the room.

  private userLinks: UserLink[];
  //Subscriptions observing users posts.

  constructor(private roomName: string, private fs: Firestore, private eventListener: ((event: MessageChange) => void)){
    this.userLinks = [];
    let roomObserver = docData(doc(fs, "Rooms/" + roomName));
    //document observable for members of the room.
    
    this.primarySub = roomObserver.subscribe(this.updateUsers);
    //Subscribe to who is in the room
  }

  //Called on an update of the room, which indicates a change in the
  // participants.
  updateUsers = (data: DocumentData) => {
    let newList: DocumentReference[] = [];
    let oldList: DocumentReference[] = [];
    for(let lnk in data){
      let user = data[lnk] as DocumentReference;
      newList.push(user);
    }
    for(let existingMember of this.userLinks){
      oldList.push(existingMember.userDocRef);
    }
    CrumbHelper.updateLists(
      newList,
      oldList,
      (a: DocumentReference, b: DocumentReference) => {
        return a.path === b.path;
      },
      (add) => {
        let userPosts = docData(add);
        //Document observable for user posts
        let pushWithUser = (doc:DocumentData) => {this.doPush(doc, add.path);};
          //Creates a function that pushes both the user and their posts to the group
        let subscription = userPosts.subscribe(pushWithUser);
          // observes the user with the created function.
        
        const link = new UserLink(add, subscription);

        let fp = firstValueFrom(docData(doc(this.fs, link.getUserID()+"/settings")));
        fp.then((a)=>{
          //console.log(a);
          if(a && a['publicName']){
          link.name = a['publicName'];
        }
        });
        
        this.userLinks.push(link);
        //Adds the user and the subscription to the maintained list.
      },
      (remove) => {
        for(let i = 0; i < this.userLinks.length; i++){
          if(this.userLinks[i].userDocRef.path === remove.path){
            let toRemove = this.userLinks[i];
            this.userLinks.splice(i, 1);
            toRemove.sub.unsubscribe();
            break;
          }
        }
      });
  }

  //Takes in a new list and old list, and returns what needs to be added/removed
  // to turn one list into the other.
  static updateLists<T>(
      newList: T[],
      oldList: T[],
      matches: (a:T, b:T) => boolean,
      onAdd: (add: T) => void,
      onRemove: (add: T) => void
      ): void{

    let added: T[] = [];
    added.push(...newList);
    if(oldList){
      for(let val of oldList){
          let contained = false;
          for(let i = 0; i < added.length; i++){
            if(matches(val, added[i])){
              added.splice(i, 1);
              contained = true;
              break;
            }
          }
          if(!contained){
            onRemove(val);
          }
      }
    }
    for (let elem of added){
      onAdd(elem);
    }
  }
  //Called to extract messages from a user's documentdata
  static getMessages(doc: DocumentData | undefined) : Message[]{
    let result: Message[] = [];
    if(doc)
      for(let iter in doc){
        let newItem = doc[iter] as Message;
        if(newItem.time) result.push(newItem);
      }
    return result;
  }
  //Called on an update of one of the user's messages.
  doPush = async (participantCrumbs: DocumentData, user: string) => {
    let link: UserLink | undefined;
    for(let participant of this.userLinks){
      if(participant.userDocRef.path === user){
        link = participant;
      }
    }
    //Identify the user that made the post

    if(!link){
      console.log(Error("unidentified user " + user));
      //No user = something's wrong.

    }else{
      let author = link.getUserName();
      //check if add or remove.
      let newList: Message[] = CrumbHelper.getMessages(participantCrumbs);
      let oldList: Message[] = CrumbHelper.getMessages(link.lastData);
      
      CrumbHelper.updateLists(newList, oldList, Message.equals,
        (add: Message): void => {
          add.author = author;
            this.eventListener(new MessageChange(add, true));
        },
        (remove: Message) => {
          remove.author = author;
            this.eventListener(new MessageChange(remove, false));
        });

    link.lastData = participantCrumbs;
    }
  }
  dispose = () => {
    this.primarySub.unsubscribe();
    for(let user of this.userLinks){
      user.sub.unsubscribe();
    }
  }
}
class UserLink{
  lastData: DocumentData | undefined;
  constructor(public userDocRef: DocumentReference, public sub: Subscription, public name?:string){  }
  getUserName = (): string => {
    if(this.name)
      return this.name;
    else
      return this.getUserID();
  }
  getUserID = (): string => {
    return this.userDocRef.path.substring(0, this.userDocRef.path.lastIndexOf("/"));
  }
}