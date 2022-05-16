import { Component, OnDestroy } from '@angular/core';    // ?? menuController
import { AngularFirestore } from '@angular/fire/firestore';

import { Platform, MenuController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Observable, Subject } from 'rxjs';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FolderForReadings } from './services/tarot-cards.service';
import { LandingPageComponent } from '../app/component/landing-page/landing-page.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  items: Observable<any[]>;
  constructor(
    firestore: AngularFirestore,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthenticationService,
    private router: Router,
    private tarotCardService: TarotCardsService,
    private modalCtrl: ModalController,
    // private menuCtrl, MenuController
  ) {
    // this.items = firestore.collection('items').valueChanges();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.authService.authenticationState.subscribe(state => {
        // console.log('Auth changed:', state);
        // if (state) {
        //   this.router.navigate(['tarot-deck']);
        // }
        // else {
        //   this.router.navigate(['login']);
        // }
      });
    });
  }

  ngOnDestroy() {
    this.authService.authenticationState.unsubscribe();
  }



  onProfile() {
    const isIn = this.checkIfUserLoggedIn();
    if (!isIn) {
      return; // can't do anything unless logged in
    }
    // console.log('profile clicked');
    this.authService.setShownLandingPage(true); // this will prevent the landing page from jumping up
    this.router.navigate(['profile']);
  }

  onFriends() {
    const isIn = this.checkIfUserLoggedIn();
    if (!isIn) {
      return; // can't do anything unless logged in
    }
    // console.log('make friends');
    this.authService.setShownLandingPage(true); // this will prevent the landing page from jumping up
    this.router.navigate(['friends']);
  }

  onDiary() {
    const isIn = this.checkIfUserLoggedIn();
    if (!isIn) {
      return; // can't do anything unless logged in
    }    // this.menuCtrl.close(); // was crashing
    this.authService.setShownLandingPage(true); // this will prevent the landing page from jumping up
    this.tarotCardService.setCurrentScreenWidth(screen.width);
    // console.log('diary - which way to go', screen.width, screen);
    // if (screen.width < 601) {
    //     // console.log('to smaller results');
    //     this.router.navigateByUrl('smaller');  // 'results')
    //   } else {
    //     // console.log('to diary');
    //     this.router.navigateByUrl('diary');
    //   }
    this.router.navigateByUrl('smaller');   // for now - just keep smaller
    // this.router.navigate(['diary']);
  }

  onTarotThrow() {
    const isIn = this.checkIfUserLoggedIn();
    if (!isIn) {
      return; // can't do anything unless logged in
    }
    this.authService.setShownLandingPage(true); // this will prevent the landing page from jumping up
    // console.log('Tarot Throw');
    this.router.navigate(['tarot-deck']);
  }

  logInOut() {
    // console.log('log in');
    this.authService.setShownLandingPage(true); // this will prevent the landing page from jumping up
    this.router.navigate(['login']);
  }

  checkIfUserLoggedIn(): boolean {
    const myUser = this.authService.getCurrentFBUser();
    const loggedIn = myUser != null;
    // console.log('checked login', loggedIn);
    if (!loggedIn) {
      this.authService.setLandingUp(false);
      this.authService.setShownLandingPage(false);
      this.showLandingPage();
    }
    return loggedIn;
  }



  async presentCommentEditor(dataToShow: any) {
    const done = this.authService.getShownLandingPage();
    // console.log('calling LandingPageComponent', dataToShow);
    if (!done) {
      const modal = await this.modalCtrl.create({
        component: LandingPageComponent,
        cssClass: 'landingModal',  // 'my-modal',
        // buttons: [ {
        //   text: 'close',
        //   role: 'cancel',
        //   icon: 'close',
        //   handler: () => { console.log('canceled clicked');}
        // }]
        componentProps: { dataToShow }
      });
      return await modal.present();
    }
  }

showLandingPage() {
  // worried that navigation needs to close modal dialog before starting...
  // console.log('here to show landing');
  const data = {
    throw: 'hi',
    throwID: '' // nothing yet
  };
  // console.log('here to edit', data);
  this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
    // console.log(res);
  });
}
}

