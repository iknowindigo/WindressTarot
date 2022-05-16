import { Component, OnInit, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { RealtimeDbService, CommentBadgeInfo, ScrollToComment, BadgeNotifyInfo, ChatMessage, UsersMsg, DisplayMessage } from '../../services/realtime-db.service'; // 9-25-20
import { TarotCardsService, TarotCardsInThrow, LeftSelect, FolderForReadings } from '../../services/tarot-cards.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
// in time I may generalize this - to be the way context menus are done
// but for now I'll hard code it
@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
})
export class PopoverMenuComponent implements OnInit {
  throwMenu: boolean; // 11-18-20 new menu system for diary
  socialThrowMenu: boolean;
  smallScreen: boolean;
  folderSource: boolean;
  throwNotSaved: boolean;
  socialMenu: boolean;
  userOwnsThis: boolean;
  socialAddPDF: boolean;
  editComment: boolean;
  deleteComment: boolean;
  replyMenu: boolean;
  showFR: boolean;
  showCommentTargets: boolean;
  menuName: string;
  friendRequests: UserData[];
  requestNames: string [];
  commentBadgeInfo: CommentBadgeInfo[];
  scrollingTags: ScrollToComment[];
  commentLinks: string [];
  commentHref: string[];
  myBadgeNotifications: BadgeNotifyInfo[];
  @Input()  public onClick = () => {};


  constructor(
    public navParams: NavParams,
    private realtimeDB: RealtimeDbService,
    private tarotCardServe: TarotCardsService,
    private firestoreService: FirestoreService,
    ) {
      this.myBadgeNotifications = [];
      this.scrollingTags = [];
      this.editComment = false;
      this.deleteComment = false;
      this.socialAddPDF = false;  // 11-20
      this.throwMenu = false; // 11-18-20 new menu system for diary
      this.socialThrowMenu = false;
      this.smallScreen = false;
      this.folderSource = false;
      this.socialMenu = true;
      this.throwNotSaved = false;
      this.commentBadgeInfo = [];
      this.commentLinks = [];
      this.commentHref = [];
      this.requestNames = [];
      this.menuName = this.navParams.get('data');
      // console.log('popover menu', this.menuName);
      if (this.menuName === 'throwMenu') {
        this.socialMenu = false;
        this.throwMenu = true; // 11-18-20 new menu system for diary
      }
      if (this.menuName === 'throwMenuSocial' || this.menuName === 'throwMenuSocialsmall') {
        // table help can't show any menu - the social page will have to learn how to do everything
        this.socialMenu = false;
        this.throwMenu = false;   // true; // 11-18-20 new menu system for diary
        this.socialThrowMenu = false;   // true;
      } else if (this.menuName === 'throwMenusmall') {
        this.throwMenu = true;
        this.smallScreen = true;
        this.socialMenu = false;
      }
      if (this.menuName === 'throwMenuisFolder' || this.menuName === 'throwMenusmallIsFolder') {
        this.folderSource = true;
        this.socialMenu = false;
      }
      if (this.menuName === 'throwMenuNotSaved') {
        this.throwNotSaved = true;
        this.throwMenu = true;
        this.socialMenu = false;
      }
      this.userOwnsThis = this.menuName === 'chatMessageOwner';
      this.socialAddPDF = (this.menuName === 'chatMessagethrow' || this.menuName === 'chatMessageOwnerthrow');
      this.replyMenu = this.menuName === 'commentReply';
      this.showFR = this.menuName === 'showFriendRequests';
      if (this.showFR) {
        this.socialMenu = false;
        this.friendRequests = this.realtimeDB.getMyFR();
        // console.log('friend requests', this.friendRequests.length, this.friendRequests);
        this.friendRequests.forEach(fr => {
          const name = fr.firstName + ' ' + fr.lastName + ', ' + fr.nickName ;
          this.requestNames.push(name);
        });
      }
      this.showCommentTargets = this.menuName === 'showPostComments';
      if (this.showCommentTargets) {
        this.socialMenu = false;
        // let's only show the most recent 12 - just to guess at a limit
        // 1-5-21 - this got more complex - two kinds of notifications now - put it in a function
        this.buildBadgeNotifiction(); 
        // let cnt = 0;
        // this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
        // if (this.commentBadgeInfo.length > 0) {
        //   this.sortCommentBadgeByDate();    // sort first ?
        //   this.scrollingTags = this.realtimeDB.getBadgeSrollTags();
        //   // reworked scroll tags
        //   this.commentBadgeInfo.forEach(cbi => {
        //     if (cnt++ < 12) {
        //       // console.log('comments', cbi);
        //       const link = cbi.blurb + '  (' + cbi.who + ' '  + cbi.displayDate + ')';
        //       this.commentLinks.push(link);
        //       const scrlTag = this.GetScrollTagFromTable(cbi.referenceID);
        //       const href = 'tarot-social#' + scrlTag;   // cbi.scrollTag;
        //       this.commentHref.push(href);
        //     }
        //     else { console.log('skipped comment - more than a dozen'); }
        //   });
        //   // console.log('comment links', this.commentLinks, this.commentHref);
        // }
        this.sortCommentBadgeByDate();
      }
      // 11-20 ok I changed things a lot - here we go again
      if (this.menuName === 'chatreading') {
        this.socialMenu = true;
        this.socialAddPDF = true;
      } else if (this.menuName === 'chatchatOwner') {
        this.userOwnsThis = true;
        this.editComment = true;
        this.deleteComment = true;
      } else if (this.menuName === 'chatcommentOwner') {
        this.userOwnsThis = true;
        this.editComment = true;
        this.deleteComment = true;
        this.socialMenu = true;
      } else if (this.menuName === 'chatreadingOwner') {
        this.socialMenu = true;
        this.throwMenu = false;
        this.editComment = true;
        this.socialAddPDF = true;
        this.deleteComment = true;
      }
      // console.log('pop menu',
      //   this.menuName, this.throwMenu, this.socialThrowMenu, this.smallScreen,
      //   this.folderSource, this.userOwnsThis, this.socialAddPDF, this.editComment, this.deleteComment, this.socialMenu);
  }

  GetScrollTagFromTable(refID: string) {
    let scrlTag = '';
    if (this.scrollingTags.length > 0) {
      this.scrollingTags.forEach(stg => {
        if (stg.referenceID === refID) {
          scrlTag = stg.scrollTag;
        }
      });
    }
    // console.log('get scroll tag', refID, scrlTag);
    return scrlTag;
  }

  ngOnInit() {
    this.realtimeDB.badgeReadyState.subscribe(badgeInfo => {
      // this.crunchMessages();
      this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
      this.scrollingTags = this.realtimeDB.getBadgeSrollTags();
      // this.numBadgeComments = this.commentBadgeInfo.length;
      // console.log('badge ready state', badgeInfo, this.commentBadgeInfo.length);
    });
  }

  afterClick(sel: number) {
    // console.log('clicked', sel);
    this.tarotCardServe.setContextItemData(sel);
    this.onClick();
  }
  sortCommentBadgeByDate() {
    // console.log('here to sort messages for display', this.commentBadgeInfo.length, this.commentBadgeInfo);
    if (this.commentBadgeInfo.length > 0) {
      this.commentBadgeInfo.sort( (a, b): number => {
        if (a.rawDateForSort > b.rawDateForSort) {
          return -1;
        }
        else if (a.rawDateForSort === b.rawDateForSort) {
          return 0;
        }
        else {
          return 1;
        }
      });
    }
  }

  buildBadgeNotifiction() {
    // this.myBadgeNotifications = this.realtimeDB.getMyNewBadgeNotifications();
    if (this.myBadgeNotifications.length > 0) {
      this.myBadgeNotifications.forEach(bn => {
        console.log('bn', bn);
      })
    }
    let cnt = 0;
      this.commentBadgeInfo = this.realtimeDB.getBadgeComments();
      if (this.commentBadgeInfo.length > 0) {
        this.sortCommentBadgeByDate();    // sort first ?
        this.scrollingTags = this.realtimeDB.getBadgeSrollTags();
        // reworked scroll tags
        this.commentBadgeInfo.forEach(cbi => {
          if (cnt++ < 12) {
            console.log('comments', cbi);
            const link = cbi.blurb + '  (' + cbi.who + ' '  + cbi.displayDate + ')';
            this.commentLinks.push(link);
            const scrlTag = this.GetScrollTagFromTable(cbi.referenceID);
            const href = 'tarot-social#' + scrlTag;   // cbi.scrollTag;
            this.commentHref.push(href);
          }
          else { console.log('skipped comment - more than a dozen'); }
        });
        // console.log('comment links', this.commentLinks, this.commentHref);
      }
  }
}
