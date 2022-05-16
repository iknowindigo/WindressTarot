import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmallerPage } from './smaller.page';

const routes: Routes = [
  {
    path: '',
    component: SmallerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmallerPageRoutingModule {}
