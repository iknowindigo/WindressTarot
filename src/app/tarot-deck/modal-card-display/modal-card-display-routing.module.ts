import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalCardDisplayPage } from './modal-card-display.page';

const routes: Routes = [
  {
    path: '',
    component: ModalCardDisplayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalCardDisplayPageRoutingModule {}
