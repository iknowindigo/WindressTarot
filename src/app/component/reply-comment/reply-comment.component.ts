import { Component, OnInit, OnChanges, DoCheck, Input, AfterViewInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { RealtimeDbService, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20
import { TarotCardsService, TarotCardsInThrow, LeftSelect, FolderForReadings } from '../../services/tarot-cards.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { AuthenticationService, ProfileUserData } from '../../services/authentication.service';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../../component/popover-menu/popover-menu.component';  // '../popover-menu/popover-menu.component';

@Component({
  selector: 'app-reply-comment',
  templateUrl: './reply-comment.component.html',
  styleUrls: ['./reply-comment.component.scss'],
})
export class ReplyCommentComponent implements  OnInit, OnChanges, AfterViewChecked, AfterViewInit {
  throw: TarotCardsInThrow;
  msgID: string;
  thisMessage: DisplayMessage;
  userAvatarURL: string;
  user: firebase.User;
  ourUser: UserData;
  commentText: string;
  @ViewChild('commentHere') elem: ElementRef;

  constructor(
    private realtimeDB: RealtimeDbService,
    private tarotCardServe: TarotCardsService,
    private authService: AuthenticationService,
    public popoverController: PopoverController,
	   private firestoreService: FirestoreService,
  ) {
    this.commentText = '';
  }

  ngOnInit() {
    // this.throw = this.tarotCardServe.getCurrentThrow();
    this.user = this.authService.getCurrentFBUser();
    this.ourUser = this.firestoreService.getUserUsingEmail(this.user.email);
    // console.log('user info', this.user, this.ourUser);

    this.msgID = this.realtimeDB.getMessageID();  // this is how we get aligned
    this.thisMessage = this.realtimeDB.getMessageUsingID(this.msgID);
    // console.log('reply component',  this.msgID, this.thisMessage);
    if (this.ourUser != null) {
      this.userAvatarURL = this.ourUser.profilePicURL;
    } else {
      this.userAvatarURL = '../assets/img/persons.png';
    }

  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
      // console.log('edit control?', this.elem, this.elem.nativeElement);  // el

      if (this.elem != null && this.elem.nativeElement != null) {
        // this.elem.nativeElement.focus();
        this.elem.nativeElement.setFocus();
      }
    }

  ngAfterViewChecked() {
    const el = document.querySelector('#commentHere');

    // console.log('edit control?', this.elem, this.elem.nativeElement);  // el

    // if (this.elem != null) {
    //   // this.elem.nativeElement.focus();
    //   // this.elem.nativeElement.setFocus();
    // }
  }

  async onItemMenu() {
    // console.log('context menu');
    // two possible menus - one for owner, other for friend
    const menuName = 'commentReply';
    // if (this.userOwnsThis) {
    //   menuName = 'chatMessageOwner';
    // }
    // console.log('menu', this.userOwnsThis, this.thisMessage.ownerID, this.user.uid);
    // use service to pass data
    this.tarotCardServe.setContextItemData(-1);  // if popover does something - it will over ride this
    let userMenuPick = 1;
    const popover = await this.popoverController.create( {
      component: PopoverMenuComponent,
      cssClass: 'comment-popover',
      // event: ev
      componentProps: {
        onClick: () => {
          popover.dismiss();
        },
        data: menuName  // 'abc'
      }
    });
    await popover.present();
    popover.onDidDismiss().then( (data) => {
      // perhaps I'll improve this- but for now I just know the enumeration
      userMenuPick = this.tarotCardServe.getContextItemData();
      // console.log('menu done', userMenuPick);
      // have to implement all these soon!
      // if (userMenuPick === 1) {
      //   this.SaveComment();
      });
    // .then( () => {
    //   console.log('back from context menu?', this.tarotCardServe.getContextItemData());
    // });
  }

  sendComment() {
    // console.log('comment: ', this.commentText);
    if (this.commentText.length > 0) {
      // let's do this
      this.realtimeDB.AddCommentToPost(this.msgID, this.commentText); // we'll figure out the rest for the db
      this.commentText = '';
    }
  }
}
