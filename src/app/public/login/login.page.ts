import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
// import { AngularFireDatabase, AngularFireList, AngularFireDatabaseModule } from '@angular/fire/database'
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/auth';

// mport { AngularFirestoreModule, AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import {  Router } from '@angular/router';
import Timestamp = firestore.Timestamp;
import { AuthenticationService } from '../../services/authentication.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FolderForReadings } from '../../services/tarot-cards.service';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';
  loggedIn: boolean;
  currentLoginName = '';

  // OneCardReadings : AngularFireList<any>;
  // myCardReadings : AngularFirestoreCollection<DocumentData>;


  constructor(public navCtrl: NavController,
              public db: AngularFirestore,
              private router: Router,
              private alertCtrl: AlertController,
              public afAuth: AngularFireAuth,
              private firestoreServe: FirestoreService,
              private realtimeDB: RealtimeDbService,
              private authService: AuthenticationService)
    {
      this.loggedIn = false;
    }


    async forgotPassword(passwordResetEmail) {
      // console.log('forgot password', this.username);
      try {
        await this.afAuth.sendPasswordResetEmail(this.username);
        window.alert('Password reset email sent, check your inbox.');
      }
      catch (error) {
        window.alert(error);
      }
    }


  ngOnInit() {
    // console.log('login on init');

    // });
    this.loggedIn = this.authService.isUserLoggedIn();

// look for auth errors
    this.authService.eventAuthError$.subscribe(data => {
      if (data.length > 0) {
        alert(data);
      }

    });

    this.authService.authenticationState.subscribe(state => {
      // console.log('login Auth changed:', state);
      this.loggedIn = state;

      const fbUsr = this.authService.getCurrentFBUser();
      // console.log('subscribe:  -> fb user', fbUsr);
      if (fbUsr != null) {
        this.currentLoginName = fbUsr.email;
      }
      // console.log('login code - user is logged in', this.loggedIn, this.currentLoginName, fbUsr);

    });
    const fbUser = this.authService.getCurrentFBUser();
    // console.log('pdf -> fb user', fbUser);
    if (fbUser != null) {
      this.currentLoginName = fbUser.email;
    }
    // console.log('login code - user is logged in', this.loggedIn, this.currentLoginName);

    // this.loggedIn = this.authService.isAuthenticated();
    // console.log('logged in', this.loggedIn);
  }

  ionViewDidEnter(){
    this.loggedIn = this.authService.isUserLoggedIn();
    const fbUser = this.authService.getCurrentFBUser();
    if (fbUser != null) {
      this.currentLoginName = fbUser.email;
    }
    // console.log('login code - user is logged in', this.loggedIn, this.currentLoginName);

  }

  async presentAlert(title: string, messge: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: title,
      message: messge,
      buttons: ['OK']
    });

    await alert.present();
  }

  goHome() {
    this.router.navigate(['tarot-deck']);   // ['tarot-deck']);

    // setTimeout(() => {}, 6000);
  }


  loginUser() {
    // if (this.username.length > 0) {
    //   if (/^[a-zA-Z0-9]+$/.test(this.username)) {
    //     // good
    //     // this.db.list('/chat'.push( { this.username});
    //     this.router.navigate(['tarot-deck']);
    //   }
    //   else {
    //     this.presentAlert('error', 'bad username');
    //   }
    // }

    // firstName: string;
    // lastName: string;
    // email: string;
    // userPW: string;
    // notes: string;

    const val = {
      firstName: '',
      lastName: '',
      notes: '',
      email: this.username,
      userPW: this.password,
    };
    // console.log('will try to login using', val);
    const theUser: firebase.User = this.authService.login(val);
    // console.log('login results', theUser);
    if (theUser !== null) {
      this.realtimeDB.LogUserIn(theUser);
    }

    // if (results == false) {
    //   // tell the user
    //   this.presentAlert("Login failed",  'bad combination of email and password?  Try again!');
    // }

    // this.loggedIn = this.authService.isAuthenticated();
    if (this.loggedIn) {
      // console.log('redirect after login');
    }
         // first let's reset everything - empty the cache so everything is correct
    this.realtimeDB.resetCache(); // forget what we knew
    this.firestoreServe.resetCache(); // forget what we knew
    this.realtimeDB.dummyLoadAll();   // this might kick start the ball
    this.router.navigate(['tarot-deck']);
  }


  logout() {
    // console.log('logout');
    this.authService.logout();
    this.realtimeDB.resetCache(); // forget what we knew
    this.firestoreServe.resetCache(); // forget what we knew
    this.realtimeDB.dummyLoadAll();
    // this.authService.setShownLandingPage(false);  // this will allow the landing page to appear
    // this.authService.setLandingUp(false);
    // this.navCtrl.back();

  }

  register() {
    this.router.navigate(['/register']);
  }
}
