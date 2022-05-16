import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarotResultsPage } from './tarot-results.page';

const routes: Routes = [
  {
    path: '',
    component: TarotResultsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarotResultsPageRoutingModule {}
