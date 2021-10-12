import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RequireLoggedInGuard } from './auth/require-logged-in.guard';
import { RequireLoggedOutGuard } from './auth/require-logged-out.guard';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [RequireLoggedOutGuard]},
  {path: '',
    redirectTo: 'breadcrumb',
    pathMatch:'full',
    
  },
  {path: 'breadcrumb',
    component: BreadcrumbComponent,
    canActivate: [RequireLoggedInGuard]
  },
  { path:'**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
