import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from  '../../services/authentication.service';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage, CommentBadgeInfo } from '../../services/realtime-db.service'; // 9-25-20


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.page.html',
  styleUrls: ['./main-page.page.scss'],
})
export class MainPagePage implements OnInit {
  pathToMemory: string;
  displayName: string;
  user: firebase.User;
  loggedIn: boolean;
  iAmMe: boolean;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private realtimeDB: RealtimeDbService,
  ) {
    this.pathToMemory    = './assets/img/mem game.jpg'   //'./assets/img/memory.jpg';
   }

  ngOnInit() {
    this.authService.authenticationState.subscribe(state => {
      // console.log('main app Auth changed:', state);
      this.loggedIn = state;
      if (this.loggedIn === true) {
        this.user = this.authService.getCurrentFBUser();  // back door
        this.displayName = '??';  // trying to force update?
        this.displayName = this.user.email;
        if (this.user != null) {
          this.realtimeDB.LogGameUserIn(this.user);
        }
        // console.log('logged in', this.user, this.user.email)
      }
    });
  }

  goExplore() {
    // console.log('explore');
    this.router.navigate(['explore']);
  }
  goHome() {
    
    this.router.navigate(['/']);
  }

  goMemory() {
    // first game
    this.router.navigate(['memory']);
  }
}
