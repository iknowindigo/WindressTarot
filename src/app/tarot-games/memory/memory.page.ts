// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TarotCard } from '../../tarot-deck/tarotCard.model';  // 'tarotCard.model';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FolderForReadings } from '../../services/tarot-cards.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { AuthenticationService } from '../../services/authentication.service';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage, CommentBadgeInfo } from '../../services/realtime-db.service'; // 9-25-20
import { NavController, ModalController, NavParams, Platform } from '@ionic/angular';
import { CardDetails } from '../../tarot-deck/diary/diary.page'
import { ModalCardDisplayPage } from '../../tarot-deck/modal-card-display/modal-card-display.page';
import { timer, Observable, Subscription } from 'rxjs'
import { DatePipe, formatDate } from '@angular/common';
import { TablehelpComponent, TarotData } from '../../component/tablehelp/tablehelp.component';
import { ComponentsModule} from '../../component/components.module';

export interface MemGameCard {
  cardID: string;
  cardMatched: boolean;
  orderMatched: number;
  imageURL: string;
}

@Component({
  selector: 'app-memory',
  templateUrl: './memory.page.html',
  styleUrls: ['./memory.page.scss'],
})
export class MemoryPage implements OnInit {
  shuffledTarotDeck: TarotCard[];
  //whichSuit: string;
  setOfCards: MemGameCard[];
  bFirstCardClicked: boolean;
  cardMatchIds: string [];
  currentCard: MemGameCard;
  clickedCard: MemGameCard;
  otherCard: MemGameCard;
  madeMatch: boolean;
  smallWait: Observable<number>;
  subsciptTimer: Subscription;
  score: number;
  remainingCount: number;
  refreshText: string;
  gameOver: boolean;
  selectedSetOfCards: TarotCard[];
  throw: TarotCardsInThrow;
  gameReallyOver: boolean;
  loggedIn: boolean;
  currentLoginName: string;
  readingSavedToDiary: boolean;
  lastIndex: number;

  

  constructor(
    private router: Router,
    private tarotCardService: TarotCardsService,
    private modalCtrl: ModalController,
    private authentic: AuthenticationService,
    private firestoreService: FirestoreService,
    private datepipe: DatePipe,
    private platform: Platform,
  ) { 
    // this.whichSuit = 'pentacles';
    this.lastIndex = -1;  // 1/25 - don't let them cheat by clicking same card
    this.gameOver = false;
    this.selectedSetOfCards = [];
    this.refreshText = '';
    this.setOfCards = [];
    this.cardMatchIds = [];
    this.bFirstCardClicked = false;
    this.madeMatch = false;
    this.smallWait = timer(1000);
    this.subsciptTimer = this.smallWait.subscribe();
    this.currentLoginName = '';
    
  }

  ngOnInit() {
    //this.shuffledTarotDeck = this.tarotCardService.createMemoryDeckWithRandomCards(8);
    this.authentic.authenticationState.subscribe(state => {
      // console.log('login Auth changed:', state);
      this.loggedIn = state;

      const fbUsr = this.authentic.getCurrentFBUser();
      // console.log('subscribe:  -> fb user', fbUsr);
      if (fbUsr != null) {
        this.currentLoginName = fbUsr.email;
      }
      // console.log('login code - user is logged in', this.loggedIn, this.currentLoginName, fbUsr);

    });
    this.newGame();
  }

  // ngAfterViewChecked() {
  //   this.gameOver = false;
  // }

  goHome() {
    this.gameOver = false;
    this.newGame();
    this.playClick();
    this.subsciptTimer.unsubscribe();
    this.router.navigate(['/']);
  }

  newGame() {
    // this.playStart();
    this.readingSavedToDiary = false;
    this.gameReallyOver =false;
    this.gameOver = false;
    this.score = 100; // starting value
    this.remainingCount = 8;
    this.subsciptTimer.unsubscribe();
    this.refreshText = '.';
    this.refreshText = ' ';
    this.setOfCards.splice(0, this.setOfCards.length);
    this.cardMatchIds.splice(0, this.cardMatchIds.length);
    this.selectedSetOfCards.splice(0, this.selectedSetOfCards.length);

    this.shuffledTarotDeck = this.tarotCardService.createMemoryDeckWithRandomCards(8);  // start small
    this.shuffledTarotDeck.forEach(crd => {
      const card = {
        cardID: crd.id,
        cardMatched: false,
        orderMatched: 0,
        imageURL: './assets/img/mcards/extracard.jpg'  //crd.FaceDownImageUrl
        // debug
        // imageURL: crd.imageUrl -- uncomment this to debug - always face up
      }
      this.setOfCards.push(card);
      // console.log('getting ready', card, this.setOfCards.length);
      // this.cardMatchIds = [];
      this.bFirstCardClicked = false;
      this.madeMatch = false;
    })
    this.otherCard = this.setOfCards[0];  // init to something
    this.currentCard = this.setOfCards[0];
  }

  markOtherCardAsMatched(cardID: string, imageURL: string) {
    // we matched the card - but there are two in our dataset - mark them both as matched
    // console.log('mark other card', cardID, imageURL);
    this.setOfCards.forEach(crd => {
      if (crd.cardID === cardID) {
        crd.cardMatched = true;
        crd.imageURL = imageURL;
      }
    })
  }

  markOtherCardMismatch(cardID: string, imageURL: string) {
    this.setOfCards.forEach(crd => {
      if (crd.cardID === cardID) {
        crd.cardMatched = false;
        crd.imageURL = imageURL;
      }
    })
  }

  clickedNewID(cardID: string): boolean {
    let newCard = true;
    this.cardMatchIds.forEach(id => {
      // console.log('checking new', cardID, id);
      if (id === cardID) {
        newCard = false;
      }
    })
    // console.log('results', newCard);
    return newCard;
  }

  doneClick(acard: TarotCard) {
    const dataToShow = {
      card: acard, // card.tarotCards[whichPosition],
      positionText: 'Exploring' // this.textForEachPosition[textPosition]
    };
    this.presentModal(dataToShow);
  }

  cardClicked(acard: TarotCard, index: number) {
    this.clickedCard = this.setOfCards[index];
      const clickCardUp = this.clickedCard.cardMatched;

      // let gameReallyOver = false;

    if (!this.gameOver) {
      if (!this.subsciptTimer.closed) {
        // console.log('still going');
        if (!this.gameReallyOver) {
          this.otherCard.imageURL = './assets/img/mcards/extracard.jpg';
          this.currentCard.imageURL = './assets/img/mcards/extracard.jpg';
          this.markOtherCardMismatch(this.clickedCard.cardID, acard.FaceDownImageUrl);
        }

        this.bFirstCardClicked = false;
        this.subsciptTimer.unsubscribe();
      } else this.subsciptTimer.unsubscribe();
  
      // this.clickedCard = this.setOfCards[index];
      // const clickCardUp = this.clickedCard.cardMatched;
      // this.clickedCard.imageURL = acard.imageUrl;
      this.clickedCard.imageURL = acard.imageUrl;
  
      // console.log('clicked', index, this.lastIndex, this.clickedCard, this.bFirstCardClicked, clickCardUp); // , this.currentCard, this.cardMatchIds.length, this.cardMatchIds);
      if (this.bFirstCardClicked && !clickCardUp && index != this.lastIndex) {
        this.otherCard = this.clickedCard;
        // look for a match 
        // console.log('look for match?', this.currentCard.cardID, this.clickedCard.cardID);
        if (this.currentCard.cardID === this.clickedCard.cardID) {
          this.madeMatch = true; 
          this.remainingCount--;
          this.score += 100;
          this.bFirstCardClicked = false;
          this.clickedCard.cardMatched = true;
          acard.FaceDownImageUrl = acard.imageUrl;
         
          this.markOtherCardAsMatched(this.clickedCard.cardID, acard.imageUrl);
          if (!this.gameReallyOver) {
            this.playMatch();
          }
        }
        else {
          this.playMismatch();
          if (this.score > 10) {
            this.score -= 10;
          }
          // const huh = timer(1000);
          this.smallWait = timer(6000);
          this.subsciptTimer = this.smallWait.subscribe(val => {
            this.bFirstCardClicked = false;
            if (!this.gameReallyOver) {
              this.currentCard.imageURL = './assets/img/mcards/extracard.jpg';
              this.markOtherCardMismatch(this.clickedCard.cardID, acard.FaceDownImageUrl)
            }
          })
          this.madeMatch = false;   
        }
      } else if (!clickCardUp) {
        if (this.clickedNewID(this.clickedCard.cardID)) {
          this.cardMatchIds.push(this.clickedCard.cardID);
          // console.log('remembering', this.clickedCard.cardID, this.cardMatchIds);
        
          // if (this.remainingCount > 4) {
          this.selectedSetOfCards.push(acard);
        }
        this.bFirstCardClicked = true;
        this.lastIndex = index;
        this.currentCard = this.clickedCard;
        // console.log('first card', this.currentCard.cardID, this.bFirstCardClicked);
        // if (this.remainingCount > 4) {
        //   this.selectedSetOfCards.push(acard);
          // console.log('adding card for reading', this.selectedSetOfCards.length, acard.title);
        // }
          this.playClick();
      }
      
      if (this.remainingCount === 0 ) {
        // game over!
        if (!this.gameReallyOver) {
          this.playDone();
        }
       
        this.gameReallyOver = true;
        this.smallWait = timer(6000);
        this.subsciptTimer = this.smallWait.subscribe(val => {
         
          this.saveReading(); // let's make a reading out of the first three cards we clicked
          this.gameOver = true;
        });
       
      }
    }
  
    // console.log('card clicked', acard, index);  // , thisCard);
    // console.log('should I show?', this.gameOver,this.clickedCard.cardMatched, clickCardUp);
    if (this.gameOver || (this.gameReallyOver && clickCardUp)|| (this.clickedCard.cardMatched && clickCardUp) ) { // no cheating - only show more once they match the card
      const dataToShow = {
        card: acard, // card.tarotCards[whichPosition],
        positionText: 'Exploring' // this.textForEachPosition[textPosition]
      };
      this.presentModal(dataToShow);
    }
  }

  saveReading() {
    console.log('done', this.selectedSetOfCards.length, this.selectedSetOfCards);
    const fbUser = this.authentic.getCurrentFBUser();
      const now = new Date();
      const ddt = this.datepipe.transform(now, 'M/d/yy');
      this.throw = {
          numberCards: this.selectedSetOfCards.length,
          typeThrow: '8',  // "",
          readingName : 'Memory Game',
          userID: (fbUser == null) ? '' : fbUser.uid,
          dateTime:  Date(),
          dateModified: Date(),
          comment: 'Memory match game',
          subject: '',
          tarotCards: this.selectedSetOfCards,
          // displayDateTime: aThrow.dateTime
          displayDateTime: ddt, // Date().toLocaleLowerCase(),
          displayDateModified: ddt, // Date().toLocaleLowerCase(),
          open: true,
          keepCardsVisible: false,
          throwID: '',
          throwDeleted: false
          // displayDateTime: aThrow.dateTime.toDateString()
        };
      console.log('made throw', this.throw, this.selectedSetOfCards.length);
        // ok - pass this reading to the service so the component can read it
      this.tarotCardService.setCurrentThrow(this.throw);
  }

  saveTarotReading() {
    // save reading to diary
    // console.log('save reading', this.selectedSetOfCards.length, this.selectedSetOfCards);
    if (this.selectedSetOfCards.length > 0) {
        // take the first three cards and save to the diary

        const throwType = '8';  //'Three Cards';  //'3';
        const comnt = 'Memory Game Three card reading';
        const subj = 'Memory game';
        // const cardLst = this.selectedSetOfCards[0].id + ',' +
        //         this.selectedSetOfCards[1].id + ',' +
        //         this.selectedSetOfCards[2].id;
        //         // console.log('save reading', throwType, cardLst, comnt, subj);
        // 2-25-21 let's make a new type of reading - the match game reading
        let cardLst: string = '';
        this.selectedSetOfCards.forEach(crd => {
          cardLst += crd.id; 
          cardLst += ',';
        })
        console.log('game reading', cardLst);
        this.firestoreService.addReading(throwType, cardLst, comnt, subj);  // save to the diary

        this.readingSavedToDiary = true;
    }
  }

  goDiary() {
    if (this.loggedIn) {
      const swide = this.platform.width();
      this.tarotCardService.setCurrentScreenWidth(swide); 

      // this.tarotCardService.setCurrentScreenWidth(screen.width);

      if (swide < 1100) {  //780) { // 8-19 couldn't figure out why my iPad couldn't see diary   //601) {// ?? not sure where the cut off should be {
        // console.log('to smaller results');
        this.router.navigateByUrl('smaller');  //'results')
      } else {
        // console.log('to diary');
        this.router.navigateByUrl('diary')
      }
    }
   
  }

  // goPent() {
  //   this.whichSuit = 'pentacles';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }
  // goSword() {
  //   this.whichSuit = 'swords';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }
  // goWands() {
  //   this.whichSuit = 'wands';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }
  // goCups() {
  //   this.whichSuit = 'cups';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }
  // goAnkhs() {
  //   this.whichSuit = 'ankhs';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }
  // MajorA() {
  //   this.whichSuit = 'majorArcana';
  //   this.shuffledTarotDeck = this.tarotCardService.createMemoryShuffleDeck(this.whichSuit);
  // }

  playClick() {
    let audio = new Audio();
    audio.src = './assets/sounds/click.wav';
    audio.load();
    audio.play();
    // console.log('click');
  }
  playStart() {
    let audio = new Audio();
    audio.src = './assets/sounds/bell.mp3';
    audio.load();
    audio.play(); 
    // console.log('start');
  }
  playDone() {
    let audio = new Audio();
    audio.src = './assets/sounds/done.wav';
    audio.load();
    audio.play();
    // console.log('done');
  }
  playMatch() {
    let audio = new Audio();
    audio.src = './assets/sounds/match.wav';
    audio.load();
    audio.play();
    // console.log('match');
  }
  playMismatch() {
    let audio = new Audio();
    audio.src = './assets/sounds/mismatch.wav';
    audio.load();
    audio.play();
    // console.log('mismatch');
  }

  

  async presentModal(dataToShow: CardDetails) {
    // console.log('calling modal', dataToShow);
    const modal = await this.modalCtrl.create({
      component: ModalCardDisplayPage,
      cssClass: 'modal-wrapper',  // 'my-custom-class',
      // buttons: [ {
      //   text: 'close',
      //   role: 'cancel',
      //   icon: 'close',
      //   handler: () => { console.log('canceled clicked');}
      // }]
      componentProps: { dataToShow },
      backdropDismiss: true,
      showBackdrop: false
    });
    return await modal.present();
  }
}
