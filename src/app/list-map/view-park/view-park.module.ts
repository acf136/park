import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewParkPageRoutingModule } from './view-park-routing.module';

import { ViewParkPage } from './view-park.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewParkPageRoutingModule
  ],
  declarations: [ViewParkPage]
})
export class ViewParkPageModule {}
