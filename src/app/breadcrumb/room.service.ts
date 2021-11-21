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
  public encryptions = {};
  isMember = false;

  constructor(private fs: Firestore, private user: LoginService) {  }

  madePost = (crumb: Message) => {
    return crumb.author === this.user.id;
  }

  makePost = async (content: String, room: String, encrypt = 0, iv?: string, key?: string) => {

    //Check participation
    if(!this.isMember){
      //First check, then add
      let roomDoc = doc(this.fs, "Rooms/" + room)
      let participantList = (await firstValueFrom(docData(roomDoc)));
      let uid = this.user.id as string;
      if(!participantList || !participantList[uid]){
        let j: {[x:string]: any} = {};
        j[uid] = doc(this.fs, uid + "/" + room);
        if(participantList)
          updateDoc(roomDoc, j);
        else
          setDoc(roomDoc, j);
      }
      this.isMember = true;
    }
    //this.fs.app.automaticDataCollectionEnabled
    let userDocs = doc(this.fs, this.user.id+"/" + room);
    firstValueFrom(docData(userDocs)).then((docData) => {
      //console.log("data: ",docData);
      let i = 1;
      if(docData)
        while(docData[i]) i++;
      let j: {[x:string]: any} = {};
      j['' + i] = {message: content, time:serverTimestamp()};
      if(docData)
        updateDoc(userDocs, j);
      else
        setDoc(userDocs, j);
    })
    
//    let id = (await addDoc(this.userCollection, {General:{message: content, at: serverTimestamp()}})).id;
    //addDoc(room, {name: "1", path: id });
  }
  
  /* Not Symmeretic, wont work */
  AESCTR =  {
    genCounter(): Uint8Array{
      return window.crypto.getRandomValues(new Uint8Array(16));
    },
  
    getParams(counter: Uint8Array): AesCtrParams{
      return {name: "AES-CTR" ,counter: counter, length:64};
    },
    
    /*
    Get the encoded message, encrypt it
    */
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
    */
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
    */
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
    */
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
    */
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
    */
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

export class MessageChange{
  static readonly ADD = true;
  static readonly REMOVE = false;
  constructor(public m: Message, public addOrRemove: boolean){}
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