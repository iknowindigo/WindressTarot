import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TarotCard } from '../tarotCard.model';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy, FolderForReadings } from '../../services/tarot-cards.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthenticationService } from '../../services/authentication.service';
import { FirestoreService } from '../../services/firestore.service';
import { DatePipe } from '@angular/common';
import {firestore} from 'firebase/app';
import { CardSearchComponent} from '../../component/card-search/card-search.component';
import * as jsPDF from 'jspdf';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20
import Timestamp = firestore.Timestamp;
// import { IonicContextMenuModule } from 'ionic-context-menu';


export interface CardDetails {
  card: TarotCard;
  positionText: string;
}

@Component({
  selector: 'app-diary',
  templateUrl: './diary.page.html',
  styleUrls: ['./diary.page.scss'],
})
export class DiaryPage implements OnInit {
  myThrows: ATarotThrow[];
  myThrowsReadyForRendering: TarotCardsInThrow[];
  // textForEachPosition: string[];
  user: firebase.User;
  automaticClose: boolean;
  throws: any[];
  noThrowsSavedYet: boolean;
  tinyScreen: boolean; // try to hide splitter on smaller screens
  numberOfReadings: number; // to be displayed in caption
  favoriteFolders: FolderForReadings[];
  items: string [];  // for directive testing 8-12
  searchTerm: string;
  searchMode: boolean;
  // cardSearchMode : boolean;
  searchButtonText: string;
  currentSearchText: string;
  @ViewChild('searchCardBtn') searchCardBtn: ElementRef; // back door way to update the folder list after delete
  showSearchCard: boolean;
  cardSearchStarted: boolean;
  displayName: string;

  constructor(
	private authService: AuthenticationService,
	private tarotCardService: TarotCardsService,
	private firestoreService: FirestoreService,
	private alertCtrl: AlertController,
	private router: Router,
	private modalCtrl: ModalController,
	private realtimeDB: RealtimeDbService,
	// private matTree: MatTreeModule,
	// private treeControl: FlatTreeControl<DynamicFlatNode>,
	// private modalController: ModalController,
	public datepipe: DatePipe
  ) {
	this.searchCardBtn = null;
	this.automaticClose = true;
	this.searchMode = false;
	// this.cardSearchMode = false;
	this.showSearchCard = true;
	this.cardSearchStarted = false;

	this.myThrows = [];
	this.user = null;
	this.noThrowsSavedYet = false;
	this.myThrowsReadyForRendering = [];  // zap
	this.items = ['apple', 'pear', 'orange'];
	this.searchTerm = ''; // zap
	this.searchButtonText = 'Search for Text';
	this.currentSearchText = '';

	this.user = this.authService.getCurrentFBUser();
	if (this.user === null || this.user === undefined || this.user.uid === null) {
	  return;
	}
	this.displayName = '??';  // trying to force update?
	this.displayName = this.user.email;
	// console.log('setting display name', this.displayName);
  }

  // working on toggling table - expand/collapse
  // have a problem where if a user prints or saves or edits or does something - we end up with everything collapsed
  // let's make a rule that there must be one row open always
  // we'll remember each row that got opened - as last row opened - and if all are closed, then we'll reopen last row opened


  // ok - huge step forward - diary will trigger search - and set db into search mode - where only filtered search results are seen
  onSearch(ev) {
	console.log('search?', ev, this.searchTerm);
	this.firestoreService.StartReadingSearch(this.searchTerm);
	this.currentSearchText = 'Search: ' + this.searchTerm;
	this.searchTerm = ''; // zap
	this.firestoreService.forceNavigationReset(); // this will force the navigation control to switch to all readings
  }

  // searchCard() {
  //   console.log('will soon have search for a card');
  // }

  ShowHideSearch() {
	// toggle the search mode - on or off
	// console.log('clicked close?', this.cardSearchStarted , this.searchMode);
	if (this.cardSearchStarted ) {   // we've hidden the button if we did a card search // (!this.cardSearchMode) {

		// console.log('search now', this.searchMode, this.cardSearchStarted );
		this.searchMode = false;  // just to be sure
		this.firestoreService.setSearchMode(false);  // this.searchMode);
		this.searchButtonText =  'Search for Text';
		this.showSearchCard = true;
		this.currentSearchText = '';
		this.firestoreService.forceNavigationReset(); // this will tell the nav control to reset

	} else {
		this.searchMode = !this.searchMode;
		// console.log('search now', this.searchMode);
		this.firestoreService.setSearchMode(this.searchMode);
		this.searchButtonText = this.searchMode ? 'Close Search' : 'Search for Text';
		if (this.searchMode == false) {
		this.currentSearchText = '';
		this.firestoreService.forceNavigationReset(); // this will tell the nav control to reset
		}
	}

  }


  toggleSelection(index) {

	// ? repair function ? I just don't understand it - if all closed -then open one up
	// this.repairOpenSetting(index);

	// console.log('toggle called', index, 'keep open',
		// this.myThrowsReadyForRendering[index].keepCardsVisible,
		// this.myThrowsReadyForRendering[index].open,
		// this.myThrowsReadyForRendering.length);
	// console.log('toggle comment', this.myThrowsReadyForRendering[index].comment);
	if (this.myThrowsReadyForRendering[index].open == false
		&& this.myThrowsReadyForRendering[index].keepCardsVisible == false) {

		this.myThrowsReadyForRendering[index].open = true; // !this.myThrowsReadyForRendering[index].open;
		this.tarotCardService.setCurrentThrow(this.myThrowsReadyForRendering[index]);
		// 8-6 update folder index
		this.tarotCardService.setCurrentReadingIndex(index);
		this.firestoreService.setCurrentReadingID(this.myThrowsReadyForRendering[index].throwID);
		// close all others
		if (this.automaticClose && this.myThrowsReadyForRendering[index].open) {
		this.myThrowsReadyForRendering
		.filter( (item, itemIndex) => itemIndex != index)
		// .map(item => item.open = false); // used to be this
		.map(item => { if (!item.keepCardsVisible ) {item.open = false; } });
	}
		// console.log('toggled', this.myThrowsReadyForRendering);
  }
}

// repairOpenSetting(index: number) {
//   // make sure at least one thing is open?
//   let foundOne : boolean = false;
//   for (let i=0; i < this.myThrowsReadyForRendering.length; i++) {
//     if ()
//   }
// }

// selectChooseFolderChange(event) {
//   console.log('choose folder?', event);
// }

// handleOverslide(athrow) {
//   console.log('drag support?', athrow);
// }

async getActiveThrowList(): Promise<any> {
  this.user = this.authService.getCurrentFBUser();
  if (this.user === null || this.user === undefined || this.user.uid === null) {
	return;
  }
  this.displayName = '??';  // trying to force update?
  this.displayName = this.user.email;
//   console.log('setting display name', this.displayName);
  // // g.s. 7-2-20 I'm going to create a listener way to access the database rather than a one time call
  // const myThrows =  this.firestoreService.getActiveListOfThrows(this.user.uid).then(res=> {
  //   console.log('sub 3', myThrows);
  // });
  // console.log('subscribe experiment', myThrows);
}

  async ionViewDidEnter(){
	this.showSearchCard = true;	// 7/17/21 - the button got hidden and nothing would show it?
	this.tarotCardService.setSocialMode(false);
	this.tinyScreen = window.screen.width <= 800; // 600;

	this.authService.getFirebaseUser().then((usr) => {
		this.user = usr;
		});
		// and no filter will ever be applied
	const filter: FilterThrowsBy = {
		includeAll : true,	// if this is true - then ignore the filter
		throwType: 'all'
		};
	const result =  this.firestoreService.setReadingFilter(filter).then (data => {
		// console.log('called new get reading list', data)
		});
		// console.log('view did enter 2');
		// g.s. 7-25 setting up a subscription to tell us when readings are ready
	this.firestoreService.filteredReadingsReadyState.subscribe(state => {
		 console.log('filtered readings finally ready:', state);
		this.numberOfReadings = state;
		// so now let's call and get them
		if (state === 0) {
		// 8-27 - need to zap?
		// console.log('zapping filtered list');
		if (this.myThrowsReadyForRendering !== undefined) {
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

		 console.log('filtered readings', this.myThrowsReadyForRendering, this.myThrowsReadyForRendering.length);
		// update our readings with the subject - 8-25
		this.updateReadingsWithSubject();
		if (this.myThrowsReadyForRendering != null && this.myThrowsReadyForRendering.length > 0) {
			this.myThrowsReadyForRendering[0].open = true;
			this.tarotCardService.setCurrentThrow(this.myThrowsReadyForRendering[0]);
		}
		}
	});

	this.favoriteFolders = this.firestoreService.getPublicFolderList();
  }

  updateReadingsWithSubject() {
	// console.log('here to update each reading', this.myThrowsReadyForRendering.length);
	this.myThrowsReadyForRendering.forEach(reading => {
		reading.readingName = this.tarotCardService.getReadingNameForThrow(reading);
		// saw confusion about open/close - mark all as closed?
		reading.open = false;
	});
  }


  ngOnInit() {
	// this.GetTheReadings();
	// console.log('new', this.myThrows);
	// console.log('diary oninit')
	// console.log(this.myThrows);
  }

  async goHome() {
	// await this.modalCtrl.dismiss();
	// this.router.navigate(['tarot-deck']);
	// we were losing data - 11-1
	this.realtimeDB.resetCache();
	this.router.navigate(['tarot-deck']);
  }

  async presentCardSearchDialog(dataToShow: any) {
	// console.log('calling modal', dataToShow);
	const modal = await this.modalCtrl.create({
		component: CardSearchComponent,
		cssClass: 'cardSearchModal',
		// buttons: [ {
		//   text: 'close',
		//   role: 'cancel',
		//   icon: 'close',
		//   handler: () => { console.log('canceled clicked');}
		// }]
		componentProps: { dataToShow }
	});

	modal.onDidDismiss().then((dataReturned) => {
		// console.log('search returned', dataReturned);
		if (dataReturned.data != undefined) {
		// I think user did the search
		this.setupCloseSearchUI();  // this is how the user takes it down
		this.firestoreService.forceNavigationReset(); // this should select 'all' and show results
		}
	});

	return await modal.present()
	.finally( () => {
		// I think this returns when user closes dialog - check to see if search is active - or if user canceled
		const searchActive = this.firestoreService.isSearchActive();
		// console.log('dialog closed - searching?', searchActive);
	});
  }

  setupCloseSearchUI() {
	this.searchButtonText = 'Close Search';
	// if (this.searchCardBtn != undefined) {
	//   this.searchCardBtn.nativeElement.hidden = true;
	// }
//	this.showSearchCard = false;
	 console.log('does this set up close search?', this.searchCardBtn);
  }

  // still can't pass data to component?? so I'll cheat and use the service
  doCardSearch() {
	// now calling this before we save it - so if not saved - can't do this
//	this.showSearchCard = false;
//	this.ShowHideSearch();
	this.cardSearchStarted = true;
	this.firestoreService.setSearchMode(false);
	// if (this.searchMode === true) // have a way to turn search off 
	// {
	// 	this.searchMode = false;
	// 	this.firestoreService.setSearchMode(this.searchMode);
	// 	console.log('trying to turn off searching');
	// }
	
	const data = {
		something: 'card search'
	};
	 console.log('calling card search', data);

	const result = this.presentCardSearchDialog(data)
	.finally( () => {
		console.log('done?');
	});
	 console.log('commented finally?', result);
  }

}
