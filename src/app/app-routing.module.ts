import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { ComponentsModule } from './component/components.module';

export { ComponentsModule }

const routes: Routes = [
  // {  path: '', redirectTo: 'tarot-deck', pathMatch: 'full'  },
  {  path: '', redirectTo: 'tarot-deck', pathMatch: 'full'  },
  { path: 'throw', loadChildren: './tarot-deck/tarot-throw/tarot-throw.module#TarotThrowPageModule'},
  { path: 'tarot-results', loadChildren: './tarot-deck/tarot-results/tarot-results.module#TarotResultsPageModule'},
  { path: 'diary', loadChildren: './tarot-deck/diary/diary.module#DiaryPageModule'},
  { path: 'smaller', loadChildren: './tarot-deck/smaller/smaller.module#SmallerPageModule'},
  { path: 'login', loadChildren: './public/login/login.module#LoginPageModule'},
  { path: 'register', loadChildren: './public/register/register.module#RegisterPageModule'},
  { path: 'admin', loadChildren: './tarot-deck/admin/admin.module#AdminPageModule'},
  { path: 'nineRay', loadChildren: './tarot-deck/nine-ray/nine-ray.module#NineRayPageModule'},
  { path: 'about', loadChildren: './tarot-deck/about/about.module#AboutPageModule'},
  { path: 'intro', loadChildren: './tarot-deck/intro/intro.module#IntroPageModule'},
  { path: 'friends', loadChildren: './tarot-deck/friends/friends.module#FriendsPageModule'},
  { path: 'explore', loadChildren: './tarot-deck/explore/explore.module#ExplorePageModule'},
  { path: 'dashboard', loadChildren: '../app/members/dashboard/dashboard.module#DashboardPageModule'},
  {
    path: 'members',
    canActivate: [AuthGuardService],
    loadChildren: './members/member-routing.module#MemberRoutingModule'
  },
  {
    path: 'tarot-deck',
    children: [
      {
        path: '',
        loadChildren: () => import('./tarot-deck/tarot-deck.module').then( m => m.TarotDeckPageModule)
      },
      {
        path: ':cardId',
        loadChildren: () => import('./tarot-deck/tarot-card-detail/tarot-card-detail.module').then( m => m.TarotCardDetailPageModule)
      },
    ]
   },
  {
    path: 'modal-card-display',
    loadChildren: () => import('./tarot-deck/modal-card-display/modal-card-display.module').then( m => m.ModalCardDisplayPageModule)
  },
  {
    path: 'tarot-social',
    loadChildren: () => import('./tarot-social/tarot-social.module').then( m => m.TarotSocialPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'main-page',
    loadChildren: () => import('./tarot-games/main-page/main-page.module').then( m => m.MainPagePageModule)
  },
  {
    path: 'memory',
    loadChildren: () => import('./tarot-games/memory/memory.module').then( m => m.MemoryPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ComponentsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
