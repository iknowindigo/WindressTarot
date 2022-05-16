import { Injectable } from '@angular/core';
import { AngularFirestore, validateEventsArray, CollectionReference } from '@angular/fire/firestore';
import { firestore, database } from 'firebase/app';
import {  Router } from '@angular/router';
import Timestamp = firestore.Timestamp;
import { AuthenticationService } from '../services/authentication.service';  // 'src/app/services/authentication.service';
import { NavController, AlertController } from '@ionic/angular';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy, FolderForReadings } from '../services/tarot-cards.service';
// import { async } from '@angular/core/testing';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
// import 'rxjs/add/operator/toPromise';
import { AngularFireFunctions } from '@angular/fire/functions';
import { async } from '@angular/core/testing';
import { first, timestamp } from 'rxjs/operators';
// import { threadId } from 'worker_threads';
import { TarotCard } from '../tarot-deck/tarotCard.model';
import { DatePipe } from '@angular/common';
import { getRulesDirectories } from 'tslint/lib/configuration';
// import { firebase } from 'firebase'
// import * as firebase from 'firebase';
import { HarvestID } from '../services/realtime-db.service';
// import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage, CommentBadgeInfo } from '../services/realtime-db.service'; // 9-25-20


export interface FolderData {
  name: string;
  readingID: string;
  userID: string;
  folderID: string;
}

export class UserData {
  firstName = '';
  lastName = '';
  nickName = '';
  City = '';
  State = '';
  birthday: Timestamp = new Timestamp(0, 0);
  dateCheckFriends: Timestamp = new Timestamp(0, 0);
  dateCheckReadings: Timestamp = new Timestamp(0, 0);
  dateCheckComments: Timestamp = new Timestamp(0, 0);
  email = '';
  interests = '';
  notes = '';
  role = '';
  profilePicURL = '';
  userID = '';
  friend = false;
}


// export class oneRay {
//   aRay : FolderForReadings [];
// }

export class RayReadingsFolders {
  eachRay: FolderForReadings []; // oneRay[];
}



@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public readings: ATarotThrow[];
  private socialReadings: ATarotThrow[];
  public userList: any[];
  public lastID: string;
  public allReadings: TarotCardsInThrow[];
  public allSearchedReadings: TarotCardsInThrow[]; // 8-30 new! these match search criteria - filtered readings use this as source
  public filteredReadings: TarotCardsInThrow[];
  public readingFilter: FilterThrowsBy;
  private myThrows: ATarotThrow[];
  public readingsReadyState = new BehaviorSubject<number>(0);
  public filteredReadingsReadyState = new BehaviorSubject<number>(0);
  public FolderListReadyState = new BehaviorSubject<number>(0);
  public ForeignTarotReadingsReadyState = new BehaviorSubject<number>(0);
  public SocialReadingReadyState = new BehaviorSubject<number>(0);  // 1-18-21
  public rayFolderState = new BehaviorSubject<number>(0); // 8-27
  public usersReadyState = new BehaviorSubject<number>(0);
  public batchForeignReadingState = new BehaviorSubject<number>(0); // 2-6-21
  public favoriteFolders: FolderForReadings[];
  public folderList: FolderData[];
  public folderIndex: number;
  public currentFolderDocID: string;
  rayReadings: RayReadingsFolders;
  fbUser: firebase.User;
  searchActive: boolean;
  forceNavReset: boolean;
  public userDataList: UserData[];
  private idsToHarvest: HarvestID[];  // 10-1
  public allSocialReadings: TarotCardsInThrow[];  // 10-1 these are readings to be displayed on the social page
  private foreignIdsToHarvest: HarvestID[];
  private foreignTarotReadings: TarotCardsInThrow[];

  // https://stackoverflow.com/questions/46721517/google-firestore-how-to-get-document-by-multiple-ids-in-one-round-trip
  //   Now you can use queries like, but mind that the input size can't be greater than 10.
  // userCollection.where('uid', 'in', ["1231","222","2131"])

  constructor(
    public db: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private fireFunctions: AngularFireFunctions,
    private tarotCardService: TarotCardsService,
    private authService: AuthenticationService,
    public datepipe: DatePipe,
    // private realtimeDB: RealtimeDbService,
    // public firebaseRealTime: firebase.database()
  ) {
    this.rayReadings = new RayReadingsFolders();
    // this.rayReadings.eachRay = [];
    this.rayReadings = {
      eachRay: []
    };
    this.folderList = [];
    this.userDataList = [];
    this.readings = [];
    this.socialReadings = [];
    this.favoriteFolders = [];
    this.allReadings = [];
    this.allSearchedReadings = [];  // 8-30
    this.allSocialReadings = [];  // 10-1
    this.lastID = '';
    this.folderIndex = -1;  // needs to be set by someone
    this.currentFolderDocID = '';
    this.searchActive = false;
    this.forceNavReset = false;
    this.foreignIdsToHarvest = [];
    this.idsToHarvest = [];
    this.foreignTarotReadings = [];
    this.ForeignTarotReadingsReadyState.subscribe( state => {
      // we've finished fetching foreign tarot readings
      if (state > 0) {
        // console.log('foreign social readings ready');
        this.cruchForeignReadingsToo();
      }
    });
    this.batchForeignReadingState.subscribe( stateb => {
      console.log('subscribe foreign readings', stateb);
      if (stateb === this.foreignIdsToHarvest.length) {
        // console.log('harvesting foreign readings', stateb, this.foreignIdsToHarvest.length);
        this.createTCIT(this.socialReadings);
        this.buildForeignThrowArray();  // kludge copy - should make 
        this.cruchForeignReadingsToo(); // ????
      }
    })
  }

  resetCache() {
    console.log('firestore service - reset cache');
    // called after login - forget all we knew
    const lenfl = this.folderList.length;
    for (let il = 0; il < lenfl; il++) {
      this.folderList.pop();
    }
    this.folderList = [];

    // const lenudl = this.userDataList.length;
    // for (let iud = 0; iud < lenudl; iud++) {
    //   this.userDataList.pop();
    // }
    // this.userDataList = [];
    // const lenr = this.readings.length;
    // for (let ir = 0; ir < lenr; ir++) {
    //   this.readings.pop();
    // }
    // this.readings = [];
    this.readings.splice(0, this.readings.length);

    // const lensr = this.socialReadings.length;
    // for (let isr = 0; isr < lenr; isr++) {
    //   this.socialReadings.pop();
    // }
    // this.socialReadings = [];
    this.socialReadings.splice(0, this.socialReadings.length);

    // const lenff = this.favoriteFolders.length;
    // for (let iff = 0; iff < lenfl; iff++) {
    //   this.favoriteFolders.pop();
    // }
    // this.favoriteFolders = [];
    this.favoriteFolders.splice(0, this.favoriteFolders.length);

    // const lenar = this.allReadings.length;
    // for (let iar = 0; iar < lenar; iar++) {
    //   this.allReadings.pop();
    // }
    // this.allReadings = [];
    this.allReadings.splice(0, this.allReadings.length);

    // const lenasr = this.allSearchedReadings.length;
    // for (let iasr = 0; iasr < lenar; iasr++) {
    //   this.allSearchedReadings.pop();
    // }
    // this.allSearchedReadings = [];  // 8-30
    this.allSearchedReadings.splice(0, this.allSearchedReadings.length);

    // const lenas = this.allSocialReadings.length;
    // for (let ias = 0; ias < lenas; ias++) {
    //   this.allSocialReadings.pop();
    // }
    // this.allSocialReadings = [];  // 10-1
    this.allSocialReadings.splice(0, this.allSocialReadings.length);

    this.lastID = '';
    this.folderIndex = -1;  // needs to be set by someone
    this.currentFolderDocID = '';
    this.searchActive = false;
    this.forceNavReset = false;
    // const lenfid = this.foreignIdsToHarvest.length;
    // for (let ifid = 0; ifid < lenfid; ifid++) {
    //   this.foreignIdsToHarvest.pop();
    // }
    // this.foreignIdsToHarvest = [];
    this.foreignIdsToHarvest.splice(0, this.foreignIdsToHarvest.length);
    // const lenid = this.idsToHarvest.length;
    // for (let iid = 0; iid < lenid; iid++) {
    //   this.idsToHarvest.pop();
    // }
    // this.idsToHarvest = [];
    this.idsToHarvest.splice(0, this.idsToHarvest.length);
    // const lenftr = this.foreignTarotReadings.length;
    // for (let iftr = 0; iftr < lenftr; iftr++) {
    //   this.foreignTarotReadings.pop();
    // }
    this.foreignTarotReadings.splice(0, this.foreignTarotReadings.length);
    // console.log('foreign readings', this.foreignTarotReadings.length);
    // this.foreignTarotReadings = [];
    this.ForeignTarotReadingsReadyState.next(0);  // reset
  }
 // this will discard previous reading set - so we can stay current
  // I think I'll call this every time the user goes 'home'
  public resetReadings() {
    this.readings = [];
    // this.allReadings = [];
    this.allReadings.splice(0, this.allReadings.length);
    this.allSearchedReadings = [];
    this.favoriteFolders = [];
    this.searchActive = false;
     console.log('reset firebase readings')
  }

  setSearchMode(searchMode: boolean) {
    // this is key - when search is active - we ignore all readings, and use allsearchedreadings
    // it should always be a toggle - but I'll code it so it's ok to keep hitting it with same value
 //    console.log('toogle - search mode', searchMode, this.searchActive);
    if (searchMode === true) {
      // we're going from active to inactive - not much to do
      this.searchActive = searchMode;
      // always do this
      if (true) {  // this.allSearchedReadings.length == 0) { // little trick - before a searchis done - make it work as before
        this.allReadings.forEach(read => {
          this.allSearchedReadings.push(read);
        });
      }
    }
    else {
      // search now off - reset things
      this.searchActive = searchMode;
    }
  }

  isSearchActive(): boolean {
    return this.searchActive;
  }

  // code to help nav control on left of diary reset
  shouldNavReset(): boolean {
    // console.log('should nav reset?', this.forceNavReset)
    return this.forceNavReset;
  }

  forceNavigationReset() {
    // called to force left nav to reset
    this.forceNavReset = true;
    // console.log('force nav reset')
  }

  clearNavReset() {
    this.forceNavReset = false;
    // console.log('clear nav reset')
  }

  // 8-30 new feature - search all readings - put results in filtered search results
  // 9-2 - added a card search - search for a card in the reading
  // card searches have a #sign as first charactger
  StartReadingSearch(searchTerm: string ): number {
    this.searchActive = true;
    let cardSearch = false;
    let searchString = searchTerm;
    if (searchTerm.length > 0) {
      // check for # - indicates card search
      const firstCh = searchTerm.substring(0, 1);
      if (firstCh === '#') {
        cardSearch = true;
        searchString = searchTerm.substring(1, searchTerm.length);
        searchString = searchString.toLowerCase();
      }
    }
    // console.log('start search', searchString, cardSearch);   //searchTerm);
    const len = this.allSearchedReadings.length;
    for (let i = 0; i < len; i++) {
      this.allSearchedReadings.pop();
      // console.log('pop prev search');
    }
    if (cardSearch) {
      this.doCardSearch(searchString);
    } else {
      this.doSubjectCommentSearch(searchTerm);
    }

    // console.log('search completed', this.allSearchedReadings.length, this.allSearchedReadings);
    return this.allSearchedReadings.length;
  }

  getNumSearchCardFound(): number {
    return this.allSearchedReadings.length;
  }

  doCardSearch(searchString: string) {
    // this is more complex than I hoped - because I can see that searching for 1w might match 11w - and they aren't the same card
    // I had hoped to do a trivial string compare - but I think I have to break the cards out into an array and search that way
    // console.log('card search', searchString);

    this.allReadings.forEach( read => {
      let found = false;
      // the ID of the card should match our search string
      for (let i = 0; i < read.numberCards; i++) {
        // console.log('match?', read.tarotCards[i].id, searchString);
        if (read.tarotCards[i].id == searchString) {
          found = true;
        }
      }
      if (found) {
        // console.log('found');
        this.allSearchedReadings.push(read);
      }
    });
  }
  doSubjectCommentSearch(searchTerm: string ) {
    // console.log('subject/comment search', searchTerm);
    this.allReadings.forEach( read => {
      const isSub = read.subject.toLowerCase().indexOf(searchTerm.toLowerCase());
      const isCom = read.comment.toLowerCase().indexOf(searchTerm.toLowerCase());
      // console.log('found?', isSub, read.subject, searchTerm, isCom, read.comment);
      if (isSub >= 0 || isCom >= 0) {
        // console.log('found');
        this.allSearchedReadings.push(read);
      }
    });
  }

  getCountOfReadings(readingFilter: FilterThrowsBy ): number {
    // go throw all the readings - and return the count of "this type"
    let count = 0;
    // console.log('getCountOfReadings - used to create filter', this.readingFilter, readingFilter.throwType, this.searchActive, this.allReadings.length);

    if (this.searchActive == false) {
      // default state -
      this.allReadings.forEach( read => {
     //    console.log('getting count', read.typeThrow, readingFilter.throwType, read, readingFilter);
        if (readingFilter.includeAll || read.typeThrow == readingFilter.throwType) {
          count++;
     //     console.log('filtered add', count, read.typeThrow, readingFilter.throwType, readingFilter.includeAll);
        }
        else
        {
       //   console.log(' no match ', read.typeThrow, readingFilter.throwType)
        }
     //   console.log(' no match ', read.typeThrow, readingFilter.throwType)
        if (readingFilter.throwType.toLowerCase() ==='three cards' && read.typeThrow === '3') {
          count++;
 //         console.log('kludge added', readingFilter.throwType, read.typeThrow);
        }
        if (readingFilter.throwType.toLowerCase() ==='one card' && read.typeThrow === '1') {
          count++;
  //        console.log('kludge added', readingFilter.throwType, read.typeThrow);
         }
         if (readingFilter.throwType.toLowerCase() === '11' && read.numberCards === 11) {
           count++;
       //    console.log('Pyramid?');
         }
      });
    }
    else {
      // when search is active - counts come from other array
      this.allSearchedReadings.forEach( read => {
        if (readingFilter.includeAll || read.typeThrow == readingFilter.throwType) {
          count++;
          // console.log('filtered add - search true', count, read.typeThrow);
        }
      });
    }
  //  console.log('getCountOfReadings - used to create filter', count, this.readingFilter, readingFilter.throwType, this.searchActive);
    return count;
  }

  async DofilteredReadings(readingFilter: FilterThrowsBy) {
    // 8-31-20 introduced search - where we use a different source for filters -> allSearchedReadings

  //  console.log('filter starting', readingFilter);
    // ??? somehow this gets called with a different filter ???
    // so if I was filtered by 3 cards and change to 1 card - it seems to filter again by 3, and then by 1 ??
    if (readingFilter.throwType !== this.readingFilter.throwType) {
       console.log('why was filter here? - returning early', this.readingFilter, readingFilter.throwType);
      return;
    }

    if (this.filteredReadings !== undefined) {
      const len = this.filteredReadings.length;
      // console.log('clear filtered?', len);
      for (let i = 0; i < len; i++) {
        this.filteredReadings.pop();
        // console.log('filtered pop');
      }
    }
    this.filteredReadings = []; // zap - redundant

    // console.log('all readings # - used to create filter', this.allReadings.length, this.searchActive);

    // ok - now there are two modes - normal, and search
    if (this.searchActive) {
      // here to look at the search results
      if (this.allSearchedReadings.length > 0) {
        this.allSearchedReadings.forEach( read => {
          if (readingFilter.includeAll || read.typeThrow == readingFilter.throwType) {
            // console.log('filtered add', this.filteredReadings.length, read.typeThrow);
            this.filteredReadings.push(read); // we'll take this
          }
        });
      }
    } else {
      // here to look at all readings
      let numberOfCards = parseInt(readingFilter.throwType);
      if (this.allReadings.length > 0) {
     
        this.allReadings.forEach( read => {
          // console.log('testing for inclusion...', 
          //   read.typeThrow, read.numberCards, numberOfCards, readingFilter.throwType, read.numberCards === numberOfCards);
          if (readingFilter.includeAll || read.typeThrow === readingFilter.throwType) {
        //     console.log('filtered add', this.filteredReadings.length, read.typeThrow);
            this.filteredReadings.push(read); // we'll take this
          }
          else 
          if (readingFilter.includeAll || read.numberCards === numberOfCards) {
       //     console.log('wow!', read.numberCards, readingFilter.throwType)
            this.filteredReadings.push(read); // we'll take this
          }
        });
      }
    }
      // ok - update for subscribers
      // console.log('setting filtered reading observe', this.filteredReadings.length);
    this.filteredReadingsReadyState.next(this.filteredReadings.length); // tell our subscriner
  }

// g.s. 8-2 not sure how to do this - but when a folder is selected - I'm going to set the "filtered readings" to what's in the folder
async SetFolderAsSourceForReadings(folderID: string[]) {
  // probably could just have passed the index - but let's be fancy
  // console.log('set folder - id', folderID);
  this.filteredReadings = []; // reset
  if (this.favoriteFolders.length > 0) {
    this.favoriteFolders.forEach(folder => {
      if (folder.folderID[0] == folderID[0]) {  // just match top index
        // found it
        // console.log('setting folder', folder);
        this.filteredReadings = folder.throw;
    }
  });
    // console.log('setting filtered reading observe', this.filteredReadings.length);
    this.filteredReadingsReadyState.next(this.filteredReadings.length);

  }
}

  // I guess a reading filter that's blank matches all
  async setReadingFilter (readingFilter: FilterThrowsBy): Promise<TarotCardsInThrow[]>
  {
    this.readingFilter = readingFilter;
    this.allReadings = [];  // zap
    console.log('set filter', readingFilter);
    const read = this.CreateListOfReadings().then(res => {
      // console.log('called it');
    });

    this.readingsReadyState.subscribe(state => {
      // console.log('have complete list of readings - ready to start filtering', state, this.allReadings.length, this.readingFilter)
      if (state > 0 && this.allReadings.length > 0)  {
        this.DofilteredReadings(readingFilter);
      }
    });

    //   return this.allReadings;
    // })

    return this.allReadings;
  }

  getCountOfAllReadings(): number {
    // console.log('get count of readings', this.allReadings.length);
    return this.allReadings.length; // just to see if we're done
  }

  getFilteredReadings(): TarotCardsInThrow[] {
    // console.log('returning filtered readings', this.filteredReadings)
    return this.filteredReadings;
  }

  createTCIT(aTarotThrow: ATarotThrow[]) {
    if (aTarotThrow != null && aTarotThrow.length > 0) {
     //  console.log('createTCIT - #', this.myThrows.length, aTarotThrow.length);
      aTarotThrow.forEach( aThrow => {
        const theCards: TarotCard[] = [];
        const eachCardId = aThrow.cardList.split(',', aThrow.numberCards);
        // console.log('creating cardlist', eachCardId, aThrow, aThrow.numberCards);
        for (let i = 0; i < aThrow.numberCards; i++) {
          const cardId = eachCardId[i];
          const aCard = this.tarotCardService.getOneCard(cardId);
          theCards.push(aCard);
          // console.log('TCIT add', aCard, cardId);
        }
        let modDate = aThrow.modifiedDateTime;
        if (modDate === undefined || modDate == null) {
          modDate = aThrow.dateTime;  // I think this is just because I didn't always use modified date
  //        console.log('zapped mod date');
        }
  //      console.log('reading dates', aThrow.dateTime, aThrow.modifiedDateTime, modDate, aThrow.subject); //, milliDate, realDate);

        const displayModDate = '';
        if (aThrow.subject === undefined) {
          aThrow.subject = '';
          console.log('undefined subject?')
        }
        // const readingName = '';
        const dispDate = this.makeCreativeDateFromAscii(aThrow.dateTime,  aThrow.modifiedDateTime);
        const rThrow: TarotCardsInThrow = {
          numberCards: aThrow.numberCards,
          typeThrow: aThrow.throwType,
          readingName: '',
          userID: aThrow.userID,
          dateTime: aThrow.dateTime,
          dateModified: aThrow.modifiedDateTime,
          subject:  aThrow.subject, // 8-16
          comment: aThrow.comment,
          tarotCards: theCards,
          displayDateTime:  dispDate,  // this.datepipe.transform(aThrow.dateTime, 'M/d/yy, h:mm a'),
          displayDateModified: this.datepipe.transform(modDate, 'M/d/yy, h:mm a'),  // displayModDate,
          open: false,
          keepCardsVisible: false,
          throwID: aThrow.throwID,
          throwDeleted : false
        };
        //console.log('TCIT ', rThrow.numberCards, rThrow.typeThrow)
        if (rThrow.numberCards === 1) {
          rThrow.typeThrow = 'One Card';
        } else if (rThrow.numberCards === 3) {
          rThrow.typeThrow = 'Three Cards';
        } else if (rThrow.numberCards === 11) {
          // rThrow.typeThrow = "Pyramid Reading"
          // rThrow.typeThrow = this.tarotCardService.GetTextForRay(); // 8-21 new
        }
        this.allReadings.push(rThrow);
        // console.log('clor - one reading', rThrow, rThrow.typeThrow, theCards, aThrow.throwID, this.allReadings.length);
      });
      // readings read - set the flag
       console.log('setting reading state ready', this.allReadings.length)
      this.readingsReadyState.next(this.allReadings.length);
    }
  }

  // this will create a complete list of readings for the user - we can filter this later
  async CreateListOfReadings(): Promise<TarotCardsInThrow[]> {
    console.log('create list of readings', this.allReadings.length);
    this.allReadings.splice(0, this.allReadings.length);
    
    this.allReadings = [];  // reset
    this.myThrows = []; // reset
    this.getThrowCollectionFromDb().then (data => {
    //   console.log('try to zap all')
      if (this.allReadings !== undefined) {
        const len = this.allReadings.length;
        for (let i = 0; i < len; i++) {
          this.allReadings.pop();
        //   console.log('all pop');
        }
      }
      console.log('create list of readings 2');
      
      this.myThrows = data;
      this.createTCIT(this.myThrows);  // refactored so I can call it twice...
    })
    // .catch(err => console.log('oops 1', err));
    console.log('created all readings', this.allReadings.length)
    return this.allReadings;
  }

  // I wish I had stored date as binary :) - but too late to change now - the program has been in use for 6 mo
  makeCreativeDateFromAscii(asciiDate: string, modDate?:string) {
    let displayDate = '';
    const dispTime = this.datepipe.transform(asciiDate, 'h:mm a');
    const dispDate = this.datepipe.transform(asciiDate, 'MMM d yy');

    const nSec = new Date((asciiDate as unknown) as number);
    const et = Date.now() -  nSec.getTime();
    const etSec = Math.round(et / 1000);
    const etMin = Math.round(etSec / 60);
    const etHour = Math.round(etMin / 60);
    const etDays = Math.round(etHour / 24);
 //   console.log('makeCreativeDateFromAscii', modDate, nSec, asciiDate, et, etSec, etMin, etHour, etDays);

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
    // console.log('makeCreativeDateFromAscii', displayDate, etDays, etHour, etMin, etSec);
    if (modDate !== undefined && asciiDate != modDate) {
      // let origDate = new Date(asciiDate);
      // origDate.setHours(0,0,0,0);
      // let modifiedDate = new Date(modDate);
      // modifiedDate.setHours(0,0,0,0);
      // let same = origDate === modifiedDate;
      // let same2 = origDate.getUTCDate() !== modifiedDate.getUTCDate();
      const editedDate = this.datepipe.transform(modDate, 'MMM d yy');
      let same = editedDate === dispDate;
      if (same === false) {
  //      console.log('working on edited date', same, asciiDate, modDate);
        // for now - just append edited and the date
        displayDate += " (text edited: " + editedDate + ")";

      } else {
  //      console.log('same dates');
      }

      
    }

    return displayDate;
  }

 // 7-24 -- implmenting the idea of filtered results
 // we'll get them all - then do a second filter
 // I have no idea if this will work - my hope is that changes to the list here will be reflected by the caller
 // if not - then they will have to subscribe to changes - which I'm nervous about implementing


// very specific method - just for the comment - for use with the comment editor
  async UpdateComment(throwID: string, comnt: string, subJ: string, theThrow: TarotCardsInThrow) {
    const now = new Date();
    // 7-29 updating display date while we're here
    const modDate = this.datepipe.transform(now, 'M/d/yy, h:mm a');
    theThrow.displayDateModified = modDate;
    // console.log('CALLING SERVER!!!!!! - update comment', now, throwID, modDate, this.fbUser.uid);
    this.db.collection('Readings').doc(throwID)
    .update( {
      comment: comnt,
      subject: subJ, // 8-16
      modifiedDateTime: now
    }).then(res => {

    }).catch (err => console.log('comment error', err));
  }


  renderOneCardThrow(doc): ATarotThrow {

    const aDoc = doc as firestore.DocumentSnapshot;
    try {
        let modDate = aDoc.data().modifiedDateTime; // probably will be undefined
        // console.log('one card', modDate, aDoc.data());
        if (modDate === undefined) {
          modDate = '';  // aDoc.data().dateTime.toDate();
        }

        // somehow I have to know how many cards there are - throwtype now isn't the # of cards

        const throwTy = aDoc.data().throwType;
        let numCards = throwTy;
        if (throwTy > 11 ) {
          numCards = 11;  // this is the rub
        }
        // console.log('adjusted # cards', throwTy, numCards);

        const returnedThrow =
        {
          numberCards: numCards, // aDoc.data().throwType,
          throwType: aDoc.data().throwType,
          cardList: aDoc.data().cardList,
          userID: aDoc.data().userId,
          comment: aDoc.data().comment,
          subject: aDoc.data().subject === undefined ? '' : aDoc.data().subject,
          dateTime: (aDoc.data().dateTime).toDate(),
  //        modifiedDateTime: (aDoc.data().dateTime).toDate(),  // modDate,  // g.s. 7-15 new
          modifiedDateTime: (aDoc.data().modifiedDateTime).toDate(),  // modDate,  // g.s. 7-15 new
          throwID: aDoc.data().id // aDoc.id
        };
  //      console.log('reading mod date?', returnedThrow.subject, returnedThrow.dateTime, returnedThrow.modifiedDateTime);
        // console.log('render one - confused by ids', returnedThrow, aDoc.id);
        // console.log('read throw', returnedThrow);
        return returnedThrow;
      }
      catch (err) {
        console.log(err);
        return null;
      }
  }

  // this returns list of throws for current user
  public async getThrowCollectionFromDb(): Promise<ATarotThrow[]> {
    this.readings = [];

    let user = null;
    try {
       user = await this.authService.getFirebaseUser();
      //  console.log('just got user', user);
    }
    catch (err) {
      console.log('get throw - user error', err);
      return this.readings;
    }
    if (user == null || user.uid == null) {
      return this.readings;
    }

    this.fbUser = user; // save it for later

    // console.log('ready to get throw', user.uid, this.readings);
    try {

       console.log('CALLING SERVER!!!!!!- readings', this.fbUser.uid);
      const readings = await this.db.collection('Readings',
      ref => ref.orderBy('dateTime', 'desc')
            .where('userId', '==', user.uid) // ???? need this to work - can't get all the readings every time
      )
      .get()
      .toPromise().then( (snapshot) => {
        this.readings = [];
        snapshot.docs.forEach(async doc => {
          const reading = await this.renderOneCardThrow(doc);
          // console.log('user ids match?', reading.userID, user.uid);
          if (reading.userID === user.uid) {
            this.readings.push(reading);
            // console.log('getting a throw', doc.data(), this.readings.length, reading);
          } else {
              // console.log('skipping this throw - not our user');
          }
        });
      }).catch(err => console.log('reading error', err));
    }
    catch (err) {
      console.log('error trying to read db', err);
    }
    return this.readings;
  }


  public async addReading(
    throwT: string,
    cardL: string,
    commnt: string,
    subj: string
  )
  // : Promise<void>
  {
    const id = this.db.createId();
  //  console.log('add reading', throwT, cardL, commnt);
    const now = new Date();
    // 7 includes a fix - make the throw id match the doc id
    const vers = 7; // latest change is adding a subject

    const user = await this.authService.getFirebaseUser();
    if (user != null && user.uid != null)
    {
      this.fbUser = user;
      // console.log('CALLING SERVER!!!!!! - add reading (v7)', id, throwT, cardL, commnt, subj, this.fbUser.uid);
      // this.db.collection('Readings').add( {
      this.db.collection('Readings').doc(id).set( {
        id,
        throwType: throwT,
        cardList: cardL,
        subject: subj,   // 8-16 new field
        comment: commnt,
        dateTime: now,
        modifiedDateTime: now,  // new field
        userId: user.uid,
        version: vers
      });
      this.tarotCardService.setNewReadingID(id);  // 10-7-20

      // let count = this.readingsReadyState.getValue();
      // this.readingsReadyState.next(count+1);  // bump
      // .then ( val => {
      //   console.log('reading id', val.id);
      //   this.lastID = val.id; // save for a rainy day
      // }
      // )
    }
  }


  public async deleteReading(readingID: string) {
    // console.log('CALLING SERVER!!!!!! -- deleting', readingID, this.fbUser.uid);
    this.db.collection('Readings').doc(readingID).delete().then (res => {

    }).catch(err => console.log('delete error', err))
    .finally( () => {
      // probably need to reload
      const read = this.CreateListOfReadings().then(res => {
        // console.log('called it');
      }).finally( () => {
        this.DofilteredReadings(this.readingFilter);
      });

    });
  }

  ///////// --- folders -------- /////////////
  async renderOneFolder(doc: firestore.DocumentData): Promise<FolderData> {

    const aDoc = doc as firestore.DocumentSnapshot;
    try {
      // let modDate = aDoc.data().modifiedDateTime; // probably will be undefined
      // console.log('one folder', aDoc.data());
      // const id = this.db.createId();
      const returnedThrow =
      {
        name: aDoc.data().name,
        readingID: aDoc.data().readingID,
        userID: aDoc.data().userID,
        folderID: aDoc.id
        // Math.floor(Math.random()*32).toString(32).toUpperCase()  //aDoc.data().favoritesID // this is always undefined...
      };
      // console.log('render one folder', returnedThrow);
      return returnedThrow;
    }
    catch (err) {
      console.log(err);
      return null;
    }
  }

  public async getFolderList(): Promise<FolderData[]> {
    const len = this.folderList.length;
    for (let i = 0; i < len; i++) {
      this.folderList.pop();
    }
    this.favoriteFolders = [];
    this.folderList = [];

    let user = null;
    try {
       user = await this.authService.getFirebaseUser();
      //  console.log('just got user', user)
    }
    catch (err) {
      console.log('get throw - user error', err);
      return this.folderList;
    }
    if (user == null || user.uid == null) {
      this.fbUser = user;
      return this.folderList;
    }

    // console.log('ready to get folders', user.uid, this.favoriteFolders);
    try {
       console.log('CALLING SERVER!!!!!! (favorites)', user.uid, this.favoriteFolders);
      const readings = await this.db.collection('favorites',
      ref => ref.orderBy('name')
            .where('userID', '==', user.uid) // ???? need this to work - can't get all the readings every time
      )
      .get()
      .toPromise().then( (snapshot) => {
        snapshot.docs.forEach(async doc => {
          const folder = await this.renderOneFolder(doc);
          this.folderList.push(folder);
          // console.log('read a folder', folder, this.folderList.length);
          // so while we're at it - let's do this
          this.AddReadingsToFolder(folder, this.favoriteFolders);
          // console.log('added folder', folder, this.folderList.length, this.favoriteFolders.length)
        });
      }).catch(err => console.log('reading error', err))
      .finally( () => {
          // 8-10 - can I update now?
          this.CreateFavoriteFoldersFromFolderList();
          // call rays here too?
          this.getRayReadingFolders();  // 8-27

          if (this.rayReadings !== undefined
             && this.rayReadings.eachRay !== undefined
             && this.rayReadings.eachRay[0] !== undefined
             ) {
            let num = 0;
            for (let i = 0; i < 9; i++) {
              num += this.rayReadings.eachRay[i].throw.length;
              // console.log('counting rays', num, this.rayReadings.eachRay[i].throw.length, this.rayReadings.eachRay[i].name)
            }

            // console.log('set ray state', this.rayReadings.eachRay.length, num);
            this.rayFolderState.next(num); // publish
          }

      });
    }
    catch (err) {
      console.log('error trying to read db', err);
    }
    return this.folderList;
  }

  async AddReadingsToFolder(aFolder, destFavFolder: FolderForReadings[]) {
    // first find folder if it's there
    let index = -1;
    let counter = 0;
    // console.log('try to add reading to folder', aFolder, this.favoriteFolders.length, this.allReadings.length);
    // console.log('try to add reading to folder', aFolder, destFavFolder.length, this.allReadings.length);
    // if (this.favoriteFolders.length > 0) {
    //   this.favoriteFolders.forEach( fold => {
    if (destFavFolder.length > 0) {
        destFavFolder.forEach( fold => {
        // console.log('looking for folder - match?', fold.name, aFolder.name)
        if (fold.name === aFolder.name) {
          index = counter;
          // console.log('found existing folder', index, this.favoriteFolders[index]);
        }
        counter++;
      });
    }
    // if we didn't find an entry - make one
    let ffr: FolderForReadings;
    if (index >= 0) {
      // ffr = this.favoriteFolders[index];
      ffr = destFavFolder[index];
      // console.log('found previous folder', ffr);
    }
    else {
      ffr = {
        name: aFolder.name,
        folderID: [],  // aFolder.folderID,
        ownerID : aFolder.userID,
        throw: [] // nothing yet
      };
      // console.log('creating new folder', ffr)
      // this.favoriteFolders.push(ffr); // make sure we add it - so it's now there
      destFavFolder.push(ffr); // make sure we add it - so it's now there
    }

    // if search is active - then need to use search results, not all readings as source
    if (this.searchActive) {
    // ok - now search through readings - see if we can find this one - add it if we can
    if (aFolder.readingID.length > 0) {
      this.allSearchedReadings.forEach(read => {
        // console.log('looking for readings - do these match?', read.throwID, aFolder.readingID);
        if (read.throwID === aFolder.readingID) {
          // having duplicates - not sure why
          const dup = this.CheckForDup(read.throwID, ffr.throw);
          if (dup == false) {
            // we have a match! - and no dup
            ffr.folderID.push(aFolder.folderID);
            ffr.throw.push(read);
            // console.log('adding reading', read)
          }
        }
      });
    }
    }
    else {
      // ok - now search through readings - see if we can find this one - add it if we can
      if (aFolder.readingID.length > 0) {
        this.allReadings.forEach(read => {
          // console.log('looking for readings - do these match?', read.throwID, aFolder.readingID);
          if (read.throwID === aFolder.readingID) {
            // having duplicates - not sure why
            const dup = this.CheckForDup(read.throwID, ffr.throw);
            if (dup == false) {
              // we have a match! - and no dup
              ffr.folderID.push(aFolder.folderID);
              ffr.throw.push(read);
              // console.log('adding reading', read)
            }
          }
        });
      }
    }

    // console.log('add readings to folder ->', ffr);
  }

  CheckForDup(throwID: string, listThrow: TarotCardsInThrow[]): boolean {
    let found = false;
    listThrow.forEach(aThrow => {
      // console.log('check dups ID', throwID, aThrow.throwID);
      if (throwID.trim() == aThrow.throwID.trim()) {
        // console.log('found dup');
        found = true;
      }
    });
    // console.log('checking dups ->', found);
    return found;
  }

  getPublicFolderList(): FolderForReadings[] {
    // console.log('getting folder list', this.favoriteFolders.length, this.favoriteFolders);
    return this.favoriteFolders;
  }

  async CreateListOfFolders(): Promise<FolderForReadings[]> {
    // console.log('firestore: create folder list')
    this.favoriteFolders = [];

    let folders = [];

    this.getFolderList().then (data => {
      folders = data;
      // console.log('get folders', folders, this.folderList);

      if (this.folderList != null && this.folderList.length > 0) {
// let's refactor to make a routine that starts with folder list and creates the favorite folder data
        this.CreateFavoriteFoldersFromFolderList();  // refactored - will include subscription publish
      }
    });
    return this.favoriteFolders;
  }

  public async addReadingToFolder(
    folderName: string,
    readID: string,
    resetFilteredList: boolean
  ) {
    const user = await this.authService.getFirebaseUser();
    // console.log('user', user, user.uid);
    if (user != null)
    {
      this.fbUser = user;
      // console.log('CALLING SERVER!!!!!! - add reading to folder', folderName, readID, resetFilteredList, this.fbUser.uid);
      const customId = this.db.createId();
      this.db.collection('favorites').doc(customId).set( {
        name: folderName,
        readingID: readID,
        userID: user.uid,
        // version: 1
      });
      // this.db.collection('favorites').add( {
      //   // id,
      //   name: folderName,
      //   readingID: readingID,
      //   userID: user.uid,
      //   // version: 1
      // })
      // .then(function(docRef) {
      // console.log('added reading - ID', customId, this.folderList);
        // let's update our list
      const newReading = {
          name: folderName,
          readingID: readID,
          userID: user.uid,
          folderID: customId
        };
      this.folderList.push(newReading);
      // console.log('adding reading ->', newReading, this.folderList);

      this.CreateFavoriteFoldersFromFolderList();

          // saw a problem where 'keep open' seemed stuck
      // console.log('before reset', this.filteredReadings);
      this.ResetKeepOpen();
      // console.log('after reset', this.filteredReadings);

        // let's update the filtered readings - used by table help
      if (resetFilteredList) {
          // not all callers are looking at the folder - so don't do this unless asked
          const len = this.filteredReadings.length;
          for (let i = 0; i < len; i++) {
            this.filteredReadings.pop();
            // console.log('pop add r2f');
          }
          this.filteredReadings = []; // sigh
          this.filteredReadings = this.favoriteFolders[0].throw;  // now we're pointing at all the readings in this folder (1st folder)
          // console.log('setting filtered observe', this.filteredReadings.length);
          this.filteredReadingsReadyState.next(this.filteredReadings.length); // tell our subscriner
            // // saw a problem where 'keep open' seemed stuck
            // console.log('before reset', this.filteredReadings);
            // this.ResetKeepOpen();
            // console.log('after reset', this.filteredReadings);

            // next is to reselect the folder
          this.SetFolderAsSourceForReadings(this.favoriteFolders[0].folderID);  // pick the first one...
          }


      // })

    }
  }

  // here to reset the keep open flag for all readings
  ResetKeepOpen() {
    if (this.filteredReadings.length > 0) {
      this.filteredReadings
      .filter( (item, itemIndex) => true)
      // .map(item => item.open = false); // used to be this
      .map(item => { {item.open = false; } });
    }
  }

  CreateFavoriteFoldersFromFolderList() {
    // this.favoriteFolders = [];  // zap - this doesn't work???
    // console.log('entering create fav folders - seem to be unable to clear previous data?',
    // this.favoriteFolders, this.allReadings.length);

    const tempFavFolder: FolderForReadings[] = [];
    // console.log('here to use folder data and create fav list', this.folderList.length, this.folderList, this.favoriteFolders);
    // so I spent a ton of time on this - folderlist is 0 first time through - even though console later shows it's filled

    // let's rework this to be a for loop? - for some reason foreach doesn't get called?
    for (let i = 0; i < this.folderList.length; i++) {
      const aFolder = this.folderList[i];
      this.AddReadingsToFolder(aFolder, tempFavFolder);
      // console.log('added folder', aFolder, tempFavFolder); //this.favoriteFolders)
    }
    // ok - last step - pray to God that I can copy the temp array into the final ????
    this.favoriteFolders = [];  // sigh
    this.favoriteFolders = Array.from(tempFavFolder);
    // console.log('finished folder list ?', this.favoriteFolders, tempFavFolder);
    this.FolderListReadyState.next(this.favoriteFolders.length);  // publish our list
    // console.log('set folders for subscribers', this.favoriteFolders.length)
    // console.log('done creating fav list ?', this.favoriteFolders, this.favoriteFolders.length);
  }


  public async removeReadingFromFolder(
    folderName: string,
    readingDocID: string)
  {
      if (folderName !== undefined && folderName.length > 0 && readingDocID !== undefined && readingDocID.length > 0) {
        // console.log('CALLING SERVER!!!!!! -- remove reading from folder', readingDocID, folderName, this.fbUser.uid);
        this.db.collection('favorites').doc(readingDocID).delete().then (res => {

        }).catch(err => console.log('delete error', err))
        .finally( () => {
              // probably need to reload
          const read = this.CreateListOfReadings().then(res => {
            // console.log('called it');
          }).finally( () => {
            this.DofilteredReadings(this.readingFilter);
          });
        });
        // ok - now adjust folder data list
        // find the index
        // console.log('ok - lets try to prune the cached database.', this.folderList);
        let index = 0;
        let foundIndex = -1;

        this.folderList.forEach(fold => {
          // console.log('fold and ids -> match?', fold, fold.folderID, readingDocID);
          if (fold.folderID.trim() === readingDocID.trim()) {
            // found it
            foundIndex = index;
            // console.log('found reading', foundIndex);
          }
          index++;
        });

        // console.log('about to purge? - purge indexes', index, foundIndex);
        if (foundIndex >= 0) {
          this.folderList.splice(foundIndex, 1); // remove that one  entry
          // console.log('has list been pruned?', readingDocID, this.folderList);  // yes - this works!
        }
        // console.log('folder list after purge ->', this.folderList);
        this.CreateFavoriteFoldersFromFolderList();

        // let's update the filtered readings - used by table help
        this.filteredReadings = []; // sigh
        if (this.favoriteFolders.length > 0) {
          this.filteredReadings =  this.favoriteFolders[0].throw;  // now we're pointing at all the readings in this folder (1st folder)
          // console.log('setting observe', this.filteredReadings.length);
          this.filteredReadingsReadyState.next(this.filteredReadings.length); // tell our subscriner
          this.SetFolderAsSourceForReadings(this.favoriteFolders[0].folderID);  // pick the first one...
        }
        // next is to reselect the folder

      }
  }

  getCurrentFolderDocID(): string {
    // hmm - sometimes we're not set up yet
    if (this.currentFolderDocID.length == 0) {
      console.log('wasnt set?? - dont know reading id', this.folderIndex);
    }
    return this.currentFolderDocID;
  }
  // only folder nav knows which folder is active - so it will set that - and the diary will set the throw ID
  setCurrentFolderIndex(folderIndex: number) {
    this.folderIndex = folderIndex;
    // console.log('firestore - folder index set', folderIndex);
  }
  // here's a way for the table component to tell us which reading from the folder they are on
 setCurrentReadingID(readingID: string)  {
    // everyone is a bit blind here - caller supplies the reading ID - and we'll tell them the folder doc ID
    // so we look through the IDs in our list of favorite folders
    // console.log('firestore: set current reading id', readingID, this.folderIndex)
    if (this.folderIndex < 0) {
      return '';
    }
    let retID = '';
    // console.log('get folder ID called', readingID, this.folderIndex, this.favoriteFolders);
    if (this.favoriteFolders.length == 0) {
      return; // nothing to do
    }
    let IDindex = 0;
    let foundIndex = -1;
    let found = false;
    this.favoriteFolders[this.folderIndex].throw.forEach(aThrow => {
      // find a match
      // console.log('searching for reading - match?', readingID, aThrow.throwID, IDindex);
      if (readingID.trim() == aThrow.throwID.trim()) {
        // console.log('found reading', IDindex);
        foundIndex = IDindex;
        found = true;
      }
      IDindex++;
    });
    if (found) {
      retID = this.favoriteFolders[this.folderIndex].folderID[foundIndex];
      // console.log('get the id - saving it', retID, this.folderIndex, foundIndex, retID);
    }
    this.currentFolderDocID = retID;
    // return retID;
  }

  async deleteFolder(folderName: string) {
    // console.log('here to delete folder', folderName);
    let user = null;
    try {
       user = await this.authService.getFirebaseUser();
    }
    catch (err) {
      console.log('get throw - user error', err);
      return this.readings;
    }
    // console.log('CALLING SERVER!!!!!!- delete favorite folder', folderName, this.fbUser.uid);
    const folders  = await this.db.collection('favorites',
    ref => ref
          .where('userID', '==', user.uid) // ???? need this to work - can't get all the readings every time
          .where('name', '==', folderName)
    )
    .get()
    .toPromise().then( (snapshot) => {
      snapshot.docs.forEach(async doc => {
        console.log('deleting fold-read', doc.data());
        doc.ref.delete().then(() => {
          // console.log('success');
        }).catch(err => console.log('oops 2', err));
      });
    }).catch(err => {
      console.log('error trying to delete folder', err);
    })
    .finally( () => {
      // 8-10 - can I update now?
      // console.log('now recreate our list', this.favoriteFolders.length, this.favoriteFolders);
      // perhaps there's a delay between delete and rebuild - but the folder remained
      // do it by hand - and update the subscription
      this.purgeFolderListUsingName(folderName);  // too bad
      // this.CreateFavoriteFoldersFromFolderList();
      // console.log('finished? recreate our list', this.favoriteFolders.length, this.favoriteFolders);
    });

    console.log('done delete folder', folderName);
  }

  purgeFolderListUsingName(folderName: string) {
    // console.log('enter purge - ', this.favoriteFolders.length, this.favoriteFolders);
    const tempList: FolderForReadings[] = [];
    this.favoriteFolders.forEach(folder => {
      // console.log('purge this?', folder);
      if (folder.name != folderName) {
        // console.log('purge kept', folder);
        tempList.push(folder);  // copy all but ones matching name
      }
    });
    // console.log('purge complete? - new - old', tempList, this.favoriteFolders);
    this.favoriteFolders = [];
    this.favoriteFolders = tempList;
    // console.log('purge copied', this.favoriteFolders.length, this.favoriteFolders);
    // console.log('purge setting reading observe', this.favoriteFolders.length);
    this.FolderListReadyState.next(this.favoriteFolders.length);  // publish our list
  }


  getOneRaysReadings(throwT: string): FolderForReadings {
    const aRay: FolderForReadings =  {
    name: 'Ray 1',  // this will be updated later
    folderID: [],
    ownerID: this.allReadings.length > 0 ? this.allReadings[0].userID : '',
    throw: []
    };
    // 8-31 search introduces a second mode - if search, take from search readings, not all readings
    if (this.searchActive) {
      for (let i = 0; i < this.allSearchedReadings.length; i++) {
        // console.log('gather rays - match?', throwT, this.allReadings[i].typeThrow);
        if (this.allSearchedReadings[i].typeThrow == throwT) {
          // add this reading to this ray
          // somehow number of cards gets messed up?
          const numC = this.allSearchedReadings[i].numberCards;
          this.allSearchedReadings[i].numberCards = 11; // updated
          // console.log('fix?', numC, this.allReadings[i].numberCards, this.allReadings[i].typeThrow);
          aRay.folderID.push(throwT);  // doesn't map
          aRay.throw.push(this.allReadings[i]);
          // console.log('matched', aRay);
        }
      }
    } else {
      for (let i = 0; i < this.allReadings.length; i++)
      {
        // console.log('gather rays - match?', throwT, this.allReadings[i].typeThrow);
        if (this.allReadings[i].typeThrow == throwT) {
          // add this reading to this ray
          // somehow number of cards gets messed up?
          const numC = this.allReadings[i].numberCards;
          this.allReadings[i].numberCards = 11; // updated
          // console.log('fix?', numC, this.allReadings[i].numberCards, this.allReadings[i].typeThrow);
          aRay.folderID.push(throwT);  // doesn't map
          aRay.throw.push(this.allReadings[i]);
          // console.log('matched', aRay);
        }
      }
    }
    return aRay;
  }
  // --- nine rays - we'll prepare a list - similar to folders - of how many readings are in each of the rays
  // I would rather have this code somewhere else - but one service can't call another - so I guess I have to have it here

getRayReadingFolders(): RayReadingsFolders {
    this.rayReadings = {
      eachRay: []
    };
    this.rayReadings.eachRay = [];

    if (this.allReadings.length != 0) {
    // this.allReadings = this.firestoreService.allReadings;	// it's public - and should be populated by now
    // console.log('getting rays', this.allReadings.length);
    // I think I'll just collect it in long hand - ray by ray
    let aRay = this.getOneRaysReadings('111');
    aRay.name = 'Ray 1';
    this.rayReadings.eachRay.push(aRay);
    // console.log('111', aRay);

    aRay = this.getOneRaysReadings('211');
    aRay.name = 'Ray 2';
    this.rayReadings.eachRay.push(aRay);

    aRay = this.getOneRaysReadings('311');
    aRay.name = 'Ray 3';
    this.rayReadings.eachRay.push(aRay);
    // console.log('collecting rays - off by one?', aRay, this.rayReadings);

    aRay = this.getOneRaysReadings('411');
    aRay.name = 'Ray 4';
    this.rayReadings.eachRay.push(aRay);

    aRay = this.getOneRaysReadings('511');
    aRay.name = 'Ray 5';
    this.rayReadings.eachRay.push(aRay);
    // console.log('collecting rays - off by one?', aRay, this.rayReadings);

    aRay = this.getOneRaysReadings('611');
    aRay.name = 'Ray 6';
    this.rayReadings.eachRay.push(aRay);
    // console.log('collecting rays - off by one?', aRay, this.rayReadings);

    aRay = this.getOneRaysReadings('711');
    aRay.name = 'Ray 7';
    this.rayReadings.eachRay.push(aRay);

    aRay = this.getOneRaysReadings('811');
    aRay.name = 'Ray 8';
    this.rayReadings.eachRay.push(aRay);

    aRay = this.getOneRaysReadings('911');
    aRay.name = 'Ray 9';
    this.rayReadings.eachRay.push(aRay);

    }
    // see if any rays - if yet, let's try to force an update with behavioral subject
    // console.log('have rays', this.rayReadings);
    return this.rayReadings;
  }


  GetUserUsingID(usrID: string): UserData {
 //   console.log('get user with id', usrID, this.userDataList.length, this.userDataList);
    let foundUser: UserData = null;
    if (this.userDataList.length > 0) {
      this.userDataList.forEach(usr => {
        // console.log('match?', usrID, usr.userID, usr.nickName, usr.firstName, usr.profilePicURL);
        if (usr.userID === usrID) {
          // console.log('found user', usr);
          foundUser = usr;
        }
      });
    }
    else
    {
      console.log('users not loaded yet!');
      // console.trace();
    }
    // console.log('did I find', foundUser);
    if (foundUser == null) {
      // console.log('couldn not find user!');
      // console.trace('couldn not find user');
    }
    return foundUser;
  }
  getListOfUsers(): UserData[] {
    return this.userDataList;
  }

  searchForUsers(userID: string, searchTerm: string, includeFriends: boolean): UserData[] {
    const results: UserData[] = [];
    if (searchTerm.length > 0) {
      // console.log('search users', searchTerm);
      this.userDataList.forEach(usr => {
        const fn = usr.firstName === undefined ? '' : usr.firstName;
        const ln = usr.lastName === undefined ? '' : usr.lastName;
        const nn = usr.nickName === undefined ? '' : usr.nickName;
        const em = usr.email === undefined ? '' : usr.email;

        const isf = fn.toLowerCase().indexOf(searchTerm.toLowerCase());
        const isl = ln.toLowerCase().indexOf(searchTerm.toLowerCase());
        const isn = nn.toLowerCase().indexOf(searchTerm.toLowerCase());
        const ise = em.toLowerCase().indexOf(searchTerm.toLowerCase());
        // console.log('search user', searchTerm, isf, isl, isn, ise, usr, fn, ln, nn, em);
        if (isf >= 0 || isn >= 0 || isl >= 0 || ise >= 0) {
          // test to see if we have him already
          const index = results.length > 0 ? results.indexOf(usr) : -1;
          // console.log('may add user', index, results.length, usr, usr.email);
          if (index < 0) {
            if (usr.userID !== userID) {
              // console.log('adding', usr.email);
              results.push(usr);
            } 
            // else { console.log('skipping myself'); }
          }
        }
      });
    }
    // console.log('search results', results.length, results);
    return results;
  }

  addUsrToList(usr: firestore.QueryDocumentSnapshot) {
    // console.log('looking for user id', usr, usr.id)
    // export interface UserData {
    //   firstName: string;
    //   lastName: string;
    //   nickName: string;
    //   City: string;
    //   State: string;
    //   birthday: Timestamp;
    //   email: string;
    //   interests: string;
    //   notes: string;
    //   role: string;
    // dateCheckFriends: Timestamp = new Timestamp(0, 0);
    // dateCheckReadings: Timestamp = new Timestamp(0, 0);
    // dateCheckComments: Timestamp = new Timestamp(0, 0);
    // }
    const userDat = {
      firstName: usr.data().firstName,
      lastName: usr.data().lastName,
      nickName: usr.data().nickName,
      City: usr.data().City,
      State: usr.data().State,
      birthday: usr.data().birthday,
      dateCheckFriends: usr.data().dcFriends,
      dateCheckReadings: usr.data().dcReadings, 
      dateCheckComments: usr.data().dcComments,
      email: usr.data().email.toLowerCase(),
      interests: usr.data().interests,
      notes: usr.data().notes,
      role: usr.data().role,
      userID: usr.id,
      profilePicURL: usr.data().profilePicURL,
      friend: false
    };
    if (userDat.profilePicURL === '' || userDat.profilePicURL === undefined) {
      userDat.profilePicURL = '../assets/img/persons.png';  // empty
    }
    // 5-7-22
    if (userDat.dateCheckFriends === undefined) {
      userDat.dateCheckFriends = Timestamp.fromDate(new Date("May 5, 2020")); // really old
    }
    if (userDat.dateCheckReadings === undefined) {
      userDat.dateCheckReadings = Timestamp.fromDate(new Date("May 5, 2020")); // really old
    }
    if (userDat.dateCheckComments === undefined) {
      userDat.dateCheckComments = Timestamp.fromDate(new Date("May 5, 2020")); // really old
    }
    const index2 = this.userDataList.findIndex(i => i.userID === userDat.userID);
    if (index2 < 0) {
      this.userDataList.push(userDat);
    }
    // console.log('adding user', userDat, this.userDataList);
  }

  public async getUsers() {
    this.userDataList = [];
     console.log('DB-read:*****  users', this.userDataList.length);
    try {
      this.db.collection('users',
      ref => ref.orderBy('lastName'))
      .get()
      .toPromise()
      .then( (snapShot) => {
        snapShot.forEach(usr => {
          // console.log('read user', usr);
          this.addUsrToList(usr);
        });
      })
      .finally( () => {
  //       console.log('done', this.userDataList);
        if (this.userDataList.length > 0) {
          this.usersReadyState.next(this.userDataList.length);
          console.log('set user subscribe', this.userDataList.length);
        }
       
      });
    }
    catch (err) {
      console.log('get user error', err);
    }
  }

  getUserUsingEmail(emailAdr: string): UserData  {
    let userFnd: UserData = null;
    // console.log('get user with email', emailAdr);
    this.userDataList.forEach(usr => {
      // console.log('get user', usr.email);
      if (usr.email === emailAdr.toLowerCase()) {
        // console.log('found user using email', usr);
        userFnd = usr;
        return userFnd;
      }
    });
    return userFnd;
  }

  findTarotThrowByID(tarotThrowID: string): TarotCardsInThrow {
    let foundReading: TarotCardsInThrow = null;
    if (this.allReadings.length == 0) {
      // console.log('nothing to search through');
    } else {
      this.allReadings.forEach(read => {
        if (read.throwID === tarotThrowID) {
          foundReading = read;
   //        console.log('found throw by id', read, tarotThrowID);  
        }
      });
    }
    // ???? 1/21 - perhaps search social too ???
    // if (this.allSocialReadings.length >0) {
    //   this.allSocialReadings.forEach(sr => {
    //     if (sr !== null) {
    //       if (sr.throwID === tarotThrowID) {
    //         foundReading = sr;
    //       }
    //     }
    //   })
    // }
    if (foundReading === null) {
   //   console.log('couldnt find reading', this.allReadings.length, this.allSocialReadings.length);
    }
    return foundReading;
  }

  findForeignTarotThrowByID(tarotThrowID: string): TarotCardsInThrow {
    // console.log('search foreign throws by id', tarotThrowID, this.foreignTarotReadings);
    let foundReading: TarotCardsInThrow = null;
    if (this.foreignTarotReadings.length === 0) {
      // console.log('nothing to search through');
    } else {
      this.foreignTarotReadings.forEach(read => {
        if (read.throwID === tarotThrowID) {
          foundReading = read;
          // console.log('found foreign throw by id', read);
        }
      });
    }
    if (foundReading === null) {
      console.log('couldnt find foreign reading', this.allReadings.length);
    }
    return foundReading;
  }

  // call this to refresh things - no database read done
  crunchAllReadings(userID: string) {
    console.log('crunchAllReadings', this.allSocialReadings.length, this.idsToHarvest.length, this.idsToHarvest);
    this.allSocialReadings.splice(0, this.allSocialReadings.length);  // 1/18/21 ?
    this.idsToHarvest.forEach(harv => {
        // get the reading from our own list
      const foundReading = this.findTarotThrowByID(harv.tarotThrowID);
   //    console.log('crunch readings', foundReading, this.allSocialReadings.length, this.allSocialReadings);
      this.allSocialReadings.push(foundReading);
      // console.log('refresh social - get throw', harv.tarotThrowID, foundReading, this.allSocialReadings);
    });
    this.cruchForeignReadingsToo();
  }

  async cruchForeignReadingsToo() {
    // this.fbUser = await this.authService.getFirebaseUser();
     console.log('crunch foreign readings', this.foreignTarotReadings.length, this.foreignIdsToHarvest.length);  // this.fbUser.uid
    this.foreignIdsToHarvest.forEach(harv => {
      // get the reading from our own list
      const foundReading = this.findForeignTarotThrowByID(harv.tarotThrowID);
      this.allSocialReadings.push(foundReading);
      // console.log('cruch foreign social - get throw', harv.tarotThrowID, foundReading, this.allSocialReadings.length);
    });
    // console.log('crunch foreign readings', this.foreignTarotReadings.length, this.foreignIdsToHarvest.length, this.allSocialReadings.length);
  }

  getAllReadings() {
     console.log('returning all readings', this.allReadings.length);
    return this.allReadings;
  }

  crunchSocialReadings(userID: string, data: HarvestID[]) {   // fetchForeign: boolean
    this.idsToHarvest = data;
    // const lenF = this.foreignIdsToHarvest.length;
    // for (let i = 0; i < lenF; i++) {
    //   this.foreignIdsToHarvest.pop();
    // }
    this.foreignIdsToHarvest.splice(0, this.foreignIdsToHarvest.length);  // 1/18/21 ?
    this.allSocialReadings.splice(0, this.allSocialReadings.length);  // 1/18/21 ?
 //   console.log('ready to crunch social readings', this.idsToHarvest, this.allReadings.length, this.allSocialReadings.length);
    // there are two sorts of readings - ones from us and ones from others
    // first step is to be able to display our own readings.
    // const len = this.allSocialReadings.length;  // remove the old
    // for (let i = 0; i < len; i++) {
    //   this.allSocialReadings.pop();
    // }
    if (this.allReadings.length === 0) {
      console.log('too soon to crunch!');
      return;
    }
    this.idsToHarvest.forEach(harv => {
      if (harv.userID !== userID) {
        // we'll need to fetch these throws - that comes later
        const index2 = this.foreignIdsToHarvest.findIndex(i => i.tarotThrowID === harv.tarotThrowID);
        // console.log('id to harvest - add?', index2, harv.tarotThrowID);
        if (index2 < 0) {
          this.foreignIdsToHarvest.push(harv);  // we'll fetch these next
        }
        
        // console.log('yikes - dont have another users reading', harv, this.foreignIdsToHarvest);
      } else {
        // get the reading from our own list
        const foundReading = this.findTarotThrowByID(harv.tarotThrowID);
        if (foundReading != null) {
          this.allSocialReadings.push(foundReading);
        }
        // console.log('cruch social - get throw', harv.tarotThrowID, foundReading, this.allSocialReadings);
      }
    });
    if (this.foreignIdsToHarvest.length > 0 && this.socialReadings.length === 0 ) {  // && fetchForeign added flag so don't fetch a second time
    // if (this.foreignIdsToHarvest.length > 0  ) {  // && fetchForeign added flag so don't fetch a second time
      // console.log('calling to read foreign readings', this.foreignIdsToHarvest.length);
      this.readForeignReadings(); // only way to get there
    }
    this.SocialReadingReadyState.next(this.allSocialReadings.length); // 1-18-21
    console.log('bumped social', this.allSocialReadings.length);
  }


  findSocialTarotThrowByED(tarotThrowID: string): TarotCardsInThrow {
    let foundReading: TarotCardsInThrow = null;
    // console.log('search for social reading', this.allSocialReadings, tarotThrowID, this.allSocialReadings.length);
    if (this.allSocialReadings.length === 0) {
      console.log('nothing to search through');
    } else {
      this.allSocialReadings.forEach(read => {
        if (read !== null) {
          // console.log('looking for social throw', read.throwID, tarotThrowID, read.displayDateTime, read.subject);
          if (read.throwID === tarotThrowID) {
            foundReading = read;
            // console.log('found social throw by id', read);
          }
        }
        else {console.log('null reading?');}
      });
    }
    return foundReading;
  }

  readForeignReadings() {
    // here to fetch all the readings others have shared with us
    // console.log('here to read foreign readings', this.foreignIdsToHarvest);
    // const ln = this.socialReadings.length;
    // for (let i = 0; i < ln; i++) {
    //   this.socialReadings.pop();
    // }
    this.socialReadings.splice(0, this.socialReadings.length);

    if (this.foreignIdsToHarvest.length === 0) {
      console.log('no foreign readings to do');
      return;
    }
     // 2-5-21 split this into multiple calls to the server - there's a limit of 10 IDs I can use for a read
    // so I'm adding a loop
    let idsRead = 0;  // perhaps one pass - perhaps more...
    const dataID: string[] = [];
    // now have simple array of ids - we'll iterate using that array
    this.foreignIdsToHarvest.forEach(item => {
      dataID.push(item.tarotThrowID); // yikes! 10 max
    });
    let index = 0;
    let loopCnt = dataID.length > 10 ? 10: dataID.length;
    while (index < dataID.length) {
      // console.log('starting foreign loop', dataID.length, index, loopCnt);
      let data: string[] = [];
      let j = 0;
      for (let i=index; j < loopCnt; i++) {
        data.push(dataID[i]);
        // console.log('adding data', dataID[i], i, index, loopCnt);
        index++;
        j++;
      }
      loopCnt = dataID.length - index > 10 ? 10 : dataID.length - index;
     
      // console.log('ready to read foreign ids', data.length, data)
      this.collectForeignReadings(data);
    }
    // console.log('out of foreign loop');

    // i'll have to figure out how to know when all readings finished - but when they're done - do this
    // this.createTCIT(this.socialReadings);
    // this.buildForeignThrowArray();  // kludge copy - should make a common routine
   
    // kludge reminder for myself
    // if (this.foreignIdsToHarvest.length > 10) {
    //   window.alert('tell Gene he never implemented get when more than 10 IDs');
    // }
   

    // const myRead = this.db.collection('Readings');
    // // first try all - but will need to set up groups of 10
    
    // this.foreignIdsToHarvest.forEach(item => {
    //   cnt++;
    //   console.log('foreign ', cnt);
    //   if (cnt < 10) {
    //     data.push(item.tarotThrowID); // yikes! 10 max
    //   } else { console.log('foreign skip');}
    // });

    // console.log('CALLING SERVER!!!!!! - foreign readings', data);
    // this.db.collection('Readings', ref => ref.where('id', 'in',  data) )
    // .get()
    // .toPromise().then( (snapshot) => {
    //   // console.log('did server call?', snapshot, snapshot.docs);
    //   snapshot.docs.forEach(async doc => {
    //     const reading = await this.renderOneCardThrow(doc);
    //     this.socialReadings.push(reading);
    //     // 1-23-21 ??
    //     // this.allReadings.push(reading);
    //     // console.log('foreign doc', reading.throwID, reading,  this.socialReadings);
    //   });
    // })
    // .finally( () => {
    //   // I think we should have all the foreign readings now
    //   this.createTCIT(this.socialReadings);
    //   this.buildForeignThrowArray();  // kludge copy - should make a common routine
    // });
    // console.log('?read foreign', data);
  }

  collectForeignReadings(data: string[]) {

    const myRead = this.db.collection('Readings');
    // first try all - but will need to set up groups of 10

    console.log('CALLING SERVER!!!!!! - foreign readings', data);
    this.db.collection('Readings', ref => ref.where('id', 'in',  data) )
    .get()
    .toPromise().then( (snapshot) => {
      // console.log('did server call?', snapshot, snapshot.docs);
      snapshot.docs.forEach(async doc => {
        const reading = await this.renderOneCardThrow(doc);
        const index2 = this.socialReadings.findIndex(i => i.throwID === reading.throwID);
        // console.log('should add?', index2, reading.throwID, this.socialReadings.length);
        if (index2 < 0) {
          this.socialReadings.push(reading);
          // 1-23-21 ??
          // this.allReadings.push(reading);
          // console.log('foreign doc added',index2, reading.throwID, reading,  this.socialReadings.length);
        }
      });
    })
    .finally( () => {
      this.batchForeignReadingState.next(this.socialReadings.length); // 2-6-21
      console.log('bump foreign readings', this.socialReadings.length);
      // I think we should have all the foreign readings now
      // this.createTCIT(this.socialReadings);
      // this.buildForeignThrowArray();  // kludge copy - should make a common routine
    });
  }

  buildForeignThrowArray() {
    if (this.socialReadings != null && this.socialReadings.length > 0) {
      this.foreignTarotReadings.splice(0, this.foreignTarotReadings.length);
      console.log('social clor - #', this.socialReadings.length);
      this.socialReadings.forEach( aThrow => {
        const theCards: TarotCard[] = [];
        const eachCardId = aThrow.cardList.split(',', aThrow.numberCards);
        // console.log('creating cardlist', eachCardId, aThrow, aThrow.numberCards);
        for (let i = 0; i < aThrow.numberCards; i++) {
          const cardId = eachCardId[i];
          const aCard = this.tarotCardService.getOneCard(cardId);
          theCards.push(aCard);
        }
        // console.log('foreign throw ID??', aThrow.throwID);
        let modDate = aThrow.modifiedDateTime;
        if (modDate === undefined || modDate == null) {
          modDate = aThrow.dateTime;  // I think this is just because I didn't always use modified date
        }
        // console.log('reading dates', aThrow.dateTime, aThrow.modifiedDateTime, modDate); //, milliDate, realDate);

        const displayModDate = '';
        if (aThrow.subject === undefined) {
          aThrow.subject = '';
        }
        const readingName = '';
        const dispDate = this.makeCreativeDateFromAscii(aThrow.dateTime, aThrow.modifiedDateTime);
        const rThrow: TarotCardsInThrow = {
          numberCards: aThrow.numberCards,
          typeThrow: aThrow.throwType,
          readingName: '',
          userID: aThrow.userID,
          dateTime: aThrow.dateTime,
          dateModified: aThrow.modifiedDateTime,
          subject:  aThrow.subject, // 8-16
          comment: aThrow.comment,
          tarotCards: theCards,
          displayDateTime: dispDate,  // this.datepipe.transform(aThrow.dateTime, 'M/d/yy, h:mm a'),
          displayDateModified: this.datepipe.transform(modDate, 'M/d/yy, h:mm a'),  // displayModDate,
          open: false,
          keepCardsVisible: false,
          throwID: aThrow.throwID,
          throwDeleted : false
        };
        if (rThrow.numberCards === 1) {
          rThrow.typeThrow = 'One Card';
        } else if (rThrow.numberCards === 3) {
          rThrow.typeThrow = 'Three Cards';
        } else if (rThrow.numberCards === 11) {
          // rThrow.typeThrow = "Pyramid Reading"
          // rThrow.typeThrow = this.tarotCardService.GetTextForRay(); // 8-21 new
        }
        this.foreignTarotReadings.push(rThrow);
        // console.log('clor - one foreign reading', rThrow, rThrow.typeThrow, aThrow.throwID, this.foreignTarotReadings.length);
      });
      // readings read - set the flag
      console.log('setting reading state ready', this.foreignTarotReadings.length)
      this.ForeignTarotReadingsReadyState.next(this.foreignTarotReadings.length);
    }
  }

  async UpdateID(docID: string) {
    // console.log('CALLING SERVER!!!!!! - update ID to doc ID', docID);
    this.db.collection('Readings').doc(docID)
    .update( {
      id: docID
    }).then(res => {
    }).catch (err => console.log('update ID error', err));
  }

  // 10-3 discovered the ids in all my readings don't match the document id
  // sothis is a repair method I'll just call once to update everything
  async repairReadingIDS() {

    // Get a new write batch
    // try
    console.log('THROW ID REPAIR KLUDGE');
    {

      console.log('CALLING SERVER!!!!!!- readings', this.fbUser.uid);
      const readings = await this.db.collection('Readings',
      ref => ref.orderBy('dateTime', 'desc')
      )
      .get()
      .toPromise().then( (snapshot) => {
        this.readings = [];
        snapshot.docs.forEach(async doc => {
          console.log('repair ', doc.data().id, doc.id );
          this.UpdateID(doc.id);
        });
      }).catch(err => console.log('reading error', err));
    }

    // const writeBatch = this.db.firestore.batch();
    // const docsRef = this.db.collection('Readings');
    // const readings = await this.db.collection('Readings',
    //   ref => ref.orderBy('dateTime', 'desc')
    //   )
    //   .get()
    //   .toPromise().then( (snapshot) => {
    //     this.readings = [];
    //     snapshot.docs.forEach(async doc => {
    //       writeBatch.update(docsRef, {
    //         'id': doc.id });
    //       })
    //       });
    //     });
  }


}
