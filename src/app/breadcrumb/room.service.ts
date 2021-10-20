import { Injectable } from '@angular/core';
import { Firestore,
  collection,
  CollectionReference,
  DocumentReference,
  DocumentData,
  addDoc,
  docData,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
updateDoc } from '@angular/fire/firestore';
import { Observable, Subscriber, Subscription, firstValueFrom } from 'rxjs';

import { LoginService } from '../auth/login.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  //public userCollection: CollectionReference<DocumentData>;

  public encryptions = {};
  crumbService: CrumbHelper | undefined;
  isMember = false;

  constructor(private fs: Firestore, private user: LoginService) {  }

  async makePost(content: String, room: String, encrypt = 0, iv?: string, key?: string){

    //Check participation
    if(!this.isMember){
      //First check, then add
      let roomDoc = doc(this.fs, "Rooms/" + room)
      let participantList = (await firstValueFrom(docData(roomDoc)));
      let uid = this.user.id as string
      if(!participantList[uid]){
        let j: {[x:string]: any} = {};
        j[uid] = doc(this.fs, uid + "/" + room);
        updateDoc(roomDoc, j);
      }
      this.isMember = true;
    }
    //this.fs.app.automaticDataCollectionEnabled
    let userDocs = doc(this.fs, this.user.id+"/" + room);
    firstValueFrom(docData(userDocs)).then((docData) => {
      console.log("data: ",docData);
      let i = 1;;
      for(; docData[i]; i++);
      let j: {[x:string]: any} = {};
      j['' + i] = {message: content, time:serverTimestamp()};
      updateDoc(userDocs, j);
    })
    
//    let id = (await addDoc(this.userCollection, {General:{message: content, at: serverTimestamp()}})).id;
    //addDoc(room, {name: "1", path: id });
  }
  getCrumbs(room: string): Observable<MessageChange>{
    this.crumbService = new CrumbHelper(room, this.fs);
    return this.crumbService.crumbObserver;
  }
  /* Not Symmeretic, wont work * /
  AESCTR =  {
    genCounter(): Uint8Array{
      return window.crypto.getRandomValues(new Uint8Array(16));
    },
  
    getParams(counter: Uint8Array): AesCtrParams{
      return {name: "AES-CTR" ,counter: counter, length:64};
    },
    
    /*
    Get the encoded message, encrypt it and display a representation
    of the ciphertext in the "Ciphertext" element.
    * /
    async encryptMessage(key: CryptoKey, plaintext: string, counter: Uint8Array) : Promise<BufferSource> {
      let encoded = new TextEncoder().encode(plaintext)
      // The counter block value must never be reused with a given key.

      return window.crypto.subtle.encrypt(
        this.getParams(counter),
        key,
        encoded
      );
    },
  
    /*
    Fetch the ciphertext and decrypt it.
    Write the decrypted message into the "Decrypted" box.
    * /
    async decryptMessage(key: CryptoKey, cyphertext: BufferSource, counter: Uint8Array): Promise<string> {
      let decrypted = await window.crypto.subtle.decrypt(
        this.getParams(counter),
        key,
        cyphertext
      );
  
      let dec = new TextDecoder();
      return dec.decode(decrypted);
    },
  
    /*
    Generate an encryption key, then set up event listeners
    on the "Encrypt" and "Decrypt" buttons.
    * /
    key: window.crypto.subtle.generateKey(
      {   name: "AES-CTR",
          length: 256
      },
      true,
      ["encrypt", "decrypt"]
    ) as Promise<CryptoKey>,


  }

  AESCBC = {
    iv : window.crypto.getRandomValues(new Uint8Array(16)),
  
    /*
    Get the encoded message, encrypt it and display a representation
    of the ciphertext in the "Ciphertext" element.
    * /
    async encryptMessage(message: string, key: CryptoKey, iv: Uint8Array) {
      let encoded = new TextEncoder().encode(message);
      // The iv must never be reused with a given key.
      return window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv
        },
        key,
        encoded
      );
    },
  
    /*
    Fetch the ciphertext and decrypt it.
    Write the decrypted message into the "Decrypted" box.
    * /
    async decryptMessage(ciphertext: BufferSource, key:CryptoKey, iv: Uint8Array) {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv
        },
        key,
        ciphertext
      );
  
      let dec = new TextDecoder();
      return dec.decode(decrypted);
    },
  
    /*
    Generate an encryption key, then set up event listeners
    on the "Encrypt" and "Decrypt" buttons.
    * /
    key : window.crypto.subtle.generateKey(
      {
          name: "AES-CBC",
          length: 256
      },
      true,
      ["encrypt", "decrypt"]
    ),
  
  };
  fromHexString = (hexString: string) =>
  new Uint8Array((hexString.match(/.{1,2}/g) as RegExpMatchArray).map(byte => parseInt(byte, 16)));

  toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  /* */
}
class CrumbHelper{
  primarySub: Subscription | undefined;
  roomObserver: Observable<DocumentData>;
  userLinks: UserLink[];
  subscribers: Subscriber<MessageChange>[];
  crumbObserver: Observable<MessageChange>;
  roomName: string;
  constructor(room: string, fs: Firestore){
    this.userLinks = [];
    this.subscribers = [];
    this.primarySub = undefined;
    this.roomName = room;
    let data = doc(fs, "Rooms/" + room);
    const participantContents = docData(data); 
    this.roomObserver = participantContents;
    this.crumbObserver = new Observable<MessageChange>(this.addSubscriber);
    this.primarySub = this.roomObserver.subscribe(this.updateUsers);
  }

  //Called on an update of the room, which indicates a change in the
  // participants.
  updateUsers = (data: DocumentData) => {
    outer: for(let lnk in data){
      let user = data[lnk] as DocumentReference;
      for(let existingMember of this.userLinks){
        if(user.path == existingMember.userDataRef)
          continue outer;
      } // If it is already a member, do not add.
        //TODO: implement removing.

      let userPosts = docData(user);
        //Retrieves the document that contains the user posts
      let pushWithUser = (doc:DocumentData) => {this.doPush(doc, user.path);};
        //Creates a function that pushes both the user and their posts to the group
      let subscription = userPosts.subscribe(pushWithUser);
        // observes the user with the created function.
      this.userLinks.push(new UserLink(user.path, subscription));
        //Adds the user and the subscription to the maintained list.
    }
  }

  doPush = (doc: DocumentData, user: string) => {
    let link: UserLink | undefined;
    let author = user.slice(0, -this.roomName.length-1);
    for(let participant of this.userLinks){
      if(participant.userDataRef === user){
        link = participant;
      }
    }
    if(! link){
      console.log(Error("unidentified user " + user));
    }else {
    if(link.lastData){
      //check if add or remove.
      let addList: Message[] = [];
      let removeList: Message[] = [];
      for(let iter in doc){
        let newItem = doc[iter] as Message;
        if(newItem.time)
          addList.push(newItem);
      }
      for(let jter in link.lastData){
        let oldDataPost = link.lastData[jter] as Message;
        if(!oldDataPost.time)
          continue;
        let contained = false;
        for(let i = 0; i < addList.length; i++){
          if(Message.equals(addList[i], oldDataPost)){
            addList.splice(i, 1);
            contained = true;
            break;
          }
        }
        if(!contained)
          removeList.push(oldDataPost);
      }
      for(let change of addList){
        change.author = author;
        for(let sub of this.subscribers){
          sub.next(new MessageChange(change, true));
        }
      }for(let change of removeList){
        change.author = author;
        for(let sub of this.subscribers){
          sub.next(new MessageChange(change, false));
        }
      }
    }else{//New, add all
      for(let sub of this.subscribers ){
        for(let iter in doc){
          doc[iter].author = user;
          sub.next(new MessageChange(doc[iter] as Message, true));
        }
      }
    }
    link.lastData = doc;
    //console.log(doc, " by ", user);


    
  }}
  addSubscriber = (sub: Subscriber<MessageChange>) =>{
    const index = this.subscribers.length;
    this.subscribers.push(sub);
    return () => {this.subscribers.splice(index, 1)};
  }
  unsubscribe = () => {
    if(this.primarySub)
      this.primarySub.unsubscribe();
    for(let user of this.userLinks){
      user.sub.unsubscribe();
    }
  }
}
class UserLink{
  lastData: DocumentData | undefined;
  constructor(public userDataRef: string, public sub: Subscription){  }

}
export class MessageChange{
  constructor(public m: Message, public addNotRemove: boolean){}
}
export class Message{
  private constructor(){this.message = ""; this.time=serverTimestamp() as Timestamp; }
  message: string;
  time: Timestamp;
  author: string | undefined;
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
    let result = (a.message === b.message) && a.time.isEqual(b.time);
    //console.log(a, b, " result", result);
    return result;
  }
}