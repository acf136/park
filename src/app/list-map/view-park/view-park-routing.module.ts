import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewParkPage } from './view-park.page';

const routes: Routes = [
  {
    path: '',
    component: ViewParkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewParkPageRoutingModule {}
