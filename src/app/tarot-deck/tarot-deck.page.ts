import { Component, OnInit, NgZone } from '@angular/core';
import { TarotCard } from './tarotCard.model';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FolderForReadings } from '../services/tarot-cards.service';
import { SpiritualServiceService } from '../services/spiritual-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService, UserData } from '../services/firestore.service'
import { AuthenticationService } from '../services/authentication.service';
// import { YoutubePipe } from 'src/app/youtube.pipe'
import { HttpClientModule, HttpClient } from '@angular/common/http';
// import {ViewController} from ‘ionic-angular’;
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { AnimationController } from '@ionic/angular';
import { interval } from 'rxjs';
import { LandingPageComponent } from '../component/landing-page/landing-page.component';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage, CommentBadgeInfo, BadgeNotifyInfo } from '../services/realtime-db.service'; // 9-25-20
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../component/popover-menu/popover-menu.component';  // '../popover-menu/popover-menu.component';

@Component({
  selector: 'app-tarot-deck',
  templateUrl: './tarot-deck.page.html',
  styleUrls: ['./tarot-deck.page.scss'],
})
export class TarotDeckPage implements OnInit {
  tarotDeck: TarotCard[];
  spiritualQuotes: string[] = [];
  // youtubeLink: SafeResourceUrl;  // string;
  selectedSetOfCards: TarotCard[];
  readingName: string;
  loggedIn: boolean;
  user: firebase.User;
  // reLoadNeeded : boolean = false;
  displayName: string;
  // debug : string = "debug";
  outtakeURL: string;
  userIsAdmin: boolean = false;
  beforeReadingModal : any;
  fadeAnimation : any;  // Animation;
  fadeUpAnimation : any;
  cardFlyAnimation : any;
  cardFlyX : any;
  pathToOneCard : string;
  pathToThreeCards : string;
  pathToPyramid: string;
  pathToDiary: string;
  pathToShare: string;
  pathToExplore: string;
  pathToMemory: string;
  nineRayReading: string;
  cardsForAnimation: TarotCard[]; // will be random...
  myIterator: any;
  thisRandomCard: TarotCard;
  thisRandomCard2: TarotCard;
  myThrows: TarotCardsInThrow[];    // aTarotThrow[];
  favoriteFolders: FolderForReadings[];
  actionTimer: any;  // detect user activity
  changeImageTimer : any;
  boundFly1: any;
  boundFly2: any;
  // boundChangeImage : any;
  // boundGoInactive :any;
  bUserIsActiveNow: boolean;
  domCard1Element: any;
  domCard2Element: any;
  shownLandingPage: boolean;
  iAmMe: boolean; // debug mode
  numFriendRequests: number;
  numBadgeComments: number;
  myFriends: UserData[];
  freshenText: string;
  friendRequests: UserData[];
  commentBadgeInfo: CommentBadgeInfo[];
  userDataList: UserData[];
  allMessages: ChatMessage[];
  readingsProcessed: boolean;
  myMessages: DisplayMessage[];
  // myBadgeNotifications: BadgeNotifyInfo[];
  bNewBadgeWatch: boolean;
  socialReady: boolean; // 1-18
  bclickedOnBadge: boolean; // 2-12

  constructor(
    private modalCtrl: ModalController,
    private tarotCardService: TarotCardsService,
    private firestoreService: FirestoreService,
    private spiritualQuoteService: SpiritualServiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private ngZone: NgZone,
    private animateCtrl: AnimationController,
    private platform: Platform,
    private realtimeDB: RealtimeDbService,
    public popoverController: PopoverController,
    // private youTubeP: YoutubePipe,
    // private http: HttpClient
    // private sanitize:DomSanitizer,
    // private landingPage : LandingPageComponent,
    // private viewCtrl: ViewController
    ) {
      this.bclickedOnBadge = false;
      this.socialReady = false;
      this.bNewBadgeWatch = false;
      // this.myBadgeNotifications = [];
      this.readingsProcessed = false;
      this.allMessages = [];
      this.myMessages = [];
      this.numFriendRequests = 0;
      this.numBadgeComments = 0;
      this.iAmMe = false;
      this.shownLandingPage = false;
      this.loggedIn = false;
      this.user = null;
      // this.debug = "some debug needed";
      this.outtakeURL = '';
      // this.youTubeP = new YoutubePipe(null);
      this.userIsAdmin = false;
      this.cardsForAnimation = [];
      this.thisRandomCard = this.tarotCardService.getOneCard('1s');
      this.thisRandomCard2 = this.tarotCardService.getOneCard('1w');

      this.favoriteFolders = [];
      this.boundFly1 = null;
      this.boundFly2 = null;
      this.changeImageTimer = null;
      this.domCard1Element = null;
      this.domCard2Element = null;
      // console.log('got first card', this.thisRandomCard, this.thisRandomCard2);
    }

    changeImage() {

      let index = this.tarotCardService.getRandomInt(0, this.cardsForAnimation.length);
      this.thisRandomCard = this.cardsForAnimation[index];

      index = this.tarotCardService.getRandomInt(0, this.cardsForAnimation.length); // again
      this.thisRandomCard2 = this.cardsForAnimation[index];

      // let's have one of the cards be outtakes
      // let dummyCard : TarotCard = this.thisRandomCard2;

      // this.outtakeURL = this.spiritualQuoteService.getRandomOuttakePic();
      // dummyCard.imageUrl = this.outtakeURL;

      // console.log('images', this.outtakeURL, this.thisRandomCard.imageUrl);
      // this.thisRandomCard2 = dummyCard;
      // console.log('change image', index);
      // this.cardFlyAnimation.play();
      // this.cardFlyX.play();
      this.domCard1Element.style.display = 'block';  // show it
      this.domCard2Element.style.display = 'block';  // show it
      this.boundFly1.play();
      this.boundFly2.play();
    }


  ngOnInit() {
    this.realtimeDB.resetCache();  // 10-10 new approach - this method will start everything moving
    this.firestoreService.resetReadings();  // this forces a reset

    this.firestoreService.SocialReadingReadyState.subscribe(stateSR => {
      if (stateSR > 0) {
        this.socialReady = true;
        console.log('social readings bumped - ready to go', stateSR);
      }
    })

    // this.realtimeDB.dummyLoadAll();  // 10-10 new approach - this method will start everything moving
    this.realtimeDB.friendsReadyState.subscribe(stateFriendsReady => {
      // console.log('social friend list complete', stateFriendsReady);
      if (stateFriendsReady > 0 && this.user != null && this.user.uid != null && this.userDataList.length > 0) {
        this.myFriends = this.realtimeDB.getMyFriends(this.user.uid);
        // console.log('my social friends', this.myFriends.length, this.myFriends);
        this.freshenText = this.myFriends.length.toString() + ' friend';
        this.realtimeDB.friendsRequestState.subscribe(stateFR => {
           console.log('friend requests', stateFR);
          if (stateFR > 0) {
            this.friendRequests = this.realtimeDB.getMyFriendRequests(this.user.uid);
             console.log('social friend requests', this.friendRequests, this.friendRequests.length);
            this.numFriendRequests = this.friendRequests.length;
          }
        });
      }
    });
    this.firestoreService.getUsers(); // this should trigger get a list of users
    this.firestoreService.usersReadyState.subscribe(stateUsersReady => {
      this.userDataList = this.firestoreService.getListOfUsers();
      if (this.userDataList.length && this.user != null) {
        // this.findMyMetaData(this.user);
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
          // console.log('ready to crunch messages', this.myMessages);
          this.crunchMessages();
        }
        else {
          // console.log('waiting....',
          // this.allMessages.length,  this.readingsProcessed, this.userDataList.length);  // this.allUserMessages.length,
        }
      }
    });

    this.realtimeDB.allMessagesReadyState.subscribe(stateAllMessagesReady => {
      if (stateAllMessagesReady > 0) {
        this.realtimeDB.collectAllCommentsForPosts(); // kick it off
      }
      this.allMessages = this.realtimeDB.getAllMessages();
    // this.forceScreenUpdate = 'wait...';
    // console.log('chat subscribe', this.allMessages);
      if (this.allMessages.length > 0
      // && this.allUserMessages.length > 0
      && this.readingsProcessed      // 10-1
      && this.userDataList.length > 0) {
      // console.log('ready to crunch messages');
      if (this.socialReady === true)
      {
        this.crunchMessages();
      }     
      // this.forceScreenUpdate = '...';
    }
    else {
      // console.log('waiting....',
      // this.allMessages.length,  this.readingsProcessed, this.userDataList.length);  // this.allUserMessages.length,
    }
    });

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

    // this.realtimeDB.badgeOneShotState.subscribe(badgeOneShot => {
    //   console.log('new badges', badgeOneShot);
    //   if (badgeOneShot > 0) {
    //     this.myBadgeNotifications = this.realtimeDB.getMyNewBadgeNotifications();
    //     this.numBadgeComments = this.myBadgeNotifications.length;
    //     console.log('have new badges?', this.myBadgeNotifications, this.numBadgeComments);
    //   }
    // })
    // don't both with the next step unless we have friends
    this.realtimeDB.badgeReadyState.subscribe(badgeInfo => {
      // this.crunchMessages();
      this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
      this.numBadgeComments = this.commentBadgeInfo.length;
      if (this.bclickedOnBadge) {
        this.numBadgeComments = 0;  // don't show indicator after user clicks once
      }
      // console.log('badge ready state', badgeInfo, this.commentBadgeInfo.length, this.commentBadgeInfo);
    });

    this.firestoreService.ForeignTarotReadingsReadyState.subscribe( state => {
      // console.log('oops - just finished processing foreign readings');
      if (this.allMessages.length > 0
        // && this.allUserMessages.length > 0
        && this.readingsProcessed      // 10-1
         && this.userDataList.length > 0) {
          // this.crunchMessages();  // ?? back in 11-23
          this.tryToRefresh();
      }
    });
    
    // this.reLoadNeeded = false;
    this.cardsForAnimation = this.tarotCardService.getShuffledDeck(); // ok - random
    // console.log('main - on init');
    this.tarotDeck = this.tarotCardService.getAllCards();
    this.spiritualQuotes[0] = this.spiritualQuoteService.getRandomSpiritualQuote();

    // var url = this.spiritualQuoteService.getRandomYoutubeLink();
    // var tmp = this.sanitize.bypassSecurityTrustResourceUrl(url);

    this.outtakeURL = this.spiritualQuoteService.getRandomOuttakePic();

    // this.youtubeLink = tmp; //url;
    // this.domSanitizer.sanitize(SecurityContext.HTML,this.domSanitizer.bypassSecurityTrustHtml
    // console.log('you tube main', url, this.youtubeLink);

    // this.selectedSetOfCards = this.tarotCardService.getSelectedCardsForReading();
    // this.readingName = this.tarotCardService.getReadingName();
    this.authService.authenticationState.subscribe(state => {
      // console.log('main app Auth changed:', state)
      this.loggedIn = state;
      if (this.loggedIn == true) {
        this.user = this.authService.getCurrentFBUser();  // back door
        this.displayName = '??';  // trying to force update?
        this.displayName = this.user.email;
        this.realtimeDB.LogUserIn(this.user);
        // console.log('about to call new badge watcher');
        // this.realtimeDB.watchBadgeNotify(this.user.uid);
        if (this.user.email.toLowerCase() === 'iknowindigo@gmail.com') {
          this.iAmMe = true;
          console.log('turning on debug mode');
        }
        // console.log('fixed login email?', this.user, this.user.email)
      } else {
        // I think this is where we do the landing page??
        if (this.shownLandingPage == false) {
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
                // console.log('2nd wait?', this.user);
                if (this.user == null) {
                  this.showLandingPage();
                  this.shownLandingPage = true;
                }
              }, 9000);
              // this.showLandingPage();
            }
            // callback
          }, 2000); // wait 6 seconds - then see if user is logged in
          // this.showLandingPage();
          // console.log('landing page coming?');
        }
        // this.shownLandingPage = true;
      }

      // going to do something very kludgy - just change the text directly
      // const loginNamDom = document.querySelector<HTMLElement>('.loginName');
      // const signUpDom = document.querySelector<HTMLElement>('.signUpButton');
      // // const DiaryDom = document.getElementById('diaryButton');
      // console.log('hacking doms', signUpDom, loginNamDom);
      // // console.log('js doc', this.user, signUpDom);
      // if (state == false && loginNamDom != null && loginNamDom != undefined) {
      //   // loginNamDom.innerHTML = "Welcome Guest - you are not logged in";
      //   // signUpDom.style.display = "block";
      // } else {
      //     if (this.user != null && loginNamDom != null && loginNamDom != undefined) {
      //       this.displayName = this.user.email;
      //     // loginNamDom.innerHTML = this.user.email;
      //   }
      //   else {
      //     this.user = this.authService.getCurrentFBUser();  // back door
      //     console.log('backdoor user ', this.user);
      //     if (this.user != null && loginNamDom!= null && signUpDom!= null) {
      //       loginNamDom.innerHTML = this.user.email;
      //       this.displayName = this.user.email;
      //       signUpDom.hidden = true;  // ?? doesn't work

      //       this.callDbForReadings(); // call database now - rather than wait
      //     }
      //   }
      // }

      //this.ionViewDidEnter(); // ?? should I do this ??
      // this.tryToReloadHome();
     // need to refresh the screen
    //  this.reLoadNeeded = true;

    });
    // if (this.reLoadNeeded) {
    //   console.log('reloading home')
    //   this.router.navigate(['/'])
    // }

  }

    // sayHello() {
    //   return new Promise( (resolve, reject) => {
    //     setTimeout( () => {
    //       resolve("hello");
    //     }, 3000);
    //   })
    // }

    goActive() {
      // here to stop the screen saver
      // we'll start a timer - and if no action during that time - we'll go inactive
      // console.log('go active')
      this.startTimer();
    }

    goInactive() {
      return; // 1-4-21 turned off the screen saver - Deb didn't like it...
      // here to start the screen saver
      // console.log('go inactive');
      this.bUserIsActiveNow = false;

      // // see if I can start the loop for change image
      // let boundChangeImage = this.changeImage.bind(this);
      // this.changeImageTimer = setTimeout( () => {
      //   this.myIterator = interval(10100).subscribe( (x => {
      //     // console.log('starting iterator');
      //     boundChangeImage();
      //   }))
      // }, 100);

      // ok - going to try using lambda functions - and pack everything into this one routine
      // couldn't seem to access local variables in all these callback functions
      const card = document.querySelector('.oneFlyingCard');
      const card2 = document.querySelector('.oneFlyingCardEnd');
      if (card == null || card === undefined || card2 == null || card2 === undefined) {
        return; // nothing to do
      }
      this.domCard1Element = card;
      this.domCard2Element = card2;
      this.domCard1Element.style.display = 'none';  // show it
      this.domCard2Element.style.display = 'none';  // show it

      let first2 = card2.getBoundingClientRect();
      const first = card.getBoundingClientRect();
      let scrWide = this.platform.width();
      let scrHigh = this.platform.height();
      let maxY = scrHigh - 400; // changed from -500 which made scroll bars appear - can't go too far off screen
      const invert = {
        x: -scrWide,
        y: -scrHigh,
        // scaleX: first.width / scrWide,
        // scaleY: first.height / scrHigh
        scaleX: 299 / scrWide,
        scaleY: 499 / scrHigh
      }
      // console.log('screensaver', invert, first, card)

      const cardFlyAni1 = this.animateCtrl.create()
      .duration(10000)
      .easing('cubic-bezier(.97,.58,.32,.53)')
      .keyframes( [
        { offset: 0, opacity: '0', transform: 'scale(1)'},
        { offset: 0.6, opacity: '1', transform: 'scale(4)'},
        { offset: 1, opacity: '0', transform: 'scale(.5)'}
      ])
      .fromTo(
        // "transform", `translateY(${first.top}px)`, `translateY(${scrHigh}px)`
        'transform', `translateY(-300px)`, `translateY(${maxY}px)`
      )
      .addElement(card);

      // now make a second animation
      let xMax = scrWide; /// 2;
      let xStart = scrWide - 300;

      let cardFlyAni2 = this.animateCtrl.create()
      .duration(10000)
      .delay(3000)
      .easing('cubic-bezier(.1,.76,.62,.05)')
      .keyframes( [
        { offset: 0, opacity: '0', transform: 'scale(1)'},
        { offset: 0.6, opacity: '.9', transform: 'scale(4)'},
        { offset: 1, opacity: '0', transform: 'scale(.5)'}
      ])
      .fromTo(
          // "transform", `translateX(${first.left}px)`, `translateX(${scrWide}px)`,
          "transform", `translateX(${xStart}px)`, `translateX(${xMax}px)`,
      )
      .addElement(card2)

      this.domCard1Element.style.display = "block";  // show it
      this.domCard2Element.style.display = "block";  // show it
      // console.log('first ani play')
      cardFlyAni1.play();
      cardFlyAni2.play();

       // see if I can make this a local variable
       this.boundFly1 = cardFlyAni1;
       this.boundFly2 = cardFlyAni2;

           // see if I can start the loop for change image
      let boundChangeImage = this.changeImage.bind(this);
      this.changeImageTimer = setTimeout( () => {
        this.myIterator = interval(10100).subscribe( (x => {
          // console.log('starting iterator');
          boundChangeImage();
        }))
      }, 100);
      // cardFlyAni1.play().then( data => {
      //   cardFlyAni1.play();
      // });

      // cardFlyAni2.play().then( data => {
      //   // see if I can restart?
      //   cardFlyAni2.play();
      // });
    }

    // if user did something - restart timer - he's still active
    resetTimer() {
      // console.log('reset timer')
      clearTimeout(this.actionTimer);
      clearTimeout(this.changeImageTimer);
      this.bUserIsActiveNow = true;
      if (this.boundFly1 != null) {
        this.boundFly1.stop();  // can this work
        this.boundFly2.stop();  // can this work
      }

      this.goActive();
    }

    startTimer() {
      // wait 2 seconds before calling goInactive
      // console.log('starting timer');
      var card : any = document.querySelector('.oneFlyingCard');
      var card2 : any = document.querySelector('.oneFlyingCardEnd');
      if (card == undefined || card == null || card2 == undefined || card2 == null) {
        return; // saw this when changing pages
      }
      card.style.display = "none";
      card2.style.display = "none";

      var self = this;
      let boundInactive = self.goInactive.bind(this);
      this.actionTimer = window.setTimeout(boundInactive, 33000);  //9000);

      // this.boundChangeImage();

      // setTimeout( () => {
      //   this.myIterator = interval(10100).subscribe( (x => {
      //     // console.log('starting iterator');
      //     this.changeImage();
      //   }))
      // }, 100);
  }

    setupScreenSaver() {
      this.resetTimer = this.resetTimer.bind(this);
      this.bUserIsActiveNow = true;
      // this.boundChangeImage = this.changeImage.bind(this);
      // this.boundGoInactive = this.goInactive.bind(this);

      // console.log('setting up screen saver')
         addEventListener("mousemove", this.resetTimer, false);
         addEventListener("mousedown", this.resetTimer, false);
         addEventListener("keypress", this.resetTimer, false);
         addEventListener("DOMMouseScroll", this.resetTimer, false);
         addEventListener("mousewheel", this.resetTimer, false);
         addEventListener("touchmove", this.resetTimer, false);
         addEventListener("MSPointerMove", this.resetTimer, false);

         this.startTimer();
     }



    ionViewDidEnter() {


     // will try to turn flying cards into a screen saver
     // don't show them unless user is inactive for a while (?6 seconds?)

  // let's try to delay things before starting the iteration
      // setTimeout( () => {
      //   this.myIterator = interval(10100).subscribe( (x => {
      //     // console.log('starting iterator');
      //     this.changeImage();
      //   }))
      // }, 100);

      // this.makeEverythingOpaqueAgain();
      this.cardsForAnimation = this.tarotCardService.getShuffledDeck(); // ok - random
      this.thisRandomCard = this.cardsForAnimation[0];
      this.thisRandomCard2 = this.cardsForAnimation[1];


      // console.log('main - ionViewdidenter');

      this.pathToOneCard  = './assets/img/oneCard.jpg';
      this.pathToThreeCards = './assets/img/threeCards.jpg';
      this.pathToPyramid  = './assets/img/pyramidCards.jpg';
      this.nineRayReading = './assets/img/ninePointed.jpg';
      this.pathToDiary    =  './assets/img/diaryII.jpg'; //'./assets/img/diary.jpg';
      this.pathToShare    = './assets/img/share.jpg';
      this.pathToExplore  = './assets/img/explore.jpg';
      this.pathToMemory   = './assets/img/mem game.jpg'  //  './assets/img/memory.jpg'

      // this.sayHello().then(data => console.log(data));
      // this.selectedSetOfCards = this.tarotCardService.getSelectedCardsForReading();
      // this.readingName = this.tarotCardService.getReadingName();
      // commented out reset - 5/12/22
     // this.firestoreService.resetReadings();  // this forces a reset
      this.displayName = "Welcome Guest - you are not logged in";
      this.loggedIn = this.authService.isUserLoggedIn();
      this.userIsAdmin = this.authService.isUserAdmin();  // g.s.  7-3-20

      // console.log('home - logged in 1', this.loggedIn);

      // having problems with auth being behind - let's go behind the back
      if (this.loggedIn) {
        this.user = this.authService.getCurrentFBUser();
        // console.log('main -> fb user', this.user, this.user.email);
        this.displayName = this.user.email;
        
       
      }
      // console.log('am i?', this.user.email, this.iAmMe);
       if (this.loggedIn == false) {
        this.user = null;
        this.displayName = "Welcome Guest - you are not logged in";
      }
      // console.log('main - view did enter', 'logged in=', this.loggedIn, this.user, this.displayName);



      this.fadeAnimation = this.animateCtrl.create()
      .duration(3000)
      .iterations(1)
      .fromTo("opacity", 1.0, 0.0)
      .addElement(document.querySelector('.mainGrid'))
      .addElement(document.querySelector('.secondGrid'))


      this.fadeUpAnimation =this.animateCtrl.create()
      .duration(1000)
      .iterations(1)
      .fromTo('opacity', 0, 1)
      .addElement(document.querySelector('.mainGrid'))
      .addElement(document.querySelector('.secondGrid'))


      // going to try to follow this FLIP concept -> https://www.youtube.com/watch?v=uvIO68HTgfM
      // get bounding rectangles of starting andfinal position - then animate (in reverse...)

      // var x = document.querySelectorAll('.oneFlyingCard'); // get the flying card
      // var card = document.querySelector('.oneFlyingCard');
      // var card2 = document.querySelector('.oneFlyingCardEnd');


      // var first2 = card2.getBoundingClientRect();
      // const first = card.getBoundingClientRect();

      // var scrWide = this.platform.width();
      // var scrHigh = this.platform.height();

      // const invert = {
      //   x: -scrWide,
      //   y: -scrHigh,
      //   scaleX: first.width / scrWide,
      //   scaleY: first.height / scrHigh
      // }

      // console.log('set up animation',  first, first2, scrWide, scrHigh, invert);

      // let maxY = scrHigh - 300;

      // this.cardFlyAnimation = this.animateCtrl.create()
      // .duration(10000)
      // .easing('cubic-bezier(.97,.58,.32,.53)')
      // .keyframes( [
      //   { offset: 0, opacity: '0', transform: 'scale(1)'},
      //   { offset: 0.6, opacity: '1', transform: 'scale(4)'},
      //   { offset: 1, opacity: '0', transform: 'scale(.5)'}
      // ])
      // .fromTo(
      //   // "transform", `translateY(${first.top}px)`, `translateY(${scrHigh}px)`
      //   "transform", `translateY(-300px)`, `translateY(${maxY}px)`
      // )
      // .addElement(card)

      // console.log('animation - card', card, this.cardFlyAnimation);
      // this.boundFly1 = this.cardFlyAnimation.bind(this);
      // this.boundFly2 = this.cardFlyX.bind(this);

      this.setupScreenSaver();    // will postpone flying the cards until inactive
      // this.cardFlyAnimation.play();
      // console.log('play 1');

      // don't go offscreen
      // let xMax = scrWide/2;
      // let xStart = scrWide - 300;

      // this.cardFlyX = this.animateCtrl.create()
      // .duration(10000)
      // .delay(3000)
      // .easing('cubic-bezier(.1,.76,.62,.05)')
      // .keyframes( [
      //   { offset: 0, opacity: '0', transform: 'scale(1)'},
      //   { offset: 0.6, opacity: '.9', transform: 'scale(4)'},
      //   { offset: 1, opacity: '0', transform: 'scale(.5)'}
      // ])
      // .fromTo(
      //     // "transform", `translateX(${first.left}px)`, `translateX(${scrWide}px)`,
      //     "transform", `translateX(${xStart}px)`, `translateX(${xMax}px)`,
      // )
      // // .fromTo(
      // //   "transform", `translateY(${first.top}px)`, `translateY(${scrHigh}px)`
      // // )
      // .addElement(card2)
      // this.cardFlyX.play();
      // console.log('play 2');
    }

    // makeEverythingOpaqueAgain() {
    //   // this doesn't work - everything stayed transparent :()
    //   // (document.querySelector('.mainGrid') as HTMLElement).style.opacity = "1.0";
    //   // (document.querySelector('.secondGrid') as HTMLElement).style.opacity = "1.0";
    //   // console.log('making opaque', (document.querySelector('.mainGrid') as HTMLElement));
    // }


    ngOnDestroy() {
      // console.log('main: ngOnDestroy');
    }
    ionViewDidLeave() {
      // console.log('main: ionViewDidLeave - unsubscribed');
      if (this.myIterator != undefined && this.myIterator != null) {
        this.myIterator.unsubscribe();
      }
    }
    ionViewWillLeave() {
      // console.log('main: ionViewWillLeave');
    }

    goHome() {
      this.playHomeSound();
      this.ionViewDidEnter();
      this.router.navigate(['/']);
    }

    tryToReloadHome() {
      // console.log('reloading home');
      // this.router.navigate(['/']);
      // this.ngZone.run(() => this.router.navigate(['/'])).then();
    }


  // checkIsUserLoggedIn() {
  //   // we'll wait for a bit - then check to see if the user made it in
  //   console.log('waited a bit', this.authService)
  //   this.user = this.authService.getCurrentFBUser();  // back door
  //   console.log('after waiting - user', this.user);
  //   if (this.user == null) {
  //     this.showLandingPage();
  //   }
  // }

  async presentCommentEditor(dataToShow: any) {
    // console.log('calling modal', dataToShow);
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

  async showLandingPage() {
    // worried that navigation needs to close modal dialog before starting...
    // console.log('here to show landing', this.shownLandingPage);
    const data = {
      throw: 'hi',
      throwID: '' // nothing yet
    };
    // console.log('here to edit', data);

    if (this.shownLandingPage === false) { // someone may have clicked login already
      this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
      // console.log(res);
    });
    }
  }

  // if user tries to do something while modal is up - try to get rid of that
  async tryToDismissBeforeReading() {
    // this.makeEverythingOpaqueAgain();
    // console.log('try to dismiss?')
    const modal = await this.modalCtrl.getTop();
    if (modal != null && modal != undefined) {
      modal.dismiss();
      // console.log('dismissed modal')
      this.fadeUpAnimation.play();  // bring everything back to visible
    }
  }

  NineRayReading() {
    this.playGongSound();
    this.tarotCardService.shuffleCards();
    this.router.navigateByUrl('nineRay');
    this.shownLandingPage = true;
  }

  dealPyramidThrow(): TarotCard[] {
    this.playBellSound();
    // console.log('main - dealPyramidThrow');
    // this.makeEverythingOpaqueAgain();
    // this.fadeAnimation.play();
    this.tryToDismissBeforeReading(); // try to kill previous modal

    this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
    .then( (val) => {
      // console.log('prepare ', this.beforeReadingModal )
      // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
      // this.tarotCardService.dealOneCard();
      this.tarotCardService.shuffleCards();
      this.tarotCardService.setNumberCardsToSelect(11);  // once this many cards have been selected - we'll move on
      this.tarotCardService.setRayOfThrow(-1);  // just to be clear this is not a nine-ray reading
      let throwType = this.tarotCardService.getThrowType();
      let typeThrow = this.tarotCardService.GetTextForRay();
      // this.router.navigate(['throw'])
     });

    // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
    // this.tarotCardService.dealOneCard();
    // this.tarotCardService.setNumberCardsToSelect(11);  // once this many cards have been selected - we'll move on
    // this.tarotCardService.shuffleCards();
    // this.router.navigate(['throw'])
    return null;
  }

  shuffleCards() {
    // this.router.navigate(['/throw'])
    this.tarotCardService.shuffleCards();
    this.router.navigateByUrl('throw');
    this.shownLandingPage = true;
  }

  async dealOneCard() {
    this.playBellSound();
    // this.makeEverythingOpaqueAgain();
    // console.log('main - dealOneCard');
    // this.fadeAnimation.play();
    this.tryToDismissBeforeReading(); // try to kill previous modal

    // ok - we'll tell the service we only want one card
    this.beforeReadingModal = await this.tarotCardService.prepareYourselfBeforeReading()
    .then( (val) => {
      // console.log('prepare ', this.beforeReadingModal )
      this.tarotCardService.shuffleCards();
      this.tarotCardService.setNumberCardsToSelect(1);  // once this many cards have been selected - we'll move on
      // this.router.navigateByUrl('throw');
      // this.router.navigate(['throw'])
    } );
    // this.tarotCardService.setNumberCardsToSelect(1);  // once this many cards have been selected - we'll move on
    //   this.tarotCardService.shuffleCards();

    //   this.router.navigate(['throw'])
    // return null;
  }

  dealThreeCards() {
    this.playBellSound();
    // this.makeEverythingOpaqueAgain();
    // console.log('main - dealThreeCards');
    this.tryToDismissBeforeReading(); // try to kill previous modal
    // this.fadeAnimation.play();
    this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
    .then( (val) => {
      // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
      // console.log('prepare ', this.beforeReadingModal )
      this.tarotCardService.shuffleCards();
      this.tarotCardService.setNumberCardsToSelect(3);  // once this many cards have been selected - we'll move on
      // this.router.navigateByUrl('throw');
      // this.router.navigate(['throw'])
    });


    // ok - we'll tell the service we only want one card
    // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
    // this.tarotCardService.setNumberCardsToSelect(3);  // once this many cards have been selected - we'll move on
    // this.tarotCardService.shuffleCards();

    // this.router.navigate(['throw'])
    // return null;
  }

  onSocial() {
    // console.log('social - logged in', this.loggedIn)
    // this.playBellSound();
    if (this.loggedIn == true) {

    }
    else {
      alert('Please sign-up/login first');
    }
  }

  onAbout() {
    // console.log('about');
    this.router.navigateByUrl('about');
    this.shownLandingPage = true;
  }

  goDashBoard() {
    // console.log('dashboard');
    this.router.navigateByUrl('dashboard');
  }

  onDiary() {
    this.playBellSound();
    // console.log('diary - logged in', this.loggedIn)
    // g.s. 7-26 -- ok - I'm unable to make the "new" diary work on a phone
    // so I'm going to write a "results" screen that is a mini-diary
    // console.log('diary - screen size', screen);
    this.shownLandingPage = true;
    if (this.loggedIn == true) {
      // tell the service about this
      const swide = this.platform.width();
      this.tarotCardService.setCurrentScreenWidth(swide);    // screen.width);
      
      // console.log('diary?', swide, screen.width);

      // if (screen.width < 601) {  //780) { // 8-19 couldn't figure out why my iPad couldn't see diary   //601) {// ?? not sure where the cut off should be {
      if (swide < 1100) {
        // console.log('to smaller results');
        this.router.navigateByUrl('smaller');  //'results')
      } else {
        // console.log('to diary');
        this.router.navigateByUrl('diary')
      }
    }
    else {
      alert('Please sign-up/login first');
    }
  }

  onLogIn() {
    // console.log('login?');
    // this.tarotCardService.shuffleCards();
    this.router.navigateByUrl('login');
    this.shownLandingPage = true;
  }

  onSignUp() {
    this.router.navigate(['/register']);
    this.shownLandingPage = true;
  }

  doAdminStuff() {
    // just bring up the admin page
    this.router.navigateByUrl('/admin');
    this.shownLandingPage = true;
  }

  turnOffAnimation() {
    // console.log('user clicked outside');
  }

  onIntro() {
    this.playBellSound();
    this.router.navigateByUrl('/intro');
    this.shownLandingPage = true;
  }

  onShare() {
    this.playBellSound();
    if (this.loggedIn == true) {
      this.router.navigateByUrl('tarot-social');
      this.shownLandingPage = true;
    }
  }
  doGame() {
    this.playBellSound();
    if (this.loggedIn == true) {
      this.shownLandingPage = true;
      this.router.navigate(['memory']);
    }
  }

  doExplore() {
    this.playBellSound();
    this.router.navigate(['explore']);
  }
  // rather than wait for diary to first call db for readings data - let's do it up front
  // that way the data is there ready and waiting
  callDbForReadings() {
    var aUser =   this.authService.getFirebaseUser().then((usr) => {
      this.user = usr;
      // if the user isn't logged in - then we're done - nothing to get
      // console.log('is user logged in?', this.user);
      if (this.user != null && this.user.email.length >4) {
        // ok - let's take a chance and get the data from the db
        // this.firestoreService.getThrowCollectionFromDb().then ( data => {
        this.firestoreService.CreateListOfReadings().then ( data => {

          this.myThrows = data; //Promise.resolve(data);
          // console.log('view did enter resolving - old way to get readings', this.myThrows, data);
          // just going to skip further processing - I just want the firestore service to have the data ready
          this.firestoreService.getFolderList().then( result => {
            // console.log('folder data', result, this.firestoreService.getPublicFolderList())
          })
          this.firestoreService.FolderListReadyState.subscribe(state => {
            // console.log('folder list finally ready', state);
            if (state > 0) {
              this.favoriteFolders = this.firestoreService.favoriteFolders;
              // console.log('heres the list', this.favoriteFolders);
              // console.log('here is list', this.favoriteFolders)
            }
          })
        })  // end of get throws
      }
    }); // end of get user
  }

  async showFriendRequests(eve) {
     console.log('user clicked show friends', this.friendRequests);
    this.crunchMessages();  // 5-12-22 we weren't ready....
    const menuName = 'showFriendRequests';
    // we don't respond to menu click - it will reroute if user clicks on it
    
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
         // this.goFriends();
        //  console.log('trying to find friend requests');
        //  this.firestoreService.getUsers();
        //  this.router.navigate(['friends']);
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

  async commentsMade(eve) {
    console.log('user clicked show comments', this.numBadgeComments, this.commentBadgeInfo);
    this.crunchMessages(); // 5-12-22 added this call - social wasn't ready...
    this.bclickedOnBadge = true;  // don't show badge any more
    const menuName = 'showPostComments';
    // we don't respond to menu click - it will reroute if user clicks on it
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
          this.onShare();   // 5-13-22 added
        },
        data: menuName  // 'abc'
      },
      event: eve,
      mode: 'ios',
      // translucent: true
    });
    await popover.present();
  }

  crunchMessages() {
    const userID = (this.user === null || this.user === undefined) ? '' : this.user.uid;
    this.realtimeDB.crunchMessages(userID); // should be ok

    this.myMessages = this.realtimeDB.getMyMessages();

    // console.log('about to call new badge watcher');
    // if (this.bNewBadgeWatch === false) {
    //   this.realtimeDB.watchBadgeNotify(this.user.uid);
    //   this.bNewBadgeWatch = true; // try to avoid calling too many times
    // }
    // console.log('messages', this.myMessages)
  }

  tryToRefresh() {
    const userID = (this.user === null || this.user === undefined) ? '' : this.user.uid;
    // this.firestoreService.getUsers();
    // this.realtimeDB.crunchMessages(userID); // should be ok
    if (this.myMessages.length === 0) {
      this.realtimeDB.tryToRefreshMessages(userID);
      this.myMessages = this.realtimeDB.getMyMessages();
    }
    if (this.commentBadgeInfo.length === 0) {
      this.realtimeDB.collectCommentsForUser(this.user.uid);
      this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
    }
   
    // this.numBadgeComments = this.commentBadgeInfo.length;
    // this.myBadgeNotifications = this.realtimeDB.getMyNewBadgeNotifications();
    // this.numBadgeComments = this.myBadgeNotifications.length;
  }

  playHomeSound() {
    let audio = new Audio();
    audio.src = './assets/sounds/home.mp3';
    audio.load();
    audio.play();
  }

  playBellSound() {
    let audio = new Audio();
    audio.src = './assets/sounds/bell.mp3';
    audio.load();
    audio.play();
  }
  playGongSound() {
    let audio = new Audio();
    audio.src = './assets/sounds/gongish.mp3';
    audio.load();
    audio.play();
  }
  ionViewWillEnter() {
    // this.playGongSound();
  }
}
