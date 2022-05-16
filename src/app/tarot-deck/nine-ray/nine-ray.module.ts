import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NineRayPageRoutingModule } from './nine-ray-routing.module';

import { NineRayPage } from './nine-ray.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NineRayPageRoutingModule
  ],
  declarations: [NineRayPage]
})
export class NineRayPageModule {}
