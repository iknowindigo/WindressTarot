import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarotThrowPage } from './tarot-throw.page';

const routes: Routes = [
  {
    path: '',
    component: TarotThrowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarotThrowPageRoutingModule {} 
