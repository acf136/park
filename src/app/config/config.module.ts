import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ConfigPageRoutingModule } from './config-routing.module';
import { ConfigPage } from './config.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ConfigPageRoutingModule,
    TranslateModule
  ],
  declarations: [ConfigPage]
})
export class ConfigPageModule {}
