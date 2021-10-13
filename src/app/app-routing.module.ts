import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RequireLoggedInGuard } from './auth/require-logged-in.guard';
import { RequireLoggedOutGuard } from './auth/require-logged-out.guard';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { HelpComponent } from './breadcrumb/help/help.component';
import { RoomComponent } from './breadcrumb/room/room.component';
import { SettingsComponent } from './breadcrumb/settings/settings.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [RequireLoggedOutGuard]},
  {path: '',
    redirectTo: 'breadcrumb',
    pathMatch:'full',
    
  },
  {path: 'breadcrumb',
    component: BreadcrumbComponent,
    canActivate: [RequireLoggedInGuard],
    //canActivateChild: [RequireLoggedInGuard],
    children:[
      { path: '',         component: HelpComponent, pathMatch: 'full'},
      { path: 'settings', component: SettingsComponent },
      { path: ':roomID',  component: RoomComponent }
    ]
  },
  { path:'**',
    component: NotFoundComponent,
    canActivate: [RequireLoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
