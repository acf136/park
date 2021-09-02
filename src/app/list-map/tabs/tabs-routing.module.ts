import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/shared/auth/auth.guard';
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
      { path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' } //by default
    ]
  },
  { path: 'list-map/List', redirectTo: '/tabs/tab1' },
  { path: 'list-map/Map',  redirectTo: '/tabs/tab2' },
  { path: 'list-map/Leaflet',  redirectTo: '/tabs/tab3' },
  { path: 'parking/:id',
    loadChildren: () => import('../view-park/view-park.module').then( m => m.ViewParkPageModule)
  },
  { path: 'modify-park/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('../modify-park/modify-park.module').then( m => m.ModifyParkPageModule)
  },
  { path: 'config',
    loadChildren: () => import('../../config/config.module').then( m => m.ConfigPageModule)
  },
  { path: '',  redirectTo: '/tabs/tab1',  pathMatch: 'full' } //by default
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
