import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NineRayPage } from './nine-ray.page';

const routes: Routes = [
  {
    path: '',
    component: NineRayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NineRayPageRoutingModule {}
