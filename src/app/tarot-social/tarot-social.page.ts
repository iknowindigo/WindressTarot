
import { Component, OnInit, NgZone, OnDestroy, OnChanges, DoCheck } from '@angular/core';
import { TarotCard } from '../tarot-deck/tarotCard.model';  // 'tarotCard.model';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FolderForReadings } from '../services/tarot-cards.service';
import { SpiritualServiceService } from '../services/spiritual-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService, UserData } from '../services/firestore.service';
import { AuthenticationService } from '../services/authentication.service';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage, CommentBadgeInfo } from '../services/realtime-db.service'; // 9-25-20
// import { YoutubePipe } from 'src/app/youtube.pipe'
import { HttpClientModule, HttpClient } from '@angular/common/http';
// import {ViewController} from ‘ionic-angular’;
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, ModalController, Platform, iosTransitionAnimation } from '@ionic/angular';
import { AnimationController } from '@ionic/angular';
import { interval } from 'rxjs';
import { LandingPageComponent } from '../component/landing-page/landing-page.component';
import { ChatItemComponent } from '../component/chat-item/chat-item.component';
import { DatePipe } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../component/popover-menu/popover-menu.component';  // '../popover-menu/popover-menu.component';



@Component({
  selector: 'app-tarot-social',
  templateUrl: './tarot-social.page.html',
  styleUrls: ['./tarot-social.page.scss'],
})

export class TarotSocialPage implements OnInit {
  chatText: string;
  displayName: string;
  loggedIn: boolean;
  user: firebase.User;
  shownLandingPage: boolean;
  userDataList: UserData[];
  allMessages: ChatMessage[];
  allUserMessages: UsersMsg[];
  myMessages: DisplayMessage[];
  anItem: string;
  public apple: string;
  public wID: string[];
  myThrows: TarotCardsInThrow[];    // aTarotThrow[];
  favoriteFolders: FolderForReadings[];
  // countOfAllReadings: number;
  readingsProcessed: boolean;
  myFriends: UserData[];
  freshenText: string;
  friendRequests: UserData[];
  numFriendRequests: number;
  commentBadgeInfo: CommentBadgeInfo[];
  numBadgeComments: number;
  loggedLogIn: boolean; // try to add record for last login time
  userIsAdmin: boolean;
  iAmMe: boolean; // debug mode
  socialReady: boolean;
  // forceScreenUpdate: string;

  constructor(
    private authService: AuthenticationService,
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
    private realtimeDB: RealtimeDbService,
    public datepipe: DatePipe,
    private tarotCardService: TarotCardsService,
    private router: Router,
    platform: Platform,
    public popoverController: PopoverController,
    )
  {
    // console.log('constructor for social');
    this.socialReady = false;
    this.iAmMe = false;
    this.userIsAdmin = false;
    this.loggedLogIn = false;
    this.myFriends = [];
    this.commentBadgeInfo = [];
    this.numBadgeComments = 0;
    // this.countOfAllReadings = 0;
    // this.forceScreenUpdate = '';
    this.friendRequests = [];
    this.numFriendRequests = 0;
    this.readingsProcessed = false;
    this.chatText = '';
    this.shownLandingPage = false;
    this.userDataList = [];
    this.allMessages = [];
    this.favoriteFolders = [];
    // this.allUserMessages = [];
    this.myMessages = [];
    this.apple = 'Mac';
    this.wID = [];
    this.myThrows = [];
    this.wID.push('a');
    // this.wID.push('b');
    // this.wID.push('c');
    // this.wID.push('d');
    // this.wID.push('e');
    // this.wID.push('f');
    this.freshenText = '';
  }

  findMyMetaData(user: firebase.User) {
    if (this.userDataList.length) {
      // console.log('find my metadata', user.uid);
      this.userDataList.forEach((usr) => {
        // console.log('user match?', usr.userID, user.uid);
        if (usr.userID === user.uid) {
          // console.log('found meta data', usr);
          this.authService.setMyUserMetadata(usr);
        }
      });
    }
  }

  ionViewDidLeave() {
    // console.log('social - ionViewDidLeave');
    this.realtimeDB.stopWatchChat();  // stop watching
    // this.authService.authenticationState.unsubscribe();
    // this.firestoreService.usersReadyState.unsubscribe();
    // this.realtimeDB.friendsRequestState.unsubscribe();
    // this.realtimeDB.friendsReadyState.unsubscribe();
    // this.firestoreService.readingsReadyState.unsubscribe();
    // this.realtimeDB.allMessagesReadyState.unsubscribe();
    // this.realtimeDB.commentReadState.unsubscribe();
    // this.firestoreService.ForeignTarotReadingsReadyState.unsubscribe();
  }

  // ngOnDestroy() {
  //   console.log('Social tarot page: ngOnDestroy');
  // }


  ngOnInit() {
      // check out users

      // console.log('on init - list users');
      // this.authService.listAllUsers();  // just look for now
      // this.callDbForReadings(); // get that working
      // this.realtimeDB.dummyLoadAll();  // 10-10 new approach - this method will start everything moving
      
      this.tryToRefresh();  // 5-15-22 1-18-21

      this.realtimeDB.friendsReadyState.subscribe(stateFriendsReady => {
         console.log('social friend list complete', stateFriendsReady);
        if (stateFriendsReady > 0 && this.user != null && this.user.uid != null) {
          this.myFriends = this.realtimeDB.getMyFriends(this.user.uid);
          console.log('my social friends', this.myFriends.length, this.myFriends);
          this.freshenText = this.myFriends.length.toString() + ' friend';
          this.realtimeDB.friendsRequestState.subscribe(stateFR => {
            // console.log('friend requests', stateFR);
            if (stateFR > 0) {
              this.friendRequests = this.realtimeDB.getMyFriendRequests(this.user.uid);
              // console.log('social friend requests', this.friendRequests, this.friendRequests.length);
              this.numFriendRequests = this.friendRequests.length;
            }
          });
        }
      });

      // 1/11/21 commented out this call - too many reads
      this.firestoreService.getUsers(); // this should trigger get a list of users
      this.firestoreService.usersReadyState.subscribe(stateUsersReady => {
        this.userDataList = this.firestoreService.getListOfUsers();
        if (this.userDataList.length && this.user != null) {
          // 1/11/21 -- commented out this call
          // this.firestoreService.getUsers(); // this should trigger get a list of users
          this.findMyMetaData(this.user);
        }

        // console.log('subscribe users', stateUsersReady, this.userDataList);
        if (this.allMessages.length > 0
          // && this.allUserMessages.length > 0
          && this.readingsProcessed      // 10-1
          && this.userDataList.length > 0) {
        // console.log('ready to crunch messages');
        // this.crunchMessages();
        }
        else {
          // console.log('waiting....',
          // this.allMessages.length, this.readingsProcessed, this.userDataList.length); // this.allUserMessages.length,
        }
      });

      this.firestoreService.readingsReadyState.subscribe(stateReadingsReady => {
        this.readingsProcessed = true;
        // wait for readings to be done
        if (stateReadingsReady > 0) {
          // this.countOfAllReadings = this.firestoreService.getCountOfAllReadings();
          if (this.allMessages.length > 0
            // && this.allUserMessages.length > 0
            && this.readingsProcessed      // 10-1
            && this.userDataList.length > 0) {
              console.log('ready to crunch messages', this.myMessages);
           
            this.crunchMessages();
        //     this.tryToRefresh();  // 1-18-21
          }
          else {
            // console.log('waiting....',
            // this.allMessages.length,  this.readingsProcessed, this.userDataList.length);  // this.allUserMessages.length,
          }
        }
      });

      // this.realtimeDB.watchChat();  // set up a watch
      this.realtimeDB.allMessagesReadyState.subscribe(stateAllMessagesReady => {
        if (stateAllMessagesReady > 0) {
          this.realtimeDB.collectAllCommentsForPosts(); // kick it off
        }
        this.allMessages = this.realtimeDB.getAllMessages();
      // this.forceScreenUpdate = 'wait...';
        console.log('chat subscribe', this.allMessages, this.readingsProcessed, this.userDataList.length);
        if (this.allMessages.length > 0
        // && this.allUserMessages.length > 0
        && this.readingsProcessed      // 10-1
        && this.userDataList.length > 0) {
        // console.log('ready to crunch messages');
        this.crunchMessages();
        // this.forceScreenUpdate = '...';
      }
      else {
        // console.log('waiting....',
        // this.allMessages.length,  this.readingsProcessed, this.userDataList.length);  // this.allUserMessages.length,
      }
      });
      // 10-28 - new level of complexity - get replies to posts and stitch them in
      // worried about doing this too many times - but hope to figure that out at some point
      this.realtimeDB.commentReadState.subscribe(stateComments => {
        // console.log('subscribe comments', stateComments);
        if (stateComments > 0) {
          // console.log('comments ready...', stateComments);
          this.crunchMessages();
          // this.realtimeDB.collectCommentsForUser(this.user.uid);  // ?? added 12-10-10
          this.realtimeDB.stitchCommentsToPosts();  // I'll probably rework this - but this is a first attempt
          this.freshenText += ' ';  // try to force update?
        }
      });

      this.firestoreService.SocialReadingReadyState.subscribe(stateSR => {
        if (stateSR > 0) {
          this.socialReady = true;
          console.log('social readings bumped - ready to go', stateSR);
        }
      })

      this.realtimeDB.badgeReadyState.subscribe(badgeInfo => {
        // this.crunchMessages();
        this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
        this.numBadgeComments = this.commentBadgeInfo.length;
        // console.log('badge ready state', badgeInfo, this.commentBadgeInfo.length);
      });

        // if we had to harvest foreign (other users) readings - that happens after much time goes by
      // // let me try to reset everything if that was the case
      // this.firestoreService.ForeignTarotReadingsReadyState.subscribe( state => {
      //   console.log('oops - just finished processing foreign readings', state);
      //   if (this.allMessages.length > 0
      //     // && this.allUserMessages.length > 0
      //     && this.readingsProcessed      // 10-1
      //      && this.userDataList.length > 0) {
      //       // this.crunchMessages();  // ?? back in 11-23
      //       this.tryToRefresh();
      //   }
      // });


      this.authService.authenticationState.subscribe(state => {
      // console.log('main app Auth changed:', state);
      this.loggedIn = state;
      if (this.loggedIn === true) {
        this.user = this.authService.getCurrentFBUser();  // back door
        this.displayName = '??';  // trying to force update?
        this.displayName = this.user.email;
        if (this.user.email.toLowerCase() === 'iknowindigo@gmail.com') {
          this.iAmMe = true;
          // console.log('turning on debug mode');
        }
        // console.log('we are in', this.user);
        this.callDbForReadings();
        // trigger readings

           // let's 'login' and make sure our profile is updated
        if (this.user != null) {
          this.authService.LogUserIn(this.user);
          if (!this.loggedLogIn) {
            this.loggedLogIn = true;
            this.realtimeDB.LogUserIn(this.user);
          }
        }
        // console.log('fixed login email?', this.user, this.user.email)
      } else {
        // I think this is where we do the landing page??
        this.shownLandingPage = this.authService.getShownLandingPage(); // I'm using service now to pass data
        if (this.shownLandingPage === false) {
          // alert('landing page coming!')
          // ok- found that we need to wait - first time the user isnt logged in, but in time we find he is
          // setTimeout(this.checkIsUserLoggedIn, 9000);
          setTimeout( () => {
            // console.log('waited a bit', this.authService)
            this.user = this.authService.getCurrentFBUser();  // back door
            // console.log('after waiting - user', this.user);
            if (this.user == null) {
              // let's try again - I'm worried about a slow network
              setTimeout( () => {
                this.user = this.authService.getCurrentFBUser();  // back door
                this.shownLandingPage = this.authService.getShownLandingPage(); // I'm using service now to pass data
                // console.log('2nd wait?', this.user);
                if (this.user == null && !this.shownLandingPage) {
                  this.showLandingPage();
                  this.shownLandingPage = true;
                }
              }, 6000);    // 9000);
              // this.showLandingPage();
            }
            // callback
          }, 2000); // wait 6 seconds - then see if user is logged in
          // see if we're in
          // this.showLandingPage();
          // console.log('landing page coming?');
        }
        // this.shownLandingPage = true;
      }
    });
  }

ionViewDidEnter() {
    // console.log('view did enter');
    this.displayName = 'Welcome Guest - you are not logged in';
    this.loggedIn = this.authService.isUserLoggedIn();
    this.user = this.authService.getCurrentFBUser();  // back door
    this.displayName = 'You need to log in or register';  // trying to force update?
    if (this.user != null) {
      this.displayName = this.user.email;
    }

    this.userIsAdmin = this.authService.isUserAdmin();  // g.s.  7-3-20

    

    // console.log('home - logged in 1', this.loggedIn);
  }

  // 1-26-21 see if this keeps us up to date
  ngDoCheck() {
    this.myMessages = this.realtimeDB.getMyMessages();

    
   
//     let stuff = this.realtimeDB.getMyMessages();
//     if (stuff.length > 0) {
//       // trying not to erase messages that we already had
//       this.myMessages = stuff;
//  //     console.log('on changes', this.myMessages.length, this.commentBadgeInfo.length)
//     } else {
//       console.log('checked and found nothing - current...', this.myMessages.length)
//     }
    this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
    
  }

  goDashBoard() {
    // console.log('dashboard');
    this.router.navigateByUrl('dashboard');
  }

goLibrary() {
    // this.router.navigate(['diary']);
    // don't allow command if not logged in
    const areWeIn = this.checkIfLoggedIn();
    if (!areWeIn) {
      return;
    }
    this.tarotCardService.setCurrentScreenWidth(window.innerWidth);
    // console.log('diary - which way to go', screen.width, screen, window.innerWidth, window);
    if (window.innerWidth < 1100) {
        // console.log('to smaller results');
        this.router.navigateByUrl('smaller');  // 'results')
      } else {
        // console.log('to diary');
        this.router.navigateByUrl('diary');
      }
  }

  // rather than wait for diary to first call db for readings data - let's do it up front
  // that way the data is there ready and waiting
callDbForReadings() {
    this.authService.getFirebaseUser().then((usr) => {
      this.user = usr;
      // if the user isn't logged in - then we're done - nothing to get
      // console.log('is user logged in?', this.user);
      if (this.user != null && this.user.email.length > 4) {
        // ok - let's take a chance and get the data from the db
        // this.firestoreService.getThrowCollectionFromDb().then ( data => {
        this.firestoreService.CreateListOfReadings().then ( data => {

          // this.myThrows = data; // Promise.resolve(data);
          this.myThrows = this.firestoreService.getAllReadings();
           console.log('view did enter resolving - old way to get readings', this.myThrows, data);
          // // just going to skip further processing - I just want the firestore service to have the data ready
          // this.firestoreService.getFolderList().then( result => {
          //   // console.log('folder data', result, this.firestoreService.getPublicFolderList())
          // });
          // this.firestoreService.FolderListReadyState.subscribe(state => {
          //   // console.log('folder list finally ready', state);
          //   if (state > 0) {
          //     this.favoriteFolders = this.firestoreService.favoriteFolders;
          //     // console.log('heres the list', this.favoriteFolders);
          //     // console.log('here is list', this.favoriteFolders)
          //   }
          // });
        });  // end of get throws

      }
    }); // end of get user
  }
goHome() {
    this.router.navigate(['/']);
  }

  goFriends() {
    const areWeIn = this.checkIfLoggedIn();
    if (!areWeIn) {
      return;
    }
    // console.log('go friends');
    this.router.navigate(['friends']);
  }

  goReadings() {
    const areWeIn = this.checkIfLoggedIn();
    if (!areWeIn) {
      return;
    }
    // console.log('Tarot Throw');
    document.location.href = 'https://windresstarot.web.app/';
    // window.open('https://windresstarot.web.app/', '_blank');
    // window.location.href = 'https://windresstarot.web.app/';
    // this.router.navigate( ['tarot-deck']);
  }

  goExplore() {
    const areWeIn = this.checkIfLoggedIn();
    if (!areWeIn) {
      return;
    }
    // console.log('explore');
    this.router.navigate(['explore']);
  }

  goProfile() {
    const areWeIn = this.checkIfLoggedIn();
    if (!areWeIn) {
      return;
    }
    // console.log('profile');
    this.router.navigate(['profile']);
  }

  // here once we finishe a deeper call to get foreign tarot readings
  // try to freshen the data to force an update?
tryToRefresh() {
    console.log('social - try to refresh');
    // const len = this.myMessages.length; // remove and recreate?
    // for (let i = 0; i < len; i++) {
    //   this.myMessages.pop();
    // }
   
    const userID = (this.user === null || this.user === undefined) ? '' : this.user.uid;
   // const userID = '5HGPCvdp2ZSq5LaMiPVrkqqdA0C2';  // 5-14-22 debug - this is Jerry's ID
     this.firestoreService.getUsers();
    // this.realtimeDB.crunchMessages(userID); // should be ok
    if (userID.length > 1 && this.commentBadgeInfo.length === 0 && this.socialReady === true) {
      // console.log('refresh messages', this.user, userID);
      this.realtimeDB.tryToRefreshMessages(userID);
      this.myMessages = this.realtimeDB.getMyMessages();
      this.realtimeDB.collectCommentsForUser(this.user.uid);
      this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
    }
   
   
    this.numBadgeComments = this.commentBadgeInfo.length;
    // console.log('social - have badge comments', this.commentBadgeInfo.length, this.commentBadgeInfo);
  }

crunchMessages() {
    // this.realtimeDB.friendsReadyState.subscribe(stateFriendsReady => {
    //   // console.log('social friend list complete', stateFriendsReady);
      if (this.user != null && this.user.uid != null) {
        this.myFriends = this.realtimeDB.getMyFriends(this.user.uid);
        // console.log('my social friends', this.myFriends.length, this.myFriends);
      }
    //     this.freshenText = this.myFriends.length.toString() + ' friend';

    //     this.realtimeDB.friendsRequestState.subscribe(stateFR => {
    //       // console.log('friend requests', stateFR);
    //       if (stateFR > 0) {
    //         this.friendRequests = this.realtimeDB.getMyFriendRequests(this.user.uid);
    //         // console.log('social friend requests', this.friendRequests, this.friendRequests.length);
    //         this.numFriendRequests = this.friendRequests.length;
    //       }
    //     });
    //   }
    // });
    // goibng to hand this off to service
    // console.log('ready to crunch', this.user);
    const userID = (this.user === null || this.user === undefined) ? '' : this.user.uid;
    //const userID = '5HGPCvdp2ZSq5LaMiPVrkqqdA0C2';  // 5-14-22 debug - this is Jerry's ID
    if (this.socialReady === true) {
      console.log('social - calling cruncher');
      this.realtimeDB.crunchMessages(userID); // should be ok

      this.myMessages = this.realtimeDB.getMyMessages();
    }
    else {
      console.log('waiting for social ready');
      // 5/13/22 let's see what happens anyway :()
      this.realtimeDB.crunchMessages(userID); // should be ok

      this.myMessages = this.realtimeDB.getMyMessages();
    }
    
    // this.debugShowMessages();
    // console.log('messages crunched', this.myMessages);
  }

handleTextChange() {
    // console.log('chat', this.chatText);
    // write this to the real time database - for now keep it simple, but in time, this will be the heart of chat
  }

  debugShowMessages() {
    // here just to dump messages 
    if (this.myMessages.length > 0) {
      this.myMessages.forEach(msg => {
        console.log('msg', msg.messageType, msg.messageText, msg.userName, msg.tarotThrowID);
      })
    }
  }

async commentsMade(eve) {
    // console.log('user clicked show comments', this.numBadgeComments, this.commentBadgeInfo);
    const menuName = 'showPostComments';
    // we don't respond to menu click - it will reroute if user clicks on it
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
        },
        data: menuName  // 'abc'
      },
      event: eve,
      mode: 'ios',
      // translucent: true
    });
    await popover.present();
  }

async showFriendRequests(eve) {
    // console.log('user clicked show friends', this.friendRequests);
    const menuName = 'showFriendRequests';
    // we don't respond to menu click - it will reroute if user clicks on it
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
          this.goFriends();
        },
        data: menuName  // 'abc'
      },
      event: eve,
      mode: 'ios',
    });
    // popover.onWillDismiss().then( () => {
    //   alert('will dismiss');
    // });
    // popover.onDidDismiss().then( () => {
    //   alert('did dismiss');
    // })
    await popover.present();
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

async showLandingPage() {
    // worried that navigation needs to close modal dialog before starting...
    // console.log('here to show landing', this.shownLandingPage);
    const data = {
      throw: 'hi',
      throwID: '' // nothing yet
    };
    // console.log('here to edit', data);
    const isUp = this.authService.getLandingUp();
    if (isUp) {
      return;
    }
    if (this.shownLandingPage === false) { // someone may have clicked login already
      this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
      // console.log(res);
    });
    }
  }

sendChat() {
    // console.log('send chat', this.chatText, this.user.uid);
    if (this.user != null) {
     
      const chatter = this.chatText.trim();
      if (chatter.length > 0) {
        this.playEnterKeySound();
        this.realtimeDB.writeRTDB(this.chatText, this.user.uid, 'friends'); // 10-10 adding sharing mode - for now default to friends
       
      }    else { console.log('empty string');}
      this.chatText = ''; // reset
    }
  }

  playEnterKeySound() {
    let audio = new Audio();
    audio.src = './assets/sounds/enterKey.mp3';
    audio.load();
    audio.play();
  }

checkIfLoggedIn(): boolean {
  // if user isn't logged in - just put up the landing page and disallow any actions
  this.user = this.authService.getCurrentFBUser();
  const loggedIn = this.user != null;
  // console.log('checked login', loggedIn);
  if (!loggedIn) {
      this.authService.setLandingUp(false);
      this.authService.setShownLandingPage(false);
      this.shownLandingPage = false;
      this.showLandingPage();
    }
  return loggedIn;
  }
}
