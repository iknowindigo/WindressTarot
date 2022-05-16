import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarotSocialPageRoutingModule } from './tarot-social-routing.module';
import { ComponentsModule} from '../component/components.module';

import { TarotSocialPage } from './tarot-social.page';

export { ComponentsModule };

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TarotSocialPageRoutingModule
  ],
  declarations: [TarotSocialPage]
})
export class TarotSocialPageModule {}
