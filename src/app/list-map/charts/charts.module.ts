import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ChartsPageRoutingModule } from './charts-routing.module';
import { ChartsPage } from './charts.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsPageRoutingModule,
    TranslateModule
  ],
  declarations: [ChartsPage]
})
export class ChartsPageModule {}
