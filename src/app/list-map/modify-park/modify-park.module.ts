import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModifyParkPageRoutingModule } from './modify-park-routing.module';

import { ModifyParkPage } from './modify-park.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModifyParkPageRoutingModule
  ],
  declarations: [ModifyParkPage]
})
export class ModifyParkPageModule {}
