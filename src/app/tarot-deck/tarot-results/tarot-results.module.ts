import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarotResultsPageRoutingModule } from './tarot-results-routing.module';

import { TarotResultsPage } from './tarot-results.page';
import { ComponentsModule} from '../../component/components.module';

export { ComponentsModule }

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TarotResultsPageRoutingModule
  ],
  declarations: [TarotResultsPage]
})
export class TarotResultsPageModule {}
