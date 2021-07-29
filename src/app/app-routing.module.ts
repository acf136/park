import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TabsPageModule } from './list-map/tabs/tabs.module';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'login',           component: LoginComponent  },
  { path: 'registration',    component: RegistrationComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'tabs',  loadChildren: () => import('./list-map/tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'charts', loadChildren: () => import('./list-map/charts/charts.module').then( m => m.ChartsPageModule) },
  { path: '',  loadChildren: () => import('./list-map/tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
