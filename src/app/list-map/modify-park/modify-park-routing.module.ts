import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModifyParkPage } from './modify-park.page';

const routes: Routes = [
  {
    path: '',
    component: ModifyParkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModifyParkPageRoutingModule {}
