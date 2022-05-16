import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiaryPageRoutingModule } from './diary-routing.module';

import { DiaryPage } from './diary.page';
// import { IonicContextMenuModule } from 'ionic-context-menu';
import {ComponentsModule }  from '../../component/components.module'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    // IonicContextMenuModule,
    DiaryPageRoutingModule
  ],
  declarations: [DiaryPage]
})
export class DiaryPageModule {}
