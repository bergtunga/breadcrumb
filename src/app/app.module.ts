import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { UserinfoComponent } from './breadcrumb/userinfo/userinfo.component';
import { RoomListComponent } from './breadcrumb/room-list/room-list.component';
import { RoomComponent } from './breadcrumb/room/room.component';
import { MessageComponent } from './breadcrumb/message/message.component';
import { SettingsComponent } from './breadcrumb/settings/settings.component';
import { NotFoundComponent } from './not-found/not-found.component';


import { environment } from 'src/environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Firestore,
  doc,
  onSnapshot,
  DocumentReference,
  docSnapshots,
  provideFirestore,
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence } from '@angular/fire/firestore';
import { 
  provideStorage,
  getStorage } from '@angular/fire/storage'
import { provideAuth, getAuth} from '@angular/fire/auth';

//  import { AngularFireModule } from '@angular/fire';
//  import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BreadcrumbComponent,
    UserinfoComponent,
    RoomListComponent,
    RoomComponent,
    MessageComponent,
    SettingsComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    //https://github.com/angular/angularfire/blob/master/docs/version-7-upgrade.md
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    
    //Temp
    provideFirestore(() => {
        const firestore = getFirestore();
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        enableIndexedDbPersistence(firestore);
        return firestore;
    }),
    //Production?
    //provideFirestore(() => getFirestore()),

    provideStorage(() => getStorage()),
    provideAuth(() => getAuth())
    // end firebase
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
