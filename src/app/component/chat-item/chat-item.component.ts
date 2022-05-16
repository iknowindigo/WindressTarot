import { Component, OnInit, OnChanges, DoCheck, Input, AfterContentInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20
import { TarotCardsService, TarotCardsInThrow, CommentControl, LeftSelect, FolderForReadings } from '../../services/tarot-cards.service';
import { FirestoreService } from '../../services/firestore.service';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../../component/popover-menu/popover-menu.component';  // '../popover-menu/popover-menu.component';
import { AuthenticationService } from '../../services/authentication.service';
import { CommentEditComponent } from '../../component/comment-edit/comment-edit.component';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { TablehelpComponent, TarotData } from '../../component/tablehelp/tablehelp.component';
import { PdfGenService } from '../../services/pdf-gen.service';  // 7-28

@Component({
  selector: 'app-chat-item',    // 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.scss'],
})

export class ChatItemComponent implements OnInit, AfterContentInit, OnChanges {
  @Input('myID') data;
  msgID: string;
  thisMessage: DisplayMessage;
  avatarURL: string;
  throw: TarotCardsInThrow;
  typeChat: number;
  numLikes: number;
  showCommentComponent: boolean;
  userOwnsThis: boolean;
  user: firebase.User;
  comment: string;
  subject: string;
  scrollTag: string;
  refreshText: string;
  postComment: string;
  @ViewChild('content') elContent: ElementRef;


  @HostListener('document:click', ['$event'])
  andClickEvent(event) {
    if (!this.elContent.nativeElement.contains(event.target)) {
      this.showCommentComponent = false;
      // console.log('click outside');
      this.refreshText = '.';
      this.postComment = '';
      // if (!this.navCtrl.    isTransitioning() && this.navCtrl.getActive()) {
      //   this.close()
      // }
    }
  }

  constructor(
        private realtimeDB: RealtimeDbService,
        private tarotCardServe: TarotCardsService,
        private firestoreService: FirestoreService,
        public popoverController: PopoverController,
        private authService: AuthenticationService,
        private modalCtrl: ModalController,
        private alert: AlertController,
        public navCtrl: NavController,
        private pdfGenService: PdfGenService,
  ) {
  // console.log('chat component ------ ' + this.data);
      this.refreshText = '';
      this.scrollTag = '';
      this.userOwnsThis = false;
      this.thisMessage = null;
      this.typeChat = 0;  // 0 for chat - 1 for throw - 2 for image
      this.numLikes = 0;
      this.showCommentComponent = false;
  }

  ngAfterContentInit() {
	// this.msgID = this.data;
	// console.log('chat component ------ ngAfterContentInit ' + this.msgID);
	// this.thisMessage = this.realtimeDB.getMessageUsingID(this.msgID);
	// this.avatarURL = this.thisMessage.userProfileURL;
	// console.log('right message?', this.thisMessage);
  }

  ngOnInit() {
  // console.log('chat component-ngOnInit', this.msgID); // message id not here yet
  }

  ionViewDidLoad() {
    // console.log('chat component-view did load');
    this.showCommentComponent = false;
  }
  async ionViewDidEnter(){
	  // console.log('chat component-ionViewDidEnter');
  }


  ngOnChanges() {
    // every time the object changes
    // store the new `id`
        this.msgID = this.data;
        // console.log('chat component ------ ngAfterContentInit ' + this.msgID);
        this.realtimeDB.setMessageID(this.msgID);
        this.thisMessage = this.realtimeDB.getMessageUsingID(this.msgID);
        // console.log('chat message', this.thisMessage, this.thisMessage.postComments.length);
        this.scrollTag = this.realtimeDB.getScrollTag(this.msgID);
        // console.log('scroll tag', this.msgID, this.scrollTag);
        // console.log('chat item comment', this.thisMessage.postComments.length, this.thisMessage.postComments, this.thisMessage);
        this.avatarURL = this.thisMessage.userProfileURL;
        this.typeChat = 0;
        if (this.thisMessage.messageType === 'reading') {
          this.throw = this.firestoreService.findSocialTarotThrowByED(this.thisMessage.tarotThrowID);
          this.typeChat = 1;
          this.tarotCardServe.setCurrentThrow(this.throw);
          this.tarotCardServe.setSocialMode(true);  // this should reduce the menu in table help
  //        console.log('got social throw', this.throw,  this.typeChat, this.thisMessage.tarotThrowID);
      }
        this.user = this.authService.getCurrentFBUser();
        if (this.user != null && this.thisMessage != null) {
          this.userOwnsThis = this.thisMessage.ownerID === this.user.uid;
        } else { this.userOwnsThis = false; }
    //      console.log('chat component-ngOnChanges', this.avatarURL, this.thisMessage, this.userOwnsThis);
        this.showCommentComponent = false;

  //      console.log('chat message', this.thisMessage, this.thisMessage.postComments.length);
    }

  async onItemMenu(indent: number, eve, msg: DisplayMessage) {
    // if indent is 0 - the menu is for a post - else it's a reply
    // console.log('context menu', indent);
    // two possible menus - one for owner, other for friend
    if (msg === null) {
      return; // can't go on
    }

    let menuName = 'chat';  // 'chatMessage';
    menuName += msg.messageType;
    if (msg.ownerID === this.user.uid) {
      menuName += 'Owner';
    }
    // console.log('context menu', this.userOwnsThis, msg.ownerID, this.user.uid, this.msgID, msg.messageID);
    // use service to pass data
    this.tarotCardServe.setContextItemData(-1);  // if popover does something - it will over ride this
    let userMenuPick = 1;
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'narrow-menu-popover', // 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
        },
        data: menuName  // 'abc'
      },
      event: eve,
    });
    await popover.present();
    popover.onDidDismiss().then( (data) => {
      // perhaps I'll improve this- but for now I just know the enumeration
      userMenuPick = this.tarotCardServe.getContextItemData();
      // console.log('menu done', userMenuPick);
      switch (userMenuPick) {
        case 0: {
                this.LikePost();
        }
                break;
        case 1: {
                this.SaveComment(msg);
          }
                break;
        case 2: {
                this.EditPost(msg);
        }
                break;
        case 3: {
                this.DeletePost(msg);
        }
                break;
        case 100: {
            this.saveAsPDF(msg); // 11-20 have to do this here...
        }
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

  saveAsPDF(msg: DisplayMessage) {
    // porting code to do the save here
    if (this.throw == null) {
      this.throw = this.firestoreService.findSocialTarotThrowByED(msg.tarotThrowID);
    }
    if (this.throw != null) {
      this.pdfGenService.SaveAsPDF(this.throw);
    }
  }

  LikePost() {
    // I'll implement this someday
    // console.log('like post');
    this.showCommentComponent = false;
  }

  // 12-13 new comment code
  commentOnPost() {
     console.log('commenting', this.postComment);
    // make sure there's something there
    const comnt = this.postComment.trim();
    if (comnt.length > 0) {
      this.tarotCardServe.updateCommentSubject(this.postComment, '');
      this.realtimeDB.AddCommentToPost(this.thisMessage.messageID, this.postComment);
    }
   
    this.postComment = '';  // once we do it - clear it
  }


  async SaveComment(msg: DisplayMessage) {
    // console.log('make a comment');
    // let's try to scroll to next message - to make the comment box visible
    // const href = 'tarot-social#' + cbi.scrollTag;

    // const num = this.scrollTag.slice(7);
    // const iNum = parseInt(num, 10);
    // const nextNum = iNum + 2;
    // const nextEl = '#post000' + nextNum.toString();
    // const el2 = '#myComment';
    // const el3 = '#' + this.scrollTag;
    // const el = document.querySelector(el3);  // nextEl);  // '#' + this.scrollTag); // see if this works
    // // console.log('element?', el);  // num, iNum, nextNum, this.scrollTag, nextEl, el); //  el,
    // if (el != null) {
    //   el.scrollIntoView();
    //   el.scrollBy(1100, 0);
    //   // console.log('tried to scroll', el);
    // }
    this.realtimeDB.setMessageID(msg.messageID);   // this.msgID);
    // reworking things - rather than a UI embedded in the page - use a pop up
    let retVal = false;
    const data = {
      throw: this.throw,
      throwID: '' // nothing yet
    };
    // command depends on what the message type is - for now just post or comment, but soon reply
    const cmd = 'makeComment';
    // if (msg.messageType === 'comment') {
    //   cmd = 'makeReply';
    // }
    // console.log('here to make comment', data, msg.messageText, msg);
    const editPref: CommentControl = {
      command: cmd, // 'editPost',
      showSubject: false,
      saveText: 'Save',
      caption: 'Add a comment',
      objectID: msg.messageID,  // this.thisMessage.messageID,	// probably won't need this...
      refID: msg.referenceID,
      userID: msg.ownerID
	  };
    this.tarotCardServe.setCommentControl(editPref);  // this tells the comment editor what we want
    this.tarotCardServe.updateCommentSubject(msg.messageText, '');   // this.thisMessage.messageText, '');
    this.tarotCardServe.setCurrentThrow(this.throw);
    await this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
      // console.log('did not do anything?', res);
    })
    .finally( () => {
      // console.log('finally finished with comment?');
      this.comment = this.tarotCardServe.getCurrentComment();
      this.subject = this.tarotCardServe.getCurrentSubject();
      // try to force update?
      // msg.messageText = this.comment;
      retVal = this.tarotCardServe.getEditorDismissResult();
      // console.log('finished editing comment/subj', this.comment, this.subject, retVal, msg);
      this.showCommentComponent = false;
    });
    return retVal;
    // this.showCommentComponent = true;
  }

  doLike() {
    // console.log('like this');
    this.numLikes++;
    this.showCommentComponent = false;
  }

  // ngAfterContentChecked() {
  //   console.log('chat component-ngAfterContentChecked');
  // }

  // ngDoCheck() {
  //   console.log('chat component-ngDoCheck');
  // }


  async presentCommentEditor(dataToShow: TarotData) {
    // console.log('calling modal', dataToShow);
    const modal = await this.modalCtrl.create({
      component: CommentEditComponent,
      cssClass: 'my-modal',  // 'landingModal',  // 'my-modal',
      componentProps: { dataToShow }
    });
    await modal.present().then( res => {
      // console.log('done with editing?');
      return;
    });
  }

  EditPost(msg: DisplayMessage) {
    // console.log('Edit post', msg.messageID, msg);
    // this.tarotCardServe.setSocialMessage(this.thisMessage);
    if (msg.messageID === this.thisMessage.messageID) {
      this.editPostText(msg);
    }
  }

  async editPostText(msg: DisplayMessage): Promise<boolean> {
    let retVal = false;
    const data = {
      throw: this.throw,
      throwID: '' // nothing yet
    };
    // command depends on what the message type is - for now just post or comment, but soon reply
    let cmd = 'editPost';
    if (msg.messageType === 'comment') {
      cmd = 'editComment';
    }
    // console.log('here to edit', data, msg.messageText, msg);
    const editPref: CommentControl = {
      command: cmd, // 'editPost',
      showSubject: false,
      saveText: 'Save',
      caption: 'Edit your comment on your post',
      objectID: msg.messageID,  // this.thisMessage.messageID,	// probably won't need this...
      refID: msg.referenceID,
      userID: msg.ownerID
	  };
    this.tarotCardServe.setCommentControl(editPref);  // this tells the comment editor what we want
    this.tarotCardServe.updateCommentSubject(msg.messageText, '');   // this.thisMessage.messageText, '');
    this.tarotCardServe.setCurrentThrow(this.throw);
    await this.presentCommentEditor(data).then(res => { // do nothing - I'll do the save in the editor
      // console.log('did not do anything?', res);
    })
    .finally( () => {
      // console.log('finally finished with comment?');
      this.comment = this.tarotCardServe.getCurrentComment();
      this.subject = this.tarotCardServe.getCurrentSubject();
      // try to force update?
      // msg.messageText = this.comment;
      retVal = this.tarotCardServe.getEditorDismissResult();
      // console.log('finished editing comment/subj', this.comment, this.subject, retVal, msg);
      this.showCommentComponent = false;
    });
    return retVal;
  }

  // try to make confirmation dialog??
  async presentConfirmationDialog(messg: DisplayMessage) {
    const msg = 'Confirm you wish to delete post: ' + messg.messageText;
    const alert = await this.alert.create( {
      header: msg,  // 'Confirm Deletion of Post',
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
          // console.log('finally delete it', messg.messageID);
          if (messg.messageType === 'comment') {
            // or
            this.realtimeDB.deleteSocialUserComment(messg.messageID, messg.referenceID);
          } else {
          // decide if it's a post, a comment, or a reply
          this.realtimeDB.deletePost(messg.messageID);
          }
        }
      }
      ]
    });
    await alert.present();
  }
  DeletePost(msg: DisplayMessage) {
    // console.log('delete post', msg);
    // this.realtimeDB.setMessageID(this.msgID);
    // this.realtimeDB.deletePost(this.msgID);
    this.presentConfirmationDialog(msg);   // this.thisMessage.messageText); // get confirmation first
    this.showCommentComponent = false;
  }
}
