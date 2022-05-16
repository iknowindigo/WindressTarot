import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarotCardDetailPage } from './tarot-card-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TarotCardDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarotCardDetailPageRoutingModule {}
