import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TarotDeckPage } from './tarot-deck.page';

const routes: Routes = [
  {
    path: '',
    component: TarotDeckPage
  },
  {
    path: 'tarot-throw',
    loadChildren: () => import('./tarot-throw/tarot-throw.module').then( m => m.TarotThrowPageModule)
  },
  {
    path: 'tarot-results',
    loadChildren: () => import('./tarot-results/tarot-results.module').then( m => m.TarotResultsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('../public/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('../public/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'diary',
    loadChildren: () => import('./diary/diary.module').then( m => m.DiaryPageModule)
  },
  {
    path: 'full-screen-modal',
    loadChildren: () => import('./full-screen-modal/full-screen-modal.module').then( m => m.FullScreenModalPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'nine-ray',
    loadChildren: () => import('./nine-ray/nine-ray.module').then( m => m.NineRayPageModule)
  },
  {
    path: 'smaller',
    loadChildren: () => import('./smaller/smaller.module').then( m => m.SmallerPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'friends',
    loadChildren: () => import('./friends/friends.module').then( m => m.FriendsPageModule)
  },
  {
    path: 'explore',
    loadChildren: () => import('./explore/explore.module').then( m => m.ExplorePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarotDeckPageRoutingModule {}
