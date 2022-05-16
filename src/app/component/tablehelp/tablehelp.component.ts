import { Component, OnInit, Input, OnChanges, DoCheck, AfterContentChecked } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TarotCardsService, TarotCardsInThrow, LeftSelect, FolderForReadings, CommentControl } from '../../services/tarot-cards.service';
import { ToastController } from '@ionic/angular';
import { ModalCardDisplayPage } from '../../tarot-deck/modal-card-display/modal-card-display.page';
import { TarotCard } from '../../tarot-deck/tarotCard.model';
import { AuthenticationService } from '../../services/authentication.service';
import { CardDetails } from '../../tarot-deck/diary/diary.page';
import * as jsPDF from 'jspdf';
import { CommentEditComponent } from '../../component/comment-edit/comment-edit.component';
import { AssignFolderComponent } from '../../component/assign-folder/assign-folder.component';
import { FirestoreService } from '../../services/firestore.service';
import { PdfGenService } from '../../services/pdf-gen.service';  // 7-28
import { RealtimeDbService } from '../../services/realtime-db.service'; // 10-1
import { PopoverMenuComponent } from '../../component/popover-menu/popover-menu.component';  // '../popover-menu/popover-menu.component';
import { PopoverController } from '@ionic/angular';
// this is so frustrating - I've worked several days trying to pass data to any component
// finally (6-29-20) gave up and used the service to set/get data
export interface TarotData {
  throw: TarotCardsInThrow;
  throwID: string;
}

@Component({
  selector: 'app-tablehelp',
  templateUrl: './tablehelp.component.html',
  styleUrls: ['./tablehelp.component.scss'],
})
export class TablehelpComponent implements OnInit, DoCheck, AfterContentChecked {    // OnChanges
  // @Input('throwID') throwID : string;    // 10-1 trying again to get data from html

  throw: TarotCardsInThrow;   // this is just about all I need - one throw
  textForEachPosition: string[];
  throwName: string;
  throwHasBeenSaved: boolean;
  pageNumber: number;  // for header
  currentLeftSelect: LeftSelect;
  folderIsSource: boolean;
  favoriteFolders: FolderForReadings[];
  smallScreenMode: boolean;
  user: firebase.User;
  socialMode: boolean;
  // @Input('tarotThrow') tThrow: TarotCardsInThrow;
  // @Input()  data: TarotCardsInThrow;
  // 'tarotThrow'

  constructor(
	  private toastCtrl: ToastController,
			private modalController: ModalController,
			private firestoreService: FirestoreService,
			private authService: AuthenticationService,
			private tarotCardService: TarotCardsService,
			private alert: AlertController,
			private pdfGenService: PdfGenService,
			private realtimeDb: RealtimeDbService,
			public popoverController: PopoverController,
	) {
    this.socialMode = this.tarotCardService.getSocialMode();
    this.favoriteFolders = [];
    this.smallScreenMode = this.tarotCardService.getSmallScreenMode();
    this.user = this.authService.getCurrentFBUser();  // back door
    this.throw = this.tarotCardService.getCurrentThrow();
    this.throwHasBeenSaved = this.throw != null && this.throw.throwID.length > 3;
    // console.log('throw saved ', this.throwHasBeenSaved, this.socialMode);
    if (this.throw != null) {
      this.firestoreService.setCurrentReadingID(this.throw.throwID);  // 8-8
      }
    // console.log('TablehelpComponent constructor', this.throw);

    this.throwName = '?';

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

	   this.textForEachPosition.push('The Question');  // 'What you can change');
	   this.textForEachPosition.push('Modifier');  // 'What you can’t change');
	   this.textForEachPosition.push('Modifier'); //  'What you may not be aware of');
		// console.log('Positions-text', this.textForEachPosition);
  }

  ngOnInit() {
    this.currentLeftSelect = this.tarotCardService.getLeftSelect();
    this.folderIsSource = this.currentLeftSelect.folderIndex >= 0;
    // console.log('TablehelpComponent ngOnInit', this.currentLeftSelect, 'folder', this.folderIsSource);
    // this.firestoreService.getFolderList();  // this will update the folder data
    this.debugOpen();
  }

  // ngOnChanges() {
  // }

  ionViewDidLoad() {

	// console.log('TablehelpComponent view did load', this.throw);
 this.currentLeftSelect = this.tarotCardService.getLeftSelect();
 this.folderIsSource = this.currentLeftSelect.folderIndex >= 0;
    // console.log('table ionViewDidLoad', this.currentLeftSelect, 'folder', this.folderIsSource);
 this.firestoreService.getFolderList()
    .then (data => {})
    .finally(() => {

      this.favoriteFolders = this.firestoreService.getPublicFolderList();
      // console.log('table view: got folders', this.favoriteFolders.length, this.favoriteFolders)
      this.debugOpen();
    });  // this will update the folder data
  }

  async ionViewDidEnter(){
	// console.log('TablehelpComponent view did enter')
    this.debugOpen();
  }

  ngDoCheck() {
    this.currentLeftSelect = this.tarotCardService.getLeftSelect();
    this.folderIsSource = this.currentLeftSelect.folderIndex >= 0;
    // console.log('TablehelpComponent ngDoCheck', this.folderIsSource, this.throwID);
  }
  // ngAfterContentInit() {
  //   console.log('TablehelpComponent ngAfterContentInit')
  // }
  ngAfterContentChecked() {
    this.currentLeftSelect = this.tarotCardService.getLeftSelect();
    this.folderIsSource = this.currentLeftSelect.folderIndex >= 0;
	// console.log('TablehelpComponent ngAfterContentChecked', this.folderIsSource)
  }
  // ngAfterViewInit() {
  //   console.log('TablehelpComponent ngAfterViewInit')
  // }


  // ngOnChanges() {
  //   console.log('TablehelpComponent changed');
  // }

  // new command - share reading
  ShareReading(athrow: TarotCardsInThrow) {
	// console.log('share the reading', athrow);
	const editPref: CommentControl = {
		command: 'shareThrow',
		showSubject: false,
		saveText: 'Share',
		caption: 'Share this reading',
		objectID: athrow.throwID,	// probably won't need this...
		refID: '',
		userID: this.user.uid
	  };
	this.tarotCardService.setCommentControl(editPref);  // this tells the comment editor what we want
	const data = {
		throw: this.throw,
		throwID: this.throw.throwID
	  };
	this.presentCommentEditor(data);
    // need to create UI to get comment here...
    // this.realtimeDb.shareReading(this.user.uid, athrow);
  }

  // modified to not use a checkbox - the checkbox is there for display (although it does work as well)
  keepOpen(e: any, athrow: TarotCardsInThrow) {
	// console.log('keepopen', e, athrow);
	// user toggled checkbox
	let isChecked = e.currentTarget.checked;
	// console.log('checkbox->', isChecked, 'event', e.currentTarget, athrow);
	const oneThrow = athrow;
	if (isChecked === undefined) {
		// oneThrow = e.currentTarget;
		isChecked = oneThrow.keepCardsVisible;  // if here - then flip it
		oneThrow.keepCardsVisible = !isChecked;
		// console.log('from menu', isChecked)
	} else {

	}
	// console.log('checked is', isChecked, athrow.keepCardsVisible);
	this.debugOpen();
  }



  async presentModal(dataToShow: CardDetails) {
	// console.log('calling modal', dataToShow);
	const modal = await this.modalController.create({
		component: ModalCardDisplayPage,
		cssClass: 'modal-wrapper',  // 'my-custom-class',
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

  cardClicked(card: TarotCardsInThrow, whichThrow: number, whichPosition: number, textPosition: number) {
		const dataToShow = {
		card: card.tarotCards[whichPosition],
		positionText: this.textForEachPosition[textPosition]
		};
		this.presentModal(dataToShow);
		card.open = true; // keep it open
		// console.log('card clicked', card);
		this.debugOpen();
  }

  debugOpen() {
	// trying to understand open
	// console.log('reading open?', this.throw.open, this.throw.keepCardsVisible);
  }

  SaveAsPDF() {

	// switch to using a PDF service - so there's one set of code
	this.pdfGenService.SaveAsPDF(this.throw);

  }

  // try to make confirmation dialog??
  async presentConfirmationDialog() {
	const alert = await this.alert.create( {
		header: 'Confirm Deletion of Reading',
		subHeader: 'Are you sure?',
		buttons: [
		{
			text: 'Cancel',
			role: 'cancel',
			handler: (meh) => {
			// console.log('confirm cancel');
			}
		},
		{
			text: 'Delete',
			handler: () => {
			this.firestoreService.deleteReading(this.throw.throwID);
			this.throw.throwDeleted = true;
			// now reload - not sure best way - this doesn't do it...
			this.currentLeftSelect = this.tarotCardService.getLeftSelect();
			// console.log('try to reassert left select?', this.currentLeftSelect);
			this.tarotCardService.setLeftSelect(this.currentLeftSelect);
			// try to reload ?
			}
		}
		]
	});
	await alert.present();
  }

  // delete this throw from db
  deleteThrow() {
	// console.log('deleting');
	this.presentConfirmationDialog(); // can this work?
	// this.firestoreService.deleteReading(this.throw.throwID);
  }

  async presentCommentEditor(dataToShow: TarotData) {
	// console.log('calling modal', dataToShow);
	const modal = await this.modalController.create({
		component: CommentEditComponent,
		cssClass: 'my-modal',
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

  // still can't pass data to component?? so I'll cheat and use the service
  editComment() {
    // // 10-4 emergancy repair kludge called
    // this.firestoreService.repairReadingIDS(); // batch iterate to fix all throw IDs
    // return;

	// now calling this before we save it - so if not saved - can't do this
    if (this.throw.throwID.length < 3) {
    //   console.log('cant edit non saved reading');
      return;
    }
    const editPref: CommentControl = {
      command: 'editThrow',
      showSubject: true,
      saveText: 'Save',
      caption: 'Edit Comments on Reading',
	  objectID: '',	// probably won't need this...
	  refID: '',
	  userID: this.user.uid
	};
	   this.tarotCardService.setCommentControl(editPref);  // this tells the comment editor what we want
    const data = {
      throw: this.throw,
      throwID: this.throw.throwID
    };
    // console.log('here to edit', data, editPref);

    this.tarotCardService.setCurrentThrow(this.throw);
    const result = this.presentCommentEditor(data);
    // console.log('commented finally?', result);
  }


  async presentFolderEditor(dataToShow: TarotData) {
	// console.log('calling modal', dataToShow);
	const modal = await this.modalController.create({
		component: AssignFolderComponent,
		cssClass: 'my-modal',
		// buttons: [ {
		//   text: 'close',
		//   role: 'cancel',
		//   icon: 'close',
		//   handler: () => { console.log('canceled clicked');}
		// }]
		componentProps: { dataToShow }
	});
	// try to set focus on the input...
	return await modal.present().then( () => {
		// const firstInput: any = document.querySelector('inputnewfolder');
		// console.log('set focuse?', firstInput);
		// firstInput.focus();
		return;
	});
  }

  createNewFolder() {
	// console.log('create new folder');
	this.tarotCardService.setFolderPickerCreatesNewFolders(true);  // lazy way to exchange data

	if (this.throw.throwID.length < 3) {
		// console.log('cant edit non saved reading');
		return;
	}
	const data = {
		throw: this.throw,
		throwID: this.throw.throwID
	};

	this.tarotCardService.setCurrentThrow(this.throw);
	const result = this.presentFolderEditor(data);
	// console.log('folder! finally?', result);
  }

  AssignFolder() {
	// console.log('assign to folder - select from existing folders');
	this.tarotCardService.setFolderPickerCreatesNewFolders(false);  // lazy way to exchange data

	if (this.throw.throwID.length < 3) {
		// console.log('cant edit non saved reading');
		return;
	}
	const data = {
		throw: this.throw,
		throwID: this.throw.throwID
	};
	// make sure we've set up folders
	this.firestoreService.getFolderList();  // this will update the folder data
// quick debug code - always assign to "my first" - no awkward dialog used
	// need to know if we're currently looking at a folder list (probably not...)
	const updateFolder = this.currentLeftSelect.folderIndex >= 0;

	// next line was just to speed testing
	// this.firestoreService.addReadingToFolder('my first', this.throw.throwID, updateFolder);  // wow

	// console.log('here to edit', data);
	this.tarotCardService.setCurrentThrow(this.throw);
	const result = this.presentFolderEditor(data);
	// console.log('folder! finally?', result);
  }

  RemoveFromFolder() {
	// user want's us to remove this reading from the active folder
	const data = {
		throw: this.throw,
		throwID: this.throw.throwID
	};
	const folderDocID = this.firestoreService.getCurrentFolderDocID();
	// console.log('remove reading', data, this.currentLeftSelect.folderName, this.currentLeftSelect.folderDocID, folderDocID);
	// update this to learn the folder doc id - didn't really know it

	this.firestoreService.removeReadingFromFolder(this.currentLeftSelect.folderName, folderDocID);
  }

  // new menu system
  async onItemMenu(eve) {
    // if indent is 0 - the menu is for a post - else it's a reply


	let menuName = 'throwMenu';
	if (this.socialMode) {
		menuName += 'Social';
	}
	if (this.smallScreenMode) {
		menuName += 'small';
	}
	if (this.folderIsSource) {
		menuName += 'isFolder';
	}
	if (!this.throwHasBeenSaved) {
		menuName = 'throwMenuNotSaved';
	}
//	console.log('Throwmenu', eve, menuName);
	// this.throwHasBeenSaved = this.throw != null && this.throw.throwID.length > 3;
//	console.log('throw', this.throw, 'id:', this.throw.throwID);
    // use service to pass data
	this.tarotCardService.setContextItemData(-1);  // if popover does something - it will over ride this
	let userMenuPick = 1;
	const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: this.socialMode ? 'short-menu-popover' : 'menu-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
        },
		data: menuName,  // 'abc'
	  },
	  event: eve,
	//   mode: 'ios',
    });
	await popover.present();
	popover.onDidDismiss().then( (data) => {
      // perhaps I'll improve this- but for now I just know the enumeration
      userMenuPick = this.tarotCardService.getContextItemData();
	   //   console.log('menu done', userMenuPick);
	  // I don't know how to enumerate global constants... - hate to hard code #s
      switch (userMenuPick) {
        case 100: {
            this.SaveAsPDF();
        }
		                break;
        case 101: {
            this.editComment();
        }
                  break;
		case 102: {
			this.ShareReading(this.throw);
		}
				        break;
		case 103: {
			this.deleteThrow();
		}
				        break;
		case 104: {
			this.AssignFolder();
		}
				        break;
		case 105: {
			this.createNewFolder();
		}
            break;
		case 106: {
			this.RemoveFromFolder();
		}
            break;
      }
      // // have to implement all these soon!
      // if (userMenuPick === 1) {
      //   this.SaveComment();
      // }
    });
    // .then( () => {
    //   console.log('back from context menu?', this.tarotCardServe.getContextItemData());
    // });
  }
}
