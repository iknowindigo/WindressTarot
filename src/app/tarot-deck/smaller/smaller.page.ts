// I'm going to replace everything in this file with the diary - then remove any functions
// that won't work on small screens
//SmallerPage
// export class SmallerPage implements OnInit {

  import { Component, OnInit } from '@angular/core';
  import { TarotCard } from '../tarotCard.model';
  import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy } from '../../services/tarot-cards.service';
  import { ActivatedRoute, Router } from '@angular/router';
  import { AlertController, ModalController } from '@ionic/angular';
  import { AuthenticationService } from '../../services/authentication.service';
  import { FirestoreService } from '../../services/firestore.service';
  import { DatePipe } from '@angular/common';
  import {firestore} from 'firebase/app';
  import * as jsPDF from 'jspdf';
  import Timestamp = firestore.Timestamp;
  // import { IonicContextMenuModule } from 'ionic-context-menu';
  import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20


  export interface CardDetails {
    card: TarotCard;
    positionText: string;
  }

  @Component({
    selector: 'app-diary',
    templateUrl: './smaller.page.html',
    styleUrls: ['./smaller.page.scss'],
  })
  export class SmallerPage implements OnInit {
    myThrows: ATarotThrow[];
    myThrowsReadyForRendering: TarotCardsInThrow[];
    // textForEachPosition: string[];
    user: firebase.User;
    automaticClose : boolean;
    throws: any[];
    noThrowsSavedYet : boolean;
    tinyScreen : boolean; // try to hide splitter on smaller screens

    constructor(
      private authService: AuthenticationService,
      private tarotCardService: TarotCardsService,
      private firestoreService: FirestoreService,
      private alertCtrl: AlertController,
      private router: Router,
      private realtimeDB: RealtimeDbService,
      // private matTree: MatTreeModule,
      // private treeControl: FlatTreeControl<DynamicFlatNode>,
      // private modalController: ModalController,
      public datepipe: DatePipe
    ) {
      this.automaticClose = true;

      this.myThrows = [];
      this.user =null;
      this.noThrowsSavedYet = false;
      this.myThrowsReadyForRendering = [];  // zap
    }

    ionViewDidLeave() {
      // console.log('smaller diary - ionViewDidLeave');
      // this.realtimeDB.stopWatchChat();  // stop watching
      // console.log('1');
      // this.authService.authenticationState.unsubscribe();
      // console.log('2');
      // this.firestoreService.usersReadyState.unsubscribe();
      // console.log('3');
      // this.realtimeDB.friendsRequestState.unsubscribe();
      // console.log('4');
      // this.realtimeDB.friendsReadyState.unsubscribe();
      // console.log('5');
      // this.firestoreService.readingsReadyState.unsubscribe();
      // console.log('6');
      // this.realtimeDB.allMessagesReadyState.unsubscribe();
      // console.log('7');
      // this.realtimeDB.commentReadState.unsubscribe();
      // console.log('8');
      // this.firestoreService.ForeignTarotReadingsReadyState.unsubscribe();
      // console.log('9');
    }

    // working on toggling table - expand/collapse
    // have a problem where if a user prints or saves or edits or does something - we end up with everything collapsed
    // let's make a rule that there must be one row open always
    // we'll remember each row that got opened - as last row opened - and if all are closed, then we'll reopen last row opened

    toggleSelection(index) {

      this.myThrowsReadyForRendering = this.firestoreService.getFilteredReadings();

      // console.log('toggle called', index, 'keep open', 
        // this.myThrowsReadyForRendering[index].keepCardsVisible, this.myThrowsReadyForRendering.length);
      // console.log('toggle comment', this.myThrowsReadyForRendering[index].comment);
      if (this.myThrowsReadyForRendering[index].open == false
        && this.myThrowsReadyForRendering[index].keepCardsVisible == false) {

        this.myThrowsReadyForRendering[index].open = true; // !this.myThrowsReadyForRendering[index].open;
        this.tarotCardService.setCurrentThrow(this.myThrowsReadyForRendering[index]);
        // close all others
        if (this.automaticClose && this.myThrowsReadyForRendering[index].open) {
          this.myThrowsReadyForRendering
          .filter( (item, itemIndex) => itemIndex != index)
          // .map(item => item.open = false); // used to be this
          .map(item => { if (!item.keepCardsVisible ) {item.open = false;} });
      }
    }
  }

  async getActiveThrowList() : Promise<any> {
    this.user = this.authService.getCurrentFBUser();
    if (this.user == null || this.user == undefined || this.user.uid == null) {
      return;
    }
  }

    async ionViewDidEnter(){
      this.tarotCardService.setSocialMode(false);
      // 7-26 - I guess I have to init the filter system - since this is for smaller screens
      // and no filter will ever be applied
      let filter : FilterThrowsBy = {
        includeAll : true,	// if this is true - then ignore the filter
        throwType: 'all'
      };
      let result =  this.firestoreService.setReadingFilter(filter).then (data => {
        // console.log('called new get reading list', data);
      });

      this.tinyScreen = window.screen.width <= 1100; // 600;

      var aUser =   this.authService.getFirebaseUser().then((usr) => {
          this.user = usr;
        });

      // console.log('view did enter 1', this.user);
      this.firestoreService.getThrowCollectionFromDb().then ( data => {

        this.myThrows = data; //Promise.resolve(data);
        // console.log('view did enter resolving', this.myThrows, data);

        if (this.myThrows != null && this.myThrows.length > 0)
        {
          this.myThrowsReadyForRendering = [];

          this.myThrows.forEach( aThrow => {

            const theCards : TarotCard[] = [];
            const eachCardId = aThrow.cardList.split(',', aThrow.numberCards);
            // console.log('creating cardlist', eachCardId, aThrow);
            for (let i = 0; i < aThrow.numberCards; i++) {
              const cardId = eachCardId[i];
              const aCard = this.tarotCardService.getOneCard(cardId);
              theCards.push(aCard);
            }
            // this will be blank until user has saved comments
            const displayModDate = ''; // this.datepipe.transform(aThrow.modifiedDateTime, 'M/d/yy, h:mm a');
            const dispDate = this.makeCreativeDateFromAscii(aThrow.dateTime);

            const rThrow: TarotCardsInThrow = {
              numberCards: aThrow.numberCards,
              typeThrow: aThrow.throwType,
              readingName: '',
              userID: aThrow.userID,
              dateTime: aThrow.dateTime,
              dateModified: aThrow.modifiedDateTime,
              comment: aThrow.comment,
              subject: aThrow.subject,  // 8-16
              tarotCards: theCards,
              displayDateTime: dispDate,   // this.datepipe.transform(aThrow.dateTime, 'M/d/yy, h:mm a'),
              displayDateModified: displayModDate,
              open: false,
              keepCardsVisible: false,
              throwID: aThrow.throwID,
              throwDeleted : false
            };
            if (rThrow.numberCards == 1) {
              rThrow.typeThrow = "One Card";
            } else if (rThrow.numberCards == 3) {
              rThrow.typeThrow = "Three Cards";
            } else if (rThrow.numberCards == 11) {
             // rThrow.typeThrow = "Pyramid Reading"
             rThrow.typeThrow = this.tarotCardService.GetTextForRay();  // 8-21
            }
            // console.log('one throw', rThrow);
            this.myThrowsReadyForRendering.push(rThrow);
          });

        } else {
          console.log('no data for diary');
          this.noThrowsSavedYet = true;
        }
        if (this.myThrowsReadyForRendering != null && this.myThrowsReadyForRendering.length > 0) {
          this.myThrowsReadyForRendering[0].open = true;
          this.tarotCardService.setCurrentThrow(this.myThrowsReadyForRendering[0]);
        }

      });
      // console.log('view did enter 2');
           // g.s. 7-25 setting up a subscription to tell us when readings are ready
      this.firestoreService.filteredReadingsReadyState.subscribe(state => {
            // console.log('filtered readings finally ready:', state);
            // so now let's call and get them
            if (state == 0) {
              // 8-27 - need to zap?
              // console.log('zapping filtered list');
              if (this.myThrowsReadyForRendering != undefined) {
                const len = this.myThrowsReadyForRendering.length;
                // console.log('zap?', len);
                for (let i = 0; i < len; i++) {
                  this.myThrowsReadyForRendering.pop();
                  // console.log('pop zap')
                }
              }
            }
            if (state > 0) {
              this.myThrowsReadyForRendering = this.firestoreService.getFilteredReadings();
              this.updateReadingsWithSubject();
              // console.log('filtered readings', this.myThrowsReadyForRendering);
              if (this.myThrowsReadyForRendering!= null && this.myThrowsReadyForRendering.length > 0) {
                this.myThrowsReadyForRendering[0].open = true;
                this.tarotCardService.setCurrentThrow(this.myThrowsReadyForRendering[0]);
              }
            }
          });

    }

    // I wish I had stored date as binary :) - but too late to change now - the program has been in use for 6 mo
  makeCreativeDateFromAscii(asciiDate: string, modDate?: string) {
    let displayDate = '';
    const dispTime = this.datepipe.transform(asciiDate, 'h:mm a');
    const dispDate = this.datepipe.transform(asciiDate, 'MMM d yy');

    const nSec = new Date((asciiDate as unknown) as number);
    const et = Date.now() -  nSec.getTime();
    const etSec = Math.round(et / 1000);
    const etMin = Math.round(etSec / 60);
    const etHour = Math.round(etMin / 60);
    const etDays = Math.round(etHour / 24);
    
   // console.log('makeCreativeDateFromAscii', modDate, nSec, asciiDate, et, etSec, etMin, etHour, etDays);

    // ok try to emulate FB
    if (etDays > 0 && etDays < 7) {
      if (etDays === 1) {
        displayDate = 'Yesterday at ' + dispTime;
      } else {
        displayDate =  etDays.toString() + ' days ago at ' + dispTime;
      }
    } else if (etDays === 0) {
      if (etHour === 0) {
        if (etMin === 0) {
          displayDate = etSec + ' sec(s) ago';
        } else {
          displayDate = etMin + ' min(s) ago';
        }
      } else{
        displayDate = etHour + ' hr(s) ago';
      }
    }
    else {
      displayDate = dispDate;
    }
    // console.log('makeCreativeDateFromAscii small', displayDate, etDays, etHour, etMin, etSec);
    return displayDate;
  }
    updateReadingsWithSubject() {
      // console.log('here to update each reading', this.myThrowsReadyForRendering.length);
      this.myThrowsReadyForRendering.forEach(reading => {
        reading.readingName = this.tarotCardService.getReadingNameForThrow(reading);
        // saw confusion about open/close - mark all as closed?
        reading.open = false;
        // console.log('updated reading', reading.readingName)
      });
    }


    ngOnInit() {
      // this.GetTheReadings();
      // console.log('new', this.myThrows);
      // console.log('diary oninit')
      // console.log(this.myThrows);
    }

    goHome() {
      // this.router.navigate(['tarot-deck']);
      this.realtimeDB.resetCache();
      this.router.navigate(['tarot-deck']);
    }
  }
