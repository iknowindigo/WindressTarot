import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiaryPage } from './diary.page';
import { DatePipe } from '@angular/common';
import { ComponentsModule} from '../../component/components.module';

export { ComponentsModule }

const routes: Routes = [
  {
    path: '',
    component: DiaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ComponentsModule
    ],
  exports: [RouterModule],
  providers: [
    DatePipe
  ]
})
export class DiaryPageRoutingModule {}
