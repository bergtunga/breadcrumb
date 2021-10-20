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
  setDoc } from '@angular/fire/firestore';
import { mergeMap, Observable, Subscriber, Subscription, zip } from 'rxjs';

import { LoginService } from '../auth/login.service';



@Injectable({
  providedIn: 'root'
})
export class RoomService {
  //public userCollection: CollectionReference<DocumentData>;

  public encryptions = {};

  constructor(private fs: Firestore, private user: LoginService) { 
    //this.userCollection = collection(this.fs, ""+this.user.id);
  }
  async makePost(content: String, room: String, encrypt = 0, iv?: string, key?: string){
    //this.fs.app.automaticDataCollectionEnabled

    //todo: time
    setDoc(doc(this.fs, this.user.id+"/" + room), {1:{message: content, time:serverTimestamp()}});
//    let id = (await addDoc(this.userCollection, {General:{message: content, at: serverTimestamp()}})).id;
    //addDoc(room, {name: "1", path: id });
  }
  getCrumbs(room: String): Observable<DocumentData>{
   let data = doc(this.fs, "Rooms/" + room);
   const participantContents = docData(data);
    // Observable<DocumentData> - An array of references to participants
    let ch = new CrumbHelper(participantContents);
    const crumbWatcher = new Observable<DocumentData>(ch.addSubscriber);
    ch.start();
    return crumbWatcher;
   /*const crumbWatch = participantContents.pipe(mergeMap((data: DocumentData) => {
     for(let user of data.users as DocumentReference[]){
      console.log(user.path);
     }
      let asdf: Observable<DocumentData>[] = [];
      for(let user = 1; data[user]; user++){
        //console.log("content item " + i, data[i]);
        //console.log("userPath = ", data[i].path);
        asdf.push(docData(doc(this.fs, data[user].path)));
      }
      return zip(... asdf);
    }));
    console.log(crumbWatch);
    return crumbWatch;*/

  //  const crumbWatch = new Observable<DocumentData>(messageRefs.then((data:DocumentData) => {
  //   //console.log(data);
  //  let asdf: Observable<DocumentData>[] = [];
  //   for(let i = 1; data[i]; i++){
  //     //console.log("content item " + i, data[i]);
  //     console.log("userPath = ", data[i].path);
  //    asdf.push(docData(doc(this.fs, data[i].path)))
  //   }
  //   zip(... asdf);
  // }));
   //console.log(messageRefs);
  //  participantContents.subscribe((data:DocumentData) => {
  //    //console.log(data);
  //   let asdf: Observable<DocumentData>[] = [];
  //    for(let i = 1; data[i]; i++){
  //      //console.log("content item " + i, data[i]);
  //      console.log("userPath = ", data[i].path);
  //     asdf.push(docData(doc(this.fs, data[i].path)))
  //    }
  //    zip(... asdf);
  //  });
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
  room: Observable<DocumentData>;
  userLinks: UserLink[];
  subscribers: Subscriber<DocumentData>[];
  constructor(room: Observable<DocumentData>){
    this.userLinks = [];
    this.subscribers = [];
    this.primarySub = undefined; 
    this.room = room;
  }
  start = () => {
    this.primarySub = this.room.subscribe(this.updateUsers);
  }
  updateUsers = (data: DocumentData) => {
    outer: for(let user of data.users as DocumentReference[]){
      for(let existingMember of this.userLinks){
        if(user.path == existingMember.userDataRef)
          continue outer;
      } // If it is already a member, do not add.
        //TODO: implement removing.
      this.userLinks.push(new UserLink(user.path, docData(user).subscribe(doc => this.doPush(doc, user.path))));
    }
  }
  doPush = (doc: DocumentData, user: string) => {
    for(let sub of this.subscribers ){
      sub.next(doc);
    }
    console.log(doc);
  }
  addSubscriber = (sub: Subscriber<DocumentData>) =>{
    const index = this.subscribers.length;
    this.subscribers.push(sub as Subscriber<DocumentData>);
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
  constructor(public userDataRef: string, public sub: Subscription){  }
}