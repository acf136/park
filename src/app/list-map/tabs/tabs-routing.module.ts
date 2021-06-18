import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      { path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' } //by default
    ]
  },
  { path: 'list-map/List', redirectTo: '/tabs/tab1' },
  { path: 'list-map/Map',  redirectTo: '/tabs/tab2' },
  { path: 'list-map/Config', redirectTo: '/config' },   // TODO : app/config/config.page - is a component, no module=>no routing
  { path: '',  redirectTo: '/tabs/tab1',  pathMatch: 'full' } //by default
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
