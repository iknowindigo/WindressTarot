import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TarotThrowPageRoutingModule } from './tarot-throw-routing.module';
import { TarotThrowPage } from './tarot-throw.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarotThrowPageRoutingModule
  ],
  declarations: [TarotThrowPage]
})
export class TarotThrowPageModule {}
