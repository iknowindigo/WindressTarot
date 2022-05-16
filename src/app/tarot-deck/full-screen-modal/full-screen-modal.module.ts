import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FullScreenModalPageRoutingModule } from './full-screen-modal-routing.module';

import { FullScreenModalPage } from './full-screen-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FullScreenModalPageRoutingModule
  ],
  declarations: [FullScreenModalPage]
})
export class FullScreenModalPageModule {}
