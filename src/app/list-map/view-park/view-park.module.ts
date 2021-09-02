import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewParkPageRoutingModule } from './view-park-routing.module';

import { ViewParkPage } from './view-park.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewParkPageRoutingModule,
    TranslateModule
  ],
  declarations: [ViewParkPage]
})
export class ViewParkPageModule {}
