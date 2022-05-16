import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullScreenModalPage } from './full-screen-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FullScreenModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullScreenModalPageRoutingModule {}
