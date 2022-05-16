import { Injectable } from '@angular/core';
import { TarotCard } from '../tarot-deck/tarotCard.model';
// import { keyTextArray } from '../tarot-deck/keyTextArray';
import { keyAllTextArray } from '../tarot-deck/keyFullTextArray';
import { AlertController, ModalController } from '@ionic/angular';
import { BeforeThrowComponent } from '../component/before-throw/before-throw.component';
import { FirestoreService } from './firestore.service';
import { DisplayMessage } from './realtime-db.service';
import {cloneDeep} from 'lodash';

export interface CommentControl {
	command: string;
	showSubject: boolean;
	saveText: string;
	caption: string;
	objectID: string;	// probably won't need this...
	refID:	string;		// rarely need this
	userID: string;		// late addition
}

export class LeftSelect {
	allRead: boolean;
	oneCard: boolean;
	ThreeCards: boolean;
	Pyramid: boolean;
	folderIndex: number;
	folderName: string;	// sigh - sort of need this from table help
	folderDocID: string; 		// need this for remove from folder
  }

export class ATarotThrow {
	numberCards: number;
	throwType: string;
	cardList: string;
	userID: string;
	subject: string;		// g.s. 8-16 big change
	comment: string;
	dateTime: string;	// Date;
	modifiedDateTime: string;
	throwID: string;
  }

export class TarotCardsInThrow {
	  numberCards: number;
	  typeThrow: string;
	  readingName: string;	// 8-24 - yes, I know this is late in the game
	  userID: string;
	  dateTime: string; // Date created;
	  dateModified: string;	// 7-29 - track raw data
	  displayDateTime: string;
	  displayDateModified: string;	// g.s. 7-15 each edit updates this
	  subject: string;		// g.s. 8-16 big change
	  comment: string;
	  tarotCards: TarotCard[];
	  open: boolean;	// currently active
	  keepCardsVisible: boolean;	// g.s. 7-15 - new option
	  throwID: string;
	  throwDeleted: boolean;
  }

  // I'm sure this will grow over time
export class FilterThrowsBy {
	includeAll: boolean;	// if this is true - then ignore the filter
	throwType: string;
	// soon - add date range - then folder name - etc
  }

export class FolderForReadings {
	  name: string;
	  folderID: string[];
	  ownerID: string;
	  throw: TarotCardsInThrow[];
  }

@Injectable({
  providedIn: 'root'
})


export class TarotCardsService {
  private tarotDeck: TarotCard[];
  private selectedSetOfCards: TarotCard[];
  private shuffledTarotDeck: TarotCard[];
  private shuffledDeck: number[];	// this is a list of indexes to our deck - deck stays in order
  private numCardsToSelect: number;
  textForEachPosition: string[];
  beforeReadingModal: any;
  curLeftSelect: LeftSelect;
  rayText: string [];	// 8-20 adding the 9-ray concept
  whichRay: number;
  private readingName: string;
  private listOfThrows: ATarotThrow [];
  private currentThrow: TarotCardsInThrow;
  private newFolderMode: boolean;	// lazy way to pass data
  public allReadings: TarotCardsInThrow[];	// just a copy from db service
  private currentScreenWidth: number;
  public smallScreenMode: boolean;
  public socialMode: boolean;	// 10-3 - to control menu in table help
  public commentControl: CommentControl;
  comment: string;
  subject: string;
  editDismissState: boolean;
  newCardList: string;
  newReadingID: string;
  contextItem: number;	// 10-22 -- used for context menu data
//   dspMessage: DisplayMessage;	// 10-25
//   rayReadings : RayReadingsFolders;

  constructor(
	private modalController: ModalController,
	// private firestoreService: FirestoreService,
  ) {
	  this.shuffledDeck = [];
	  this.shuffledTarotDeck = [];
	  this.contextItem = -1;	// state indicating nothing done
	  this.newReadingID = '';
	  this.socialMode = false;
	  this.smallScreenMode = false; 	// 9-5-20
	  this.comment = '';
	  this.subject = '';
	  this.newCardList = '';	// 10-5-20
	  this.editDismissState = false;

	  this.commentControl = {
		command: 'editThrow',
		showSubject: true,
		saveText: 'Save',
		caption: 'Edit Comments on Reading',
		objectID: '',	// probably won't need this...
		refID: '',
		userID: ''
	  };

	  this.curLeftSelect = {
		allRead : true,
		oneCard : false,
		ThreeCards : false,
		Pyramid : false,
		folderIndex : -1,
		folderName: '',
		folderDocID: ''
	  };
	  // tslint:disable-next-line: indent
	  this.beforeReadingModal = null;
	  this.tarotDeck = this.makeAllCardsInDeck();   // this will evolve
	  this.numCardsToSelect = 11;
	  this.selectedSetOfCards = [];	// this will be filled in by the picker
	// this.bSelectionComplete = false;
	  this.readingName = 'Pyramid Throw';
	  this.whichRay = -1;	// no idea
	  this.listOfThrows = [];
	  this.currentThrow = null;

	  this.rayText = [];	// more than one word - but less than a lot
	  this.rayText.push('Ray 1: Personal Projection');
	  this.rayText.push('Ray 2: Relationships and Karmas');
	  this.rayText.push('Ray 3: Creativity');
	  this.rayText.push('Ray 4: Relating to your Environment');
	  this.rayText.push('Ray 5: Powers that Influence');
	  this.rayText.push('Ray 6: Personal Passion - Mysticism');
	  this.rayText.push('Ray 7: Private Inner Worlds');
	  this.rayText.push('Ray 8: Money, Structure, Employment');
	  this.rayText.push('Ray 9: Final Outcome');



	  this.textForEachPosition = [];
   this.textForEachPosition.push('The Question');
   this.textForEachPosition.push('The Foundation ');
   this.textForEachPosition.push('Crown');
   this.textForEachPosition.push('Support/Oppose');
   this.textForEachPosition.push('Significator');
   this.textForEachPosition.push('Near Future');
   this.textForEachPosition.push('Environment');
   this.textForEachPosition.push('Hopes and Fears');
   this.textForEachPosition.push('Final Outcome ');
   this.textForEachPosition.push('Modifier');
   this.textForEachPosition.push('Modifier');

		// tricky - I'll add a different string for singlecard throw
   this.textForEachPosition.push('Current situation ');  // (one card reading)

   this.textForEachPosition.push('The Question');	 // 'What you can change');
	  this.textForEachPosition.push('Modifier'); 	 // 'What you can’t change');
   this.textForEachPosition.push('Modifier'); // 'What you may not be aware of');
  }

  setContextItemData(newData: number) {
	  this.contextItem = newData;
	//   console.log('context item data', this.contextItem);
  }

  getContextItemData() {
	//   console.log('get context menu data');
	  return this.contextItem;
  }

  setCommentControl(ccInfo: CommentControl) {
	//   console.log('comment control set', ccInfo);
		 this.commentControl = ccInfo;
  }

  getCommentControl(): CommentControl {
	  return this.commentControl;
  }

//   setSocialMessage(aMessage: DisplayMessage) {
// 	this.dspMessage = aMessage;
// 	console.log('ts - set social message', this.dspMessage);
//   }

//   getSocialMessage(): DisplayMessage {
// 	  console.log('ts - get social message', this.dspMessage);
// 	  return this.dspMessage;
//   }
//   // this is for social
//   setCommentText(cmt: string) {
// 	  this.comment = cmt;
//   }

//   getCommentText(): string {
// 	  return this.comment;
//   }

  // social mode is here to reduce the menu used in the table help component
  // when a reading is shown on the social page - have almost no menu items
  setSocialMode(newMode: boolean) {
	// const caller = this.setSocialMode.caller();		// arguments.callee.caller.name;
	// console.log('set social mode', newMode);	// caller
	// console.trace();
	this.socialMode = newMode;
  }

  getSocialMode(): boolean {
	// console.log('get social mode', this.socialMode);
	// console.trace();
	return this.socialMode;
  }

  // implementing this so small phone can have different pyramid throw
  setCurrentScreenWidth(curWide: number) {
	  this.currentScreenWidth = curWide;
	  if (curWide < 1100) {		// 1100) {
		  this.smallScreenMode = true;
	  } else {
	  this.smallScreenMode = false;
	  }
	//   console.log('set screen size', this.currentScreenWidth, this.smallScreenMode, curWide, screen);
  }

  getSmallScreenMode(): boolean {
	//   console.log('small screen mode?', this.smallScreenMode);
	  return this.smallScreenMode;
  }

  setRayOfThrow(whichray: number) {
	  this.whichRay = whichray;
	//   console.log('setting which ray', whichray);
  }

  getReadingNameForThrow(readi: TarotCardsInThrow): string {
	let readingName = readi.typeThrow;	// g.s. 4-21-22	//'?';

	if (readi.numberCards == 1) {
		readingName = 'One Card';
		} 	else if (readi.numberCards == 3) {
		readingName = 'Three Cards';
//		console.log('three of them....', readingName)
	} else if (readi.numberCards == 11) {
		// look at throw type
		readingName = 'Pyramid';
		if (readi.typeThrow != 'Pyramid Reading' && readi.typeThrow != '11') {
			const throwT = parseInt( readi.typeThrow);
			const ray = throwT / 100;
			const rayInt = Math.floor(ray);
			readingName = this.rayText[rayInt - 1];
			console.log('adjust name', throwT, ray, rayInt, readingName, readi.typeThrow);
		}
	} else if (readi.numberCards == 8) {
		readingName = 'Memory game';
		// console.log('reading name here!!!')
	}
		else {
		const ray = readi.numberCards / 100;
		const rayInt = Math.floor(ray);
		readingName = this.rayText[rayInt - 1];
		// console.log('ray?', ray, rayInt, readi.numberCards, readingName, this.rayText)
	}
	// console.log('reading name test', readi.numberCards == 8);
	// if (readi.numberCards == 8) {
	// 	readingName = 'Memory game';
	// 	console.log('reading name here!')
	// }
//	if (readingName == undefined)
//		readingName = 'Tarot Reading:'
//	console.log('reading name', readingName, readi, readi.numberCards, readi.typeThrow);
	return readingName;
  }

  GetTextForRay(): string {
	  let throwText = '?';
	  if (this.whichRay < 0) {
		if (this.numCardsToSelect == 1) {
			throwText = 'One Card';
		} else if (this.numCardsToSelect == 3) {
			throwText =  'Three Cards';
		} else {
			throwText =  'Pyramid Reading';
		}
		// return "";
		// let;s handle the basics

	}	// so all other throws will have no text
	else {
		throwText =  this.rayText[this.whichRay - 1];
	}
	// console.log('ray text', throwText, this.whichRay);
	  return throwText;
  }

  setNewCardList(cardList: string) {
	  this.newCardList = cardList;
  }
  getNewCardList(): string {
	  return this.newCardList;
  }

  getThrowType(): string {
	  // throw type is complicated - sort of # cards, except for rays 2-9
	  let throwType: string = this.numCardsToSelect.toString();
	  if (this.numCardsToSelect === 11) {
		// depends on ray
		if (this.whichRay < 0 ) {	// meaning a normal pyramid
			throwType = this.numCardsToSelect.toString();
		}
		else
		{
			const hund = (this.whichRay) * 100;
			const sum = hund + this.numCardsToSelect;
			throwType = sum.toString();
		}
	  }
	//   console.log('get throw type', throwType);
	  return throwType;
  }


  getTextForNextPosition(cardsInThrow: number, nextPositon: number): string {
	if (cardsInThrow === 1) {
		  return this.textForEachPosition[11];
	  } else if (cardsInThrow === 3) {
		  return this.textForEachPosition[11 + nextPositon];
	  } else {
		  // doublecheck that we've set up the ray
		//   if (this.whichRay < 0) {
		// 	  return 'Pyramid Throw'; //"no ray established yet - set that up please"
		// 	}
		//   else
		  {
			  const result = /* this.rayText[this.whichRay - 1] + ' : ' + */
			 this.textForEachPosition[nextPositon];

			  return result;
		  }

	  }
  }

  // 8-13 decided to use the folder picker to both select from existing folders - and to create new ones
  getFolderPickerCreatesNewFolders(): boolean {
	// console.log('get folder picker mode', this.newFolderMode);
	  return this.newFolderMode;
  }

  setFolderPickerCreatesNewFolders(newFolderMode: boolean) {
	this.newFolderMode = newFolderMode;
	// console.log('set folder picker mode', this.newFolderMode);
  }

  setLeftSelect(leftIs: LeftSelect)
  {
	this.curLeftSelect = leftIs;
	// console.log('set left', leftIs);
  }

  getLeftSelect(): LeftSelect {
	//   console.log('get left', this.curLeftSelect);
	  return this.curLeftSelect;
  }

  // need to update index without really knowing if we're using a folder or not - so the caller just tells us the index
  setCurrentReadingIndex(index: number) {
	// we'll just throw it away unless a folder is active
	// console.log('set current reading index', index, this.curLeftSelect.folderIndex, this.curLeftSelect.folderName);
	if (this.curLeftSelect.folderIndex >= 0 && index >= 0)	// I think that's a good way to judge if we're using a folder
	{
		this.curLeftSelect.folderIndex = index;
		// console.log('updated folder index', index);
		// now let's update the firestore data

	}
  }

  setCurrentThrow(curThrow: TarotCardsInThrow) {
	  this.currentThrow = curThrow;
//	   console.log('set current throw', this.currentThrow); 
	//   this.firestoreService.setCurrentReadingID(this.currentThrow.throwID);	// tell our brother
  }	
  getCurrentThrow(): TarotCardsInThrow {
//	   console.log('getting throw', this.currentThrow);
// gs, 4-21-22 ?? fix comment ??
//	this.currentThrow.comment = this.currentThrow.comment.replace(/\n/g, '<br />');
//	console.log('?fixed comment?', this.currentThrow.comment)
	return this.currentThrow;
	}

	updateCommentSubject(comment: string, subject: string) {
		// console.log('updating comment-subject', comment, subject);
		this.comment = comment;
		this.subject = subject;
	}
	getCurrentComment(): string {
		// console.log('ts - returning comment', this.comment);
		return this.comment;
	}

	getCurrentSubject(): string {
		return this.subject;
	}

	setEditorDismissResult(res: boolean) {
		this.editDismissState = res;
	}
	getEditorDismissResult(): boolean {
		return this.editDismissState;
	}


  generateListOfThrowsForUser(): ATarotThrow[] {
	  // go to db and filter out this user's throw from all the throws
	  this.listOfThrows = [];

	  return this.listOfThrows;
  }
  // -- results section
  getSelectedCardsForReading(): TarotCard[] {
	// return [...this.selectedSetOfCards];
	const returnedCards: TarotCard[] = [];

	// console.log('returning selected cards', typeof(this.selectedSetOfCards), "->", typeof(this.tarotDeck))
	return this.selectedSetOfCards;	// new Array(...this.selectedSetOfCards);
  }

  getReadingName() {
	if (this.numCardsToSelect == 1) {
		this.readingName = 'Daily Reading'	//'Single Card Reading';	//'Daily Reading';
	}
	else if (this.numCardsToSelect == 11) {
		// this.readingName = "Pyramid Throw";
		this.readingName = this.GetTextForRay();
	} else {
		this.readingName = 'Three cards';
	}
	// console.log('service - #', this.numCardsToSelect);
	return this.readingName;
  }

  setReadingName(name: string) {
	  this.readingName = name;
  }
  // ---- throw section
  setSelectedSetOfCards(setOfCards: TarotCard[]) {
	  // fixed a horrible bug - I was using "spread" to copy into the selected array - but that was too shallow
	//   this.selectedSetOfCards = {...setOfCards};
	// https://stackoverflow.com/questions/44808882/cloning-an-array-in-javascript-typescript/54138394
	// using slice works fine
	const count = setOfCards.length;
	this.selectedSetOfCards = setOfCards.slice(0, count);
	// clear selected flag
	this.tarotDeck.forEach( (card) => {
		card.cardSelected = false;
	});
	// this.bSelectionComplete = true;	// picker has passed the ball
  }

	getRandomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
	}

	setNumberCardsToSelect(num: number) {
		// console.log('set number cards', num);
		this.numCardsToSelect = num;
		this.whichRay = -1;	// I'm going to makethem set the ray after the number of cards..
		if (num == 1) {
			this.readingName = 'Daily Reading';
		}
		else if (num == 11) {
			this.readingName = 'Pyramid Throw - unknown ray';
		}
	}

	getNumberCardsToSelect(): number {
		return this.numCardsToSelect;
	}


  shuffleCards() {
	this.selectedSetOfCards = [];	// reset previous results
	// https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
	const count = this.tarotDeck.length;
	// clear selected flag
	this.tarotDeck.forEach( (card) => {
		card.cardSelected = false;
		// card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
		card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
	});
	// var myList: number[] = [...Array(count).keys()];
	this.shuffledDeck = [...Array(count).keys()];

	// ok now have two lists - to shuffle - start at the end and exchange a random element in each index
	for (let i = count - 1; i >= 0; i--)
	{
		const index = this.getRandomInt(0, count);
		const temp = this.shuffledDeck[i];
		this.shuffledDeck[i] = this.shuffledDeck[index];
		this.shuffledDeck[index] = temp;
	}
	// console.log('deck shuffled', this.shuffledDeck);
  }

  getShuffledDeck(): TarotCard[] {
	  this.shuffleCards();	// random
	  this.shuffledTarotDeck = [...this.tarotDeck];
	  const count = this.tarotDeck.length;
	  for (let i = 0; i < count; i++)
	  {
		const index = this.shuffledDeck[i];
		this.shuffledTarotDeck[i] = this.tarotDeck[index];
		// this.shuffledTarotDeck[i].FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
		this.shuffledTarotDeck[i].FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
	  }
	//   console.log('get shuffled deck', this.shuffledTarotDeck);
	  return this.shuffledTarotDeck;
  }

  getNextSuffledCard(index: number): TarotCard {
	  const realIndex = this.shuffledDeck[index];
	  return this.tarotDeck[realIndex];
  }

  dealOneCard(): TarotCard[] {
	return null;
  }

  getAllCards(): TarotCard[] {
	return [...this.tarotDeck];
  }

  getOneCard(cardId: string): TarotCard {
	return {
		... this.tarotDeck.find(card => {
		return card.id === cardId;
	})};
  }

  getTarotText( cardName: string, suitName: string, whichStr: string): string {
	  if (cardName === undefined || suitName === undefined || whichStr === undefined)
	  {
		  console.log(cardName, suitName, whichStr);
		  return '????';
	  }

	  for (const tarotElement of keyAllTextArray) {
		if (tarotElement.CARD.toLowerCase() == cardName.toLowerCase()) {
			if (tarotElement.SUIT.toLowerCase() == suitName.toLowerCase()) {
				if (whichStr.toLowerCase() == 'key') {
					return tarotElement.KEY;
				} else if (whichStr.toLowerCase() == 'thoughts') {
					return tarotElement.THOUGHTS;
				} else if (whichStr.toLowerCase() == 'comment') {
					return tarotElement.COMMENT;
				}
			}
		}
	  }
	  return '????';	// bad caller string
  }
  // -- constructor stuff
  makeAllCardsInDeck(): TarotCard[] {
	// var mapKeyCard = new Map(keyTextArray);
	// var mapKeyText = new Map(keyTextArray.map(i => [i[0], i[1]]));

	const suits = ['Pentacles', 'Swords', 'Wands', 'Cups', 'Ankhs'];
	const cardNum = [
		'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'
	];
	// not emporer shouldbe emperor
	const maSuits = [
		'the fool', 'magician', 'high priestess', 'empress', 'emperor', 'hierophant', 'the lovers', 'the chariot',
		'strength', 'the hermit', 'the wheel of fortune', 'justice', 'the hanged man', 'death', 'temperance',
		'the devil', 'the tower', 'the star', 'the moon', 'the sun', 'judgement', 'the rose', 'the universe'
	];

 const cardArray: TarotCard[] = [];

 for (let i = 0; i < 14; i++) {
		// tslint:disable-next-line: prefer-for-of
		for (let j = 0; j < suits.length; j++)
		{
		// var firstChar = suits[j].charAt(0).toLowerCase();
		// var key = i + firstChar + "key";		//mapKeyText.get(key);
		const keyText = this.getTarotText(cardNum[i], suits[j], 'key');
		const thoughtsText = this.getTarotText(cardNum[i], suits[j], 'thoughts');
		const commentText = this.getTarotText(cardNum[i], suits[j], 'comment');
		// console.log(cardNum[i], suits[j], keyText, thoughtsText, commentText);
  cardArray.push(this.Card(suits[j], i + 1, keyText, thoughtsText, commentText));
		}
	}
	// now major arcana
	for (let j = 0; j < 23; j++)		// 12-3-20! major bug - was off by one - used to be 22 - never saw universe
	{
	//   var key = i  + "mkey";
	  	const keyText = this.getTarotText(String(j), maSuits[j], 'key');
		  const thoughtsText = this.getTarotText(String(j), maSuits[j], 'thoughts');
		  const commentText = this.getTarotText(String(j), maSuits[j], 'comment');
		//   console.log( j, maSuits[j], keyText, thoughtsText, commentText);
		  cardArray.push( this.MACard(j, keyText, thoughtsText, commentText));
	}
 return cardArray;
  }

  Card(suit: string, number: number, keyText: string, thoughtsText: string, commentText: string): TarotCard {
	const firstChar = suit.charAt(0).toLowerCase();
	const key = number + firstChar;
	// var keyString = GetCardKeyUsingId(key);
	let cardTitle = '';

	switch (number)
	{
		case 1:
			cardTitle = 'Ace';
			break;
		case 2:
			cardTitle = 'II';
			break;
		case 3:
			cardTitle = 'III';
			break;
		case 4:
			cardTitle = 'IV';
			break;
		case 5:
			cardTitle = 'V';
			break;
		case 6:
			cardTitle = 'VI';
			break;
		case 7:
			cardTitle = 'VII';
			break;
		case 8:
			cardTitle = 'VIII';
			break;
		case 9:
			cardTitle = 'IX';
			break;
		case 10:
			cardTitle = 'X';
			break;
		case 11:
			cardTitle = 'Page';
			break;
		case 12:
			cardTitle = 'Knight';
			break;
		case 13:
			cardTitle = 'Queen';
			break;
		case 14:
			cardTitle = 'King';
			break;
		}
	cardTitle += ' of ' + suit;

	const aCard: TarotCard = {
		id: key,
		title: cardTitle,
		imageUrl: './assets/img/mcards/' + number + firstChar + '.jpg',
	  FaceDownImageUrl: './assets/img/mcards/extracard.jpg',
	  key: keyText,
	  cardSelected: false,
	  thoughts: thoughtsText,
	  comment: commentText
	};
	return aCard;
  }

  MACard(number, keyText: string, thoughtsText: string, commentText: string): TarotCard {
	const key = number + 'm';
	let cardTitle = '';

	switch (number)
	{
		case 0:
			cardTitle = 'The Fool';
			break;
		case 1:
			cardTitle = 'The Magician';
			break;
		case 2:
			cardTitle = 'The High Priestess';
			break;
		case 3:
			cardTitle = 'The Empress';
			break;
		case 4:
			cardTitle = 'The Emperor';
			break;
		case 5:
			cardTitle = 'The Heirophant';
			break;
		case 6:
			cardTitle = 'The Lovers';
			break;
		case 7:
			cardTitle = 'The Chariot';
			break;
		case 8:
			cardTitle = 'Stength';
			break;
		case 9:
			cardTitle = 'The Hermit';
			break;
		case 10:
			cardTitle = 'The Wheel of Fortune';
			break;
		case 11:
			cardTitle = 'Justice';
			break;
		case 12:
			cardTitle = 'The Hanged Man';
			break;
		case 13:
			cardTitle = 'Death';
			break;
		case 14:
			cardTitle = 'Temperance';
			break;
		case 15:
			cardTitle = 'The Devil';
			break;
		case 16:
			cardTitle = 'The Tower';
			break;
		case 17:
			cardTitle = 'The Star';
			break;
		case 18:
			cardTitle = 'The Moon';
			break;
		case 19:
			cardTitle = 'The Sun';
			break;
		case 20:
			cardTitle = 'Judgement';
			break;
		case 21:
			cardTitle = 'The Rose';
			break;
		case 22:
			cardTitle = 'The Universe';
			break;
		}
	const aCard: TarotCard = {
			id: key,
			title: cardTitle,
			imageUrl: './assets/img/mcards/' + number  + 'm.jpg',
			FaceDownImageUrl: './assets/img/mcards/extracard.jpg',
			key: keyText,
			cardSelected: false,
			thoughts: thoughtsText,
			comment: commentText
			};
	return aCard;
	}

	// will try to put up a dialog to prepare the user prior to selecting cards
	async presentPrepareYourself() {
		// console.log('calling modal', dataToShow);
		// const modal =
		this.beforeReadingModal =	await this.modalController.create({
		  component: BeforeThrowComponent,
		  cssClass: 'prepareModal',
		  // buttons: [ {
		  //   text: 'close',
		  //   role: 'cancel',
		  //   icon: 'close',
		  //   handler: () => { console.log('canceled clicked');}
		  // }]
		//   componentProps: { dataToShow }
		});
		// return await modal.present();
		return await this.beforeReadingModal.present();
	  }

	public async prepareYourselfBeforeReading() {
	//   console.log('prepare for reading')
		const modal = await this.presentPrepareYourself().then((val) => {
			return this.beforeReadingModal;
		});
	}

	setNewReadingID(readingID: string) {
		this.newReadingID = readingID;
		this.currentThrow.throwID = this.newReadingID;
		console.log('set new reading id - updated throw???', this.currentThrow);
	}

	getNewReadingID(): string {
		console.log('get reading ID', this.newReadingID);
		return this.newReadingID;
	}


	getCardUsingID(cardID: string): TarotCard {
		let card: TarotCard = null;
		this.tarotDeck.forEach(crd => {
			// console.log('match?', cardID, crd.id);
			if (crd.id === cardID) {
				card = crd;
			}
		})
		// console.log('get card', cardID, card);
		return card;
	}

	getPentacleDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 1; i < 15; i++) {
			const id = i.toString() + 'p';
			const card = this.getCardUsingID(id);
			// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}
	getSwordsDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 1; i < 15; i++) {
			const id = i.toString() + 's';
			const card = this.getCardUsingID(id);
			// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}
	getWandsDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 1; i < 15; i++) {
			const id = i.toString() + 'w';
			const card = this.getCardUsingID(id);
			// console.log('building wands deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}
	getCupsDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 1; i < 15; i++) {
			const id = i.toString() + 'c';
			const card = this.getCardUsingID(id);
			// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}
	getAnkhsDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 1; i < 15; i++) {
			const id = i.toString() + 'a';
			const card = this.getCardUsingID(id);
			// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}
	getMajorArcanaDeck(): TarotCard[] {
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	// clear
		for (let i = 0; i < 23; i++) {
			const id = i.toString() + 'm';
			const card = this.getCardUsingID(id);
			// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
			this.shuffledTarotDeck.push(card);
		}
		return this.shuffledTarotDeck;
	}


	getDeckByRank(): TarotCard[] {
	// console.log('order deck by rank', this.shuffledTarotDeck.length);
	this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);		// cloneDeep(this.tarotDeck);
	// now load the deck by rank
	// this.tarotDeck.forEach(crd => {
	// 	console.log('card order is', crd.title, crd);
	// })
	for (let i = 1; i < 15; i++) {
		const id = i.toString() + 'p';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	for (let i = 1; i < 15; i++) {
		const id = i.toString() + 's';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	for (let i = 1; i < 15; i++) {
		const id = i.toString() + 'w';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	for (let i = 1; i < 15; i++) {
		const id = i.toString() + 'c';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	for (let i = 1; i < 15; i++) {
		const id = i.toString() + 'a';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	for (let i = 0; i < 23; i++) {
		const id = i.toString() + 'm';
		const card = this.getCardUsingID(id);
		// console.log('building deck', this.shuffledTarotDeck.length, card?.title);
		this.shuffledTarotDeck.push(card);
	}
	return this.shuffledTarotDeck;
	}

	shuffleMemoryCards(count: number) {
		// here to shuffle
		const twiceCount = count * 2;
		this.shuffledDeck = [...Array(count).keys()];
	
		// ok now have two lists - to shuffle - start at the end and exchange a random element in each index
		for (let i = count - 1; i >= 0; i--)
		{
			const index = this.getRandomInt(0, count);
			const temp = this.shuffledDeck[i];
			this.shuffledDeck[i] = this.shuffledDeck[index];
			this.shuffledDeck[index] = temp;
			// console.log('shuffle', i, index )
		}
	}

	createMemoryShuffleDeck(suit: string) {
		
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);	
		switch (suit) {
			case 'pentacles': {
				this.getPentacleDeck();
			}
			break;
			case 'swords': {
				this.getSwordsDeck();
			}
			break;
			case 'wands': {
				this.getWandsDeck();
			}
			break;
			case 'cups': {
				this.getCupsDeck();
			}
			break;
			case 'ankhs': {
				this.getAnkhsDeck();
			}
			break;
			case 'majorArcana': {
				this.getMajorArcanaDeck();
			}
			break;
		}
		// console.log('create memory game shuffled deck', suit, this.shuffledTarotDeck.length);
		
		// https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
		let count = this.shuffledTarotDeck.length;	// it can change
		// count *= 2;	// we want duplicates
		// ok - create a temp deck for shuffle - when done we'll copy it back over 
		let tempDeck: TarotCard[] = [];
		// clear selected flag
		this.shuffledTarotDeck.forEach( (card) => {
			card.cardSelected = false;	// I'll use this just for momentary selection
			// card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
			card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
			// console.log('add card', card);
			tempDeck.push(card);	// now we have a temp deck
		});
		// now do it again
		this.shuffledTarotDeck.forEach( (card) => {
			card.cardSelected = false;	// I'll use this just for momentary selection
			// card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
			card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
			tempDeck.push(card);	// now we have a temp deck
			// tempDeck.push(card);	// two copies
			// console.log('add card 2', card);
		});
		// count *= 2;
		// var myList: number[] = [...Array(count).keys()];
		
		
		// console.log('deck shuffled', tempDeck.length);

		this.shuffleMemoryCards(tempDeck.length);	// this will create twice the count random number
	//   this.shuffledTarotDeck = [...this.tarotDeck];
		let finalShuffledDeck: TarotCard[] = [];
		finalShuffledDeck = cloneDeep(tempDeck);	// make a copy

		count = this.shuffledTarotDeck.length * 2;
	 
	  for (let i = 0; i < count; i++)
	  {
		const index = this.shuffledDeck[i];
		finalShuffledDeck[i] = tempDeck[index];
		// console.log('shuffled memory deck', index, i, tempDeck[i].title, finalShuffledDeck[i].title);
	  }

	  // ok now do this again

	  // now overwrite 
	  this.shuffledTarotDeck = cloneDeep(finalShuffledDeck);
	//   console.log('cloned?', this.shuffledTarotDeck);
	//   console.log('get shuffled deck', this.shuffledTarotDeck.length, this.shuffledTarotDeck);
	  return this.shuffledTarotDeck;
	}

	createSmallRandomDeck(numCards: number) {
		this.shuffleCards();	// random
		this.shuffledTarotDeck = [...this.tarotDeck];
		const count = this.tarotDeck.length;
		for (let i = 0; i < count; i++)
		{
		  const index = this.shuffledDeck[i];
		  this.shuffledTarotDeck[i] = this.tarotDeck[index];
		  // this.shuffledTarotDeck[i].FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
		  this.shuffledTarotDeck[i].FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
		}
	}

	putAllCardsFaceDown() {
		this.tarotDeck.forEach( (card) => {
			card.cardSelected = false;
			// card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
			card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
		});
	}
	shuffleSomeCards(num: number) {
		this.shuffledDeck.splice(0, this.shuffledDeck.length);
		// this.selectedSetOfCards = [];	// reset previous results
		// https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
		// const count = this.tarotDeck.length;
		// clear selected flag
		this.tarotDeck.forEach( (card) => {
			card.cardSelected = false;
			// card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg"
			card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
		});
		// var myList: number[] = [...Array(count).keys()];
		this.shuffledDeck = [...Array(num).keys()];
		// for (let i = 0; i < num; i++) {
		// 	this.shuffledDeck.push(i);
		// }
		// console.log('ssc', this.shuffledDeck);
	
		// ok now have two lists - to shuffle - start at the end and exchange a random element in each index
		for (let i = num - 1; i >= 0; i--)
		{
			const index = this.getRandomInt(0, this.tarotDeck.length);
			const temp = this.shuffledDeck[i];
			// console.log('hmm ssc',  index, i, temp);
			this.shuffledDeck[i] = this.shuffledDeck[index];
			this.shuffledDeck[index] = temp;
		}
		// console.log('shuffleSomeCards', this.shuffledDeck, this.shuffledDeck.length);
	  }

	  numNotInList(testNum: number): boolean {
		  let match = false;
		  if (this.shuffledDeck.length > 0) {
			this.shuffledDeck.forEach(num => {
				// console.log('test?', testNum, num);
				if (testNum === num) {
					match = true;
				}
			})
		  }
		//   console.log('there?', match, testNum);
		  return match;
	  }
	
	createMemoryDeckWithRandomCards(cardCount: number): TarotCard[] {
		// ok - I'll create a list of unique indexes into the deck - selecting the # passed in
		// then I'll double it
		// then I'll shuffle (again)
		this.shuffledDeck.splice(0, this.shuffledDeck.length);	// zap
		this.putAllCardsFaceDown();
		let deckCount = 0;
		// for (let i = 0; i < cardCount; i++) {
		while (deckCount < cardCount) {
			const index = this.getRandomInt(0, this.tarotDeck.length);	// get rand # 
			if (!this.numNotInList(index)) {
				this.shuffledDeck.push(index);	// want two
				this.shuffledDeck.push(index);	
				deckCount++;
				// console.log('creating', index, this.shuffledDeck.length, this.shuffledDeck);
			}
		}
		// ok - now to shuffle these indexes
		const len = this.shuffledDeck.length;
		for (let i = len - 1; i >= 0; i--)
		{
			const index = this.getRandomInt(0, len);
			const temp = this.shuffledDeck[i];
			// console.log('hmm ssc',  index, i, temp);
			this.shuffledDeck[i] = this.shuffledDeck[index];
			this.shuffledDeck[index] = temp;
		}
		// console.log('shuffled?', this.shuffledDeck.length, this.shuffledDeck);

		// now build the output deck using these indexes
		this.shuffledTarotDeck.splice(0, this.shuffledTarotDeck.length);
		for (let i = 0; i < this.shuffledDeck.length; i++) {
			const card = this.tarotDeck[this.shuffledDeck[i]];
			// console.log('building', i, this.shuffledDeck[i], card.title);
			this.shuffledTarotDeck.push(card);
		}

		// console.log('done', this.shuffledTarotDeck.length, this.shuffledTarotDeck);
		return this.shuffledTarotDeck;
	}
	
}
