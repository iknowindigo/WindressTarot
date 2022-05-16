import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarotSocialPage } from './tarot-social.page';

const routes: Routes = [
  {
    path: '',
    component: TarotSocialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarotSocialPageRoutingModule {}
