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
  { path: '',  loadChildren: () => import('./list-map/tabs/tabs.module').then(m => m.TabsPageModule) },
  {
    path: 'view-park',
    loadChildren: () => import('./list-map/view-park/view-park.module').then( m => m.ViewParkPageModule)
  },
  {
    path: 'modify-park',
    loadChildren: () => import('./list-map/modify-park/modify-park.module').then( m => m.ModifyParkPageModule)
  },
  {
    path: 'config',
    loadChildren: () => import('./config/config.module').then( m => m.ConfigPageModule)
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
