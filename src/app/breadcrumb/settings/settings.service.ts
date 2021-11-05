import { Injectable } from '@angular/core';
import { Firestore,
  collection,
  CollectionReference,
  DocumentReference,
  DocumentData,
  docData,
  doc,
  setDoc,
updateDoc } from '@angular/fire/firestore';

import { firstValueFrom } from 'rxjs';

import { LoginService } from 'src/app/auth/login.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsDoc;
  private _fufilled: boolean = false;
  private _savedSettings: DocumentData = {};
  //Only rooms saved to server
  private rooms: string[] = [];
  //Includes rooms added to session only

  constructor(private fs: Firestore, private login: LoginService) {
    this.settingsDoc = doc(fs, login.id + "/settings");
    firstValueFrom(docData(this.settingsDoc))
      .then((setting) => {

        if(!setting){ //First run, populate Rooms with 'General'
          setDoc(this.settingsDoc, {rooms:['General']});
          this.rooms = ['General'];
          this._savedSettings['rooms'] = [... this.rooms];

        }else{
          console.log(setting);
          this._savedSettings['rooms']  = setting['rooms'];
          this.rooms = [... setting['rooms']];
        }
        this._fufilled = true;
      }
    );
  }

  getRooms(): Promise<string[]> | string[]{
    if(this._fufilled)
      return this.rooms;
    else
      return new Promise<string[]>((resolve) =>{
        const timer = setInterval(() => {
          if(this._fufilled){
            resolve(this.rooms);
            clearInterval(timer);
          }
        }, 100);
      });
  }
  storeRooms(rooms: string[]){
    updateDoc(this.settingsDoc, 'rooms', rooms);
  }
  appendRoom(room: string){
    updateDoc(this.settingsDoc,
      'rooms', this._savedSettings['rooms']
                = [...this._savedSettings['rooms'] , room]
    );
  }
  setName(name: string){
    updateDoc(this.settingsDoc,
      'publicName', this._savedSettings['publicName']
                      = name
    );
  }
  getName(): string{
    if(this._savedSettings['publicName'])
      return this._savedSettings['publicName'];
    else{
      return this.login.id as string;
    }
  }


}
