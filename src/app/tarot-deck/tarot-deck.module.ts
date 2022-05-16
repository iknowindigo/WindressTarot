import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarotDeckPageRoutingModule } from './tarot-deck-routing.module';

import { TarotDeckPage } from './tarot-deck.page';

import { ComponentsModule} from '../component/components.module';
import { from } from 'rxjs';

export { ComponentsModule }

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TarotDeckPageRoutingModule
  ],
  declarations: [TarotDeckPage]
})
export class TarotDeckPageModule {}
