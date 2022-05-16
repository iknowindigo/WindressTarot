import { Component, OnInit } from '@angular/core';
import { TarotCard } from '../tarotCard.model';
import { TarotCardsService, TarotCardsInThrow, CommentControl } from '../../services/tarot-cards.service';
import { ActivatedRoute, Router, Resolve } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthGuardService } from '../../services/auth-guard.service';
import { AuthenticationService } from '../../services/authentication.service';
import { FirestoreService } from '../../services/firestore.service';
import * as jsPDF from 'jspdf';
import { DatePipe, formatDate } from '@angular/common';
import { CommentEditComponent } from '../../component/comment-edit/comment-edit.component';
import { TablehelpComponent, TarotData } from '../../component/tablehelp/tablehelp.component';
import { PdfGenService } from '../../services/pdf-gen.service';  // 7-28

@Component({
  selector: 'app-tarot-results',
  templateUrl: './tarot-results.page.html',
  styleUrls: ['./tarot-results.page.scss'],
})

export class TarotResultsPage implements OnInit {

  readingName: string;
  // oneCard : TarotCard;
  selectedSetOfCards: TarotCard[];
  textForEachPosition: string[];
  comment: string;
  userLoggedIn: boolean;
  throw: TarotCardsInThrow;
  throwIsSaved: boolean;
  throwToSave: TarotCardsInThrow;
  beforeReadingModal: any;
  pageNumber: number;
  subject: string; // added 8-16-20
  newReadingID: string;

  constructor(private activatedRoute: ActivatedRoute,
              private tarotCardService: TarotCardsService,
              private alertCtrl: AlertController,
    // public afs: AngularFirestore,
              private router: Router,
              private authentic: AuthenticationService,
              private firestoreService: FirestoreService,
    // private modalController: ModalController,
              private datepipe: DatePipe,
              private modalCtrl: ModalController,
              private pdfGenService: PdfGenService
    ) {
      // this.oneCard = this.tarotCardService.getOneCard("1c");
      this.throwIsSaved = false;
      this.selectedSetOfCards = [];
      this.comment = '';
      this.subject = '';

    //   this.selectedSetOfCards[0] =  this.oneCard; //this.tarotCardService.getSelectedCardsForReading();
    // // this.selectedSetOfCards = [];
      this.readingName = 'test';
      this.textForEachPosition = [];
      this.userLoggedIn = this.authentic.isAuthenticated();
      const stuff =    this.authentic.getUserNameAndPW();
      // console.log('stuff', stuff);
      // console.log('results constructor');

      this.authentic.getUserNPW().then( res => {
        //  console.log('getUserNPW  2', res);
       });
    }
    ngOnInit() {
      // console.log('results - on init');
      //  this.selectedSetOfCards = this.tarotCardService.getSelectedCardsForReading();
      //  this.readingName = this.tarotCardService.getReadingName();
      //  console.log(this.selectedSetOfCards, this.readingName);

      //  this.fillOutTextPositionArray(this.selectedSetOfCards.length);
      // this.throw.typeThrow = this.tarotCardService.GetTextForRay(); //
    }

    async goHome() {
      // await this.modalCtrl.dismiss();
      // this.router.navigate(['tarot-deck']);
      this.router.navigate(['tarot-deck']);
    }

    isLoggedIn() {
      this.authentic.isAuthenticated();
    }

    async tryToDismissBeforeReading() {
      // this.makeEverythingOpaqueAgain();
      // console.log('try to dismiss?');
      const modal = await this.modalCtrl.getTop();
      if (modal != null && modal != undefined) {
        modal.dismiss();
        // console.log('dismissed modal');
        // this.fadeUpAnimation.play();  // bring everything back to visible
      }
    }

    emailReading() {
      console.log("will figure out how to email a reading...")
      // will take me a few tries to get this...
      
    }
    mailto(emailAddress: string, emailSubject: any) {
      return "mailto:" + emailAddress + "?subject=" + emailSubject
  }

    RepeatThrow() {
      // this is a little tricky...
      // we know what the last reading was - just set that up
      // oops - hard part might be the 'prepare yourself' dialog?
      const numCards = this.selectedSetOfCards.length;
      // console.log('repeat throw', numCards);
      this.tryToDismissBeforeReading(); // try to kill previous modal
      this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
      .then( (val) => {
        // console.log('prepare ', this.beforeReadingModal );
        // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
        // this.tarotCardService.dealOneCard();
        this.tarotCardService.shuffleCards();
        this.tarotCardService.setNumberCardsToSelect(numCards);  // once this many cards have been selected - we'll move on
        // this.router.navigate(['throw'])
       });
    }

    cardClicked(card: TarotCard) {
      card.cardSelected = !card.cardSelected;
      if (card.cardSelected) {
        this.alertCtrl.create({
          header: card.title,
          message: `<img src="${card.imageUrl}" class="card-alert">`,
           buttons: ['']
        }).then (alertEl => {
          alertEl.present();
          setTimeout( () => {
            alertEl.dismiss();
          }, 3000);
        });
      }
    }

    ionViewCanEnter() {
      // console.log('results ionViewCanEnter');
      const stuff =    this.authentic.getUserNameAndPW();
      // console.log('stuff 1', stuff);

      this.authentic.getUserNPW().then( res => {
        // console.log('getUserNPW 3', res);
      });
    }
    ionViewDidLoad() {
       console.log('results ionViewDidLoad');
    }

    ionViewDidEnter() {
      if (this.selectedSetOfCards === undefined) {
        console.log('??? why');
        return;
      }
      // this.tarotCardService.setSocialMode(true); // ?? this was a bug
      this.throwIsSaved = false;
      this.comment = '';  // it wasn't being cleared
      this.userLoggedIn = this.authentic.isAuthenticated();
      // console.log('results ionViewDidEnter - logged in?', this.userLoggedIn);
        // console.log('results - on init');
      this.selectedSetOfCards = this.tarotCardService.getSelectedCardsForReading();
      this.readingName = this.tarotCardService.getReadingName();

        this.newReadingID = this.tarotCardService.getNewReadingID();
  //       console.log('new id?', this.newReadingID);

       console.log("ionViewDidEnter", this.selectedSetOfCards, this.readingName, this.newReadingID);

      const throwType = this.tarotCardService.GetTextForRay();
        // this.fillOutTextPositionArray(this.selectedSetOfCards.length);
      const fbUser = this.authentic.getCurrentFBUser();
      const now = new Date();
      const ddt = this.datepipe.transform(now, 'M/d/yy');
      this.throw = {
          numberCards: this.selectedSetOfCards.length,
          typeThrow: throwType,  // "",
          readingName : '',
          userID: (fbUser == null) ? '' : fbUser.uid,
          dateTime:  Date(),
          dateModified: Date(),
          comment: this.comment,
          subject: this.subject,
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
      if (this.selectedSetOfCards.length == 1) {
          this.throw.typeThrow = 'One Card';
        } else if (this.selectedSetOfCards.length == 3) {
          this.throw.typeThrow = 'Three Cards';
        } else if (this.selectedSetOfCards.length == 11) {
          // this.throw.typeThrow = "Pyramid Reading"
          // one of the 9 rays - ask which one
          this.throw.typeThrow = this.tarotCardService.GetTextForRay(); //
        }
      // console.log('made throw', this.throw);
        // ok - pass this reading to the service so the component can read it
      this.tarotCardService.setCurrentThrow(this.throw);
      }

    // adjust(): void {
    //   // console.log(this.comment);
    //   }

    getCardsFromReading(): string {
      let cardList = '';
      this.selectedSetOfCards.forEach(card => {
        cardList += card.id;
        cardList += ',';    // note - there will be a terminal comma
      });
      return cardList;
    }

   cssInfo( element, property ) {
    return window.getComputedStyle( element, null ).getPropertyValue( property );
}


  savePDF() {

    // g.s. 7-28 - switched to common PDF generation
    this.pdfGenService.SaveAsPDF(this.throw);

  }

  async presentCommentEditor(dataToShow: TarotData) {
    // console.log('calling modal', dataToShow);
    const modal = await this.modalCtrl.create({
      component: CommentEditComponent,
      cssClass: 'my-modal',
      componentProps: { dataToShow }
    });
    await modal.present().then( res => {
      // console.log('done with editing?');
      return;
    });
  }

  // still can't pass data to component?? so I'll cheat and use the service
  async editComment(): Promise<boolean> {
    let retVal = false;
    const data = {
      throw: this.throw,
      throwID: '' // nothing yet
    };
    // console.log('here to edit', data);
    const editPref: CommentControl = {
      command: 'newThrow',
      showSubject: true,
      saveText: 'Save',
      caption: 'Edit Comments on Reading',
      objectID: '',	// probably won't need this...
      refID: '',
      userID: ''
	  };
	   this.tarotCardService.setCommentControl(editPref);  // this tells the comment editor what we want
    this.tarotCardService.setCurrentThrow(this.throw);
    await this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
      // console.log('did not do anything?', res);
    })
    .finally( () => {
      // console.log('finally finished with comment?');
      this.comment = this.tarotCardService.getCurrentComment();
      this.subject = this.tarotCardService.getCurrentSubject();
      retVal = this.tarotCardService.getEditorDismissResult();
       console.log('finished editing comment/subj', this.comment, this.subject, retVal);
    });
    return retVal;
  }


  // so I'm reworking this to bring up comment editor first
  // after playing around - I finally gave in, and let the comment component call the save reading
  // I think this is ok
  async sendServer() {

    // set everything up before calling the comment guy
    const cardList = this.getCardsFromReading();
    this.tarotCardService.setNewCardList(cardList);

    // const throwType = this.selectedSetOfCards.length;
    // 8-21-20 new approach - 9 rays have different throw type for each ray
    // const throwType = this.tarotCardService.getThrowType();

    // first step is to get the user to enter comments
    // we'll let him/her skip that (no comments) - but they can click cancel to avoid the save
    await this.editComment() // this will fill in comments and return true if save should continue
    .finally( () => {
       console.log('comment editor closed?');
      const  retVal = this.tarotCardService.getEditorDismissResult();
      if (!retVal) {
         console.log('user cancelled', this.comment, this.subject, retVal);
         this.throw = this.tarotCardService.getCurrentThrow();
         console.log('after save? get throw', this.throw);
         //this.refresh();
        //  this.newReadingID = this.tarotCardService.getNewReadingID();
        //  console.log('new id?', this.newReadingID);
        return;
      } else {
        this.throw = this.tarotCardService.getCurrentThrow();
        console.log('after save? get throw', this.throw);
      }
    });
  }

  goDiary() {

  }


}

