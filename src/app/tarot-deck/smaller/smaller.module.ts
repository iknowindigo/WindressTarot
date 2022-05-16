import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SmallerPageRoutingModule } from './smaller-routing.module';

import { SmallerPage } from './smaller.page';
// import { IonicContextMenuModule } from 'ionic-context-menu';
import {ComponentsModule }  from '../../component/components.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    // IonicContextMenuModule,
    SmallerPageRoutingModule
  ],
  declarations: [SmallerPage]
})
export class SmallerPageModule {}
