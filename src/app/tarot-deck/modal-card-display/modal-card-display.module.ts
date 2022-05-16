import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalCardDisplayPageRoutingModule } from './modal-card-display-routing.module';

import { ModalCardDisplayPage } from './modal-card-display.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalCardDisplayPageRoutingModule
  ],
  declarations: [ModalCardDisplayPage]
})
export class ModalCardDisplayPageModule {}
