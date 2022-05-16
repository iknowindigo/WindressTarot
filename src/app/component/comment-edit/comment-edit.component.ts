import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TarotCardsService, TarotCardsInThrow, CommentControl } from '../../services/tarot-cards.service';
import { FormsModule } from '@angular/forms';
import { FirestoreService, UserData } from  '../../services/firestore.service';
import { RealtimeDbService } from '../../services/realtime-db.service'; // 10-1
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.scss'],
})
export class CommentEditComponent implements OnInit {
  throw: TarotCardsInThrow;
  comment: string;
  subject: string;
  // 10-3 - reusing this for all kinds of editing of text/comment
  title: string;
  saveText: string;
  includeSubject: boolean;
  commentControl: CommentControl;
  showSharingUI: boolean;
  // showSharingFriends: boolean;
  shareMode: string;  // for now either 'friends' - or user ID
  selectList: string[];
  myFriends: UserData[];
  user: firebase.User;
  busyWorking: boolean;

  // radioData: string;

  @Input() data: any;

  constructor(
      private modalCtrl: ModalController,
      private firestoreService: FirestoreService,
      private tarotService: TarotCardsService,
      private realtimeDb: RealtimeDbService,
      private authService: AuthenticationService,
  ) {
    this.includeSubject = true;
    this.title = 'Edit Comments on Reading';
    this.saveText = 'Save';
    this.showSharingUI = false;
    // this.showSharingFriends = false;
    this.shareMode = 'friends';
    this.selectList = [];
    this.busyWorking = false; // use this to enable/disable the OK button 12-10
    // this.radioData = '';
    console.log('tarot results page')
  }

  ngOnInit() {
  // this.throw = this.tarotService.getCurrentThrow();
  this.user = this.authService.getCurrentFBUser();  // back door
  this.SetupCommentStuff(); // it's complicated - don't do it twic

  // console.log('comment editing', this.commentControl, this.comment);
  this.myFriends = this.realtimeDb.getMyFriends(this.user.uid);

  if (this.myFriends.length > 0) {
    // this.selectList.push('Select:');
    // const frnds = this.myFriends.length.toString() + ' Friend' + ( (this.myFriends.length === 1) ? '' : 's');
    this.selectList.push('My Friends');
    this.myFriends.forEach(fnd => {
        const disp = fnd.nickName + ' (' + fnd.firstName + ', ' + fnd.lastName + ')';
        this.selectList.push(disp);
      });
    } else {
      this.selectList.push('My Friends');
    }

  // console.log('my friends', this.myFriends, this.user);
	// console.log('edit ->', this.comment);
  }

  // refactored so we don't do things twice
  SetupCommentStuff() {
    this.commentControl = this.tarotService.getCommentControl();  // our caller has set this up
    this.throw = this.tarotService.getCurrentThrow();
    if (this.throw != null) {
       this.comment = this.throw.comment;
       this.subject = (this.throw.subject === undefined) ? '' : this.throw.subject;
       this.showSharingUI = !this.commentControl.showSubject;  // for now
     }
    if (this.commentControl.command === 'editPost') {
       this.comment = this.tarotService.getCurrentComment();  // social has separate text
       this.showSharingUI = false; // we just want to edit the comment
     }
    if (this.commentControl.command === 'shareThrow') {
      this.comment = '';
      this.subject = '';
    }
    if (this.commentControl.command === 'editComment') {  // 11-22
      this.comment = this.tarotService.getCurrentComment();  // social has separate text
      this.showSharingUI = false; // we just want to edit the comment
    }
    if (this.commentControl.command === 'makeComment') {
      // 11-23
      this.comment = '';
      this.showSharingUI = false;
    }
  }

  ionViewDidEnter(){
    this.SetupCommentStuff(); // don't do it twice
    // this.commentControl = this.tarotService.getCommentControl();  // our caller has set this up
	  //  this.throw = this.tarotService.getCurrentThrow();
	  //  if (this.throw != null) {
    //   this.comment = this.throw.comment;
    //   this.subject = (this.throw.subject === undefined) ? '' : this.throw.subject;
    //   console.log('ionViewDidEnter edit ->', this.comment, this.commentControl);
    // }
    // if (this.commentControl.command === 'shareThrow') {
    //   this.comment = '';
    //   this.subject = '';
    // }
}

  async close() {
	await this.modalCtrl.dismiss().then(res => {
    // console.log('now are we done? - waited for the user', res);
  });
  }

  // decided I have to reload the same select list - couldn't get a 2nd list to show/hide
  selectChangeTop(event) {
    // const len = this.selectList.length;
    // for (let i = 0; i < len; i++) {
    //   this.selectList.pop();
    // }

    const srcEle = event.srcElement;
    const options: HTMLOptionsCollection = srcEle.options;
    const selectedI = options.selectedIndex;
    if (selectedI === 0) {
      // this.selectList.push('Friends');
      // this.selectList.push('Select:');
      this.shareMode = 'friends';
      // this.showSharingFriends = false;
      // srcEle.enterKeyHint = 'a';
    } else if (selectedI > 0) {
      // const sel = options.item[selectedI].text;
      // console.log('trying to find text', options, options[0], options[1]);
      // console.log('trying to find text', options, options[0].innerText, options[1].innerText);
      const username = options[selectedI].innerText.trim();
      const userid = this.myFriends[selectedI - 1].userID;
      if (this.shareMode === 'friends') {
        // meaning this is 2nd time here - we think we've picked a user now
        this.shareMode = userid.trim();
      }
      // console.log('selected', userid, username, selectedI, this.shareMode);
    }
    // console.log('top select changed', selectedI, this.shareMode);
  }


  // selectChangeFriend(event) {
  //   const srcEle = event.srcElement;
  //   const options: HTMLOptionsCollection = srcEle.options;
  //   const selectedI = options.selectedIndex;
  //   console.log('Friend select changed', selectedI);
  // }
  // this wasn't waiting until dialog was dismissed - working on that...
  async SaveComment() {
	// I guess I'll do the write here ..
	// call the service and have it do the work
  // I'm now calling this before we save the throw from results screen - so skip this
  this.busyWorking = true; // this should disable a second click on the  button
  // console.log('about to save', this.commentControl);
  switch (this.commentControl.command) {
      case 'editThrow': {
        this.playEnterKey();
        if (this.throw.throwID.length > 6) {
          await this.firestoreService.UpdateComment(
          this.throw.throwID,
          this.comment,
          this.subject,
          this.throw);  // just making a very specific function here
          // console.log('after comment update');
        }
        break;
      }
      case 'newThrow': {
        const cardList = this.tarotService.getNewCardList();
        const throwType = this.tarotService.getThrowType();
        this.firestoreService.addReading(
          throwType, cardList, this.comment,
          this.subject   // this.throwToSave.comment
        );
        // get reading ID and mark this as a saved reading
        console.log('new reading', cardList, throwType, this.comment, this.subject);
        // cheap and dirty way to avoid context menu problems - pretend we're on the social page
        this.tarotService.setSocialMode(true);
        break;
      }
      case 'shareThrow': {
        this.playShareSound();
        const editPref = this.tarotService.getCommentControl();
        // const comment = this.tarotService.getCurrentComment();
        // console.log('about to share', editPref, this.comment);
        // 10-10 adding sharing - will have to work on this today
        this.realtimeDb.shareReading(editPref.userID, editPref.objectID, this.comment, this.shareMode);     // this.user.uid, athrow);
      }
                         break;
      case 'editPost': {
        this.playEnterKey();
        const editPref = this.tarotService.getCommentControl();
        // console.log('about to update social post', editPref);
        // const socialMessage = this.tarotService.getSocialMessage();
        this.realtimeDb.editSocialPostComment(editPref.objectID, this.comment);
      }
                       break;
      case 'editComment': {
        this.playEnterKey();
        // new command - 11-21
        const editPref = this.tarotService.getCommentControl();
        // console.log('about to update social post', editPref);
        // const socialMessage = this.tarotService.getSocialMessage();
        this.realtimeDb.editSocialUserComment(editPref.objectID, editPref.refID, this.comment)
        .finally( () => {
          // const uc = this.realtimeDb.FindCommentUsingID(editPref.objectID);
          // if (uc != null) {
          //   uc.textComment = this.comment;
          //   console.log('all done editing comment?  I would like to force an update', uc);
          // }
        });
      }
                          break;
      case 'makeComment': {
        if (this.comment.length > 0) {
          this.playEnterKey();
          // let's do this
          const editPref = this.tarotService.getCommentControl();
          // console.log('about to add comment to post', editPref, this.comment);
          this.realtimeDb.AddCommentToPost(editPref.objectID, this.comment); // we'll figure out the rest for the db
          this.comment = '';
        }
      }
      break;
    }
    // let's update things
  if (this.commentControl.showSubject) {
      this.throw.comment = this.comment;  // update
      this.throw.subject = this.subject;
      this.tarotService.setCurrentThrow(this.throw);
    }

  this.tarotService.updateCommentSubject(this.comment, this.subject); // this is how we pass things back and forth
  const done = await this.modalCtrl.dismiss();
  this.tarotService.setEditorDismissResult(done);
  // console.log('comment save comment complete', this.comment, this.subject, done);
  // this.busyWorking = false; // shouldn't need this...
  return done;
  }

  playShareSound() {
    let audio = new Audio();
    audio.src = './assets/sounds/swoosh.mp3';
    audio.load();
    audio.play();
  }
  playEnterKey() {
    let audio = new Audio();
    audio.src = './assets/sounds/enterKey.mp3';
    audio.load();
    audio.play();
  }
}
