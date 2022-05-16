import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TarotCardDetailPageRoutingModule } from './tarot-card-detail-routing.module';
import { TarotCardDetailPage } from './tarot-card-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarotCardDetailPageRoutingModule
  ],
  declarations: [TarotCardDetailPage]
})
export class TarotCardDetailPageModule {}
