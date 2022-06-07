
// -- I'll try to isolate code for the realtime firebase db into this serive module
import { Injectable } from '@angular/core';
import { AngularFirestore, validateEventsArray, CollectionReference } from '@angular/fire/firestore';
import { firestore, database } from 'firebase/app';
import {  Router } from '@angular/router';
import Timestamp = firestore.Timestamp;
import { AuthenticationService } from '../services/authentication.service';  // 'src/app/services/authentication.service';
import { NavController, AlertController } from '@ionic/angular';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy, FolderForReadings } from '../services/tarot-cards.service';
import { FirestoreService, UserData } from '../services/firestore.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';
import { async } from '@angular/core/testing';
import { first, timestamp } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { getRulesDirectories } from 'tslint/lib/configuration';
import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import { getDefaultFormatCodeSettings, isJSDocVariadicType } from 'typescript';
import { FirebaseApp } from '@angular/fire';

export interface ChatMessage {
  messageID: string;  // use this for delete/edit
  referenceID: string; // 11-22 realized I need this to support multiple comments per post
  sharing: string; // 10-10
  timeStamp: Timestamp;
  typeMessage: string;
  userID: string;
  textMessage: string;
  tarotThrowID: string;
  pictureURL: string;
}

export interface UsersMsg {
  messageID: string;
  // timeStamp: Timestamp;
  userID: string;
}

export interface HarvestID {
  tarotThrowID: string;
  userID: string;
}

export interface DisplayMessage {
  userName: string;
  userProfileURL: string;
  displayDate: string;
  rawDateForSort: Timestamp;
  messageText: string;
  messageID: string;  // used by component
  referenceID: string;  // 11-22 realized with more than one comment per post - I need this
  // ...more to come
  messageType: string;
  tarotThrowID: string;
  pictureURL: string;
  ownerID: string;    // 10-23 - need to figure who owns the msg
  iOwnThis: boolean;  // 12-13 - this controls if a menu is even displayed
  postComments: DisplayMessage[];
  scrollTag: string;  // 11-10 - make each message scrollable as a target (for badges)
}

export interface FriendRequest {
  userID: string;
  userEmail: string;
  timeStamp: Timestamp;
  referenceID: string;
}

export interface FriendsRequestData {
  userID: string;
  userEmail: string;
  requestingUserID: string;
  requestingUserEmail: string;
  referenceID: string;    // so we can delete it later
}

export interface FriendsData {
  userID: string;
  userEmail: string;
  referenceID: string;    // so we can delete it later
  timeStamp: Timestamp; // time we became friends
}

export interface UserComment {
  messageID: string;
  timeStamp: Timestamp;
  referenceID: string;    // so we can delete it later
  userID: string;
  textComment: string;
}

export interface ScrollToComment {
  messageID: string;
  referenceID: string;
  userID: string;
  scrollTag: string;
}

export interface CommentsOnUserPosts {
  messageID: string;
  referenceID: string;  // use this to get the scroll tag
  timestamp: Timestamp;
  userID: string;
  displayDate: string;
  blurb: string;      // 11-20
}

export interface CommentBadgeInfo {
  scrollTag: string;    // this is main thing - where to scroll to
  referenceID: string;  // use this to get the scroll tag
  displayDate: string;
  rawDateForSort: Timestamp;  // for sorting
  what: string;
  who: string;    // FB adds user names together (him, her, etc)
  pictureURL: string;
  blurb: string;
}

export interface LoginInfo {
  timestamp: Timestamp;
  userEmail: string;
}

export class TarotThrowCount {
  userID: string;
  userEmail: string;
  skippedUsers: number;
  socialUser: boolean;
  numTotalThrows: number;
  numSingleCard: number;
  numThreeCard: number;
  numMemoryGame: number;
  numPyramid: number;
  rayOne: number;
  rayTwo: number;
  rayThree: number;
  rayFour: number;
  rayFive: number;
  raySix: number;
  raySeven: number;
  rayEight: number;
  rayNine: number;
  cnt0720: number;
  cnt0820: number;
  cnt0920: number;
  cnt1020: number;
  cnt1120: number;
  cnt1220: number;
  cnt0121: number;
  cnt0221: number;  // 2/5/21
  cnt0321: number;
  cnt0421: number;
  cnt0521: number;
  cnt0621: number;
  // 4/20/22 - let's keep going
  cnt0721: number;
  cnt0821: number;
  cnt0921: number;
  cnt1021: number;
  cnt1121: number;
  cnt1221: number;
  cnt0122: number;
  cnt0222: number;
  cnt0322: number;
  cnt0422: number;
  cnt0522: number;
  cnt0622: number;
  cnt0722: number;
  cnt0822: number;
  cnt0922: number;
  cnt1022: number;
  cnt1122: number;
  cnt1222: number;
  cnt0123: number;
  cnt0223: number;
  cnt0323: number;
  cnt0423: number;
  cnt0523: number;
  cnt0623: number;
  cnt0723: number;
  cnt0823: number;
  cnt0923: number;
  cnt1023: number;
  cnt1123: number;
  cnt1223: number;
}

export interface DashboardUserInfo {
  userID: string;
  userEmail: string;
  status: string;
  lastLoginTime: string;  // display format
  profilePicURL: string;
  rawDateForSort: Timestamp;
  numFriends: number;
  numFriendRequests: number;
  numPosts: number;
  numComments: number;
  // 6/14/21 - decided to also collect stats on how many throws each person has
  totalThrows: number;
  singleCard: number;
  threeCards: number;
  pyramidCards: number;
  nineRay: number;
  memoryGame: number;
}

// // 1-4-21 -- new badge notification data
// // (1`) this is how it's stored in the db
// export interface BadgeNotifyData {
//   messageID: string;
//   messageType: string; 
//   referenceID: string;  // use this to delete it later
//   userID: string;       // might be redudant
//   timestamp: Timestamp;
// }
// this is how it's sent to the caller
export interface BadgeNotifyInfo {
  messageID: string;
  messageType: string;  // this will be displayed as a part of the menu text
  // referenceID: string;  
  displayDate: string;
  rawDateForSort: Timestamp;
  userID: string;
  what: string;
  who: string;    // FB adds user names together (him, her, etc)
  pictureURL: string;
  blurb: string;
  scrollTag: string;   
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeDbService {
  allMessages: ChatMessage[];
  allUserMessages: UsersMsg[];
  public allMessagesReadyState = new BehaviorSubject<number>(0);
  // public userMessagesReadyState = new BehaviorSubject<number>(0);
  public friendsRequestState = new BehaviorSubject<number>(0);
  public friendsReadyState = new BehaviorSubject<number>(0);
  public commentReadState = new BehaviorSubject<number>(0); // 10-26
  public dashBoardState = new BehaviorSubject<number>(0);
  public badgeReadyState = new BehaviorSubject<number>(0);  // 12-10
  public dashboardReadyState = new BehaviorSubject<number>(0);  // 12-11
  // public badgeOneShotState = new BehaviorSubject<number>(0);  // 1-4-21
  userDataList: UserData[];
  myMessages: DisplayMessage[];
  private idsToHarvest: HarvestID[];  // for tarot throws
  user: firebase.User;
  loggedIn: boolean;
  userID: string;
  myFriendInfo: FriendRequest[];
  allFriendRequests: FriendsRequestData[];
  allFriendsList: FriendsRequestData[];
  myFriends: UserData[];
  friendRequests: UserData[];   // normally this is empty
  requestsIMade: UserData[];
  usersReady: boolean;
  userAuthenticated: boolean;
  didTheWork: boolean;  // seem to have problems with mutltiple entries
  messageID: string;
  scrollTag: string;  // 11-16
  bSortedMessages: boolean;
  allComments: UserComment[];
  commentsOnUserPosts: CommentsOnUserPosts[]; // 11-6-20
  commentBadgeInfo: CommentBadgeInfo[];
  dashFolks: DashboardUserInfo[];
  classicFolk: DashboardUserInfo[]; // 12-20
  throwCounts: TarotThrowCount[];
  allThrowCounts: TarotThrowCount;
  scrollingTags: ScrollToComment[];
  public allReadings: TarotCardsInThrow[];
  // myBadgeNotifications: BadgeNotifyInfo[];
  // fetchForeign: boolean;

  constructor(
    public db: AngularFirestore,
    private firestoreService: FirestoreService,
    public datepipe: DatePipe,
    private authService: AuthenticationService,
    private tarotCardService: TarotCardsService
  ) {
    this.allThrowCounts = {
      userID: '',
      userEmail: '',
      skippedUsers: 0,
      socialUser: false,
      numSingleCard: 0,
      numTotalThrows: 0,
      numThreeCard: 0,
      numMemoryGame: 0,
      numPyramid: 0,
      rayOne: 0,
      rayTwo: 0,
      rayThree: 0,
      rayFour: 0,
      rayFive: 0,
      raySix: 0,
      raySeven: 0,
      rayEight: 0,
      rayNine: 0,
      cnt0720: 0,
      cnt0820: 0,
      cnt0920: 0,
      cnt1020: 0,
      cnt1120: 0,
      cnt1220: 0,
      cnt0121: 0,
      cnt0221: 0,
      cnt0321: 0,
      cnt0421: 0,
      cnt0521: 0,
      cnt0621: 0,
      // 4/20/22 new
      cnt0721: 0,
      cnt0821: 0,
      cnt0921: 0,
      cnt1021: 0,
      cnt1121: 0,
      cnt1221: 0,
      cnt0122: 0,
      cnt0222: 0,
      cnt0322: 0,
      cnt0422: 0,
      cnt0522: 0,
      cnt0622: 0,
      cnt0722: 0,
      cnt0822: 0,
      cnt0922: 0,
      cnt1022: 0,
      cnt1122: 0,
      cnt1222: 0,
      cnt0123: 0,
      cnt0223: 0,
      cnt0323: 0,
      cnt0423: 0,
      cnt0523: 0,
      cnt0623: 0,
      cnt0723: 0,
      cnt0823: 0,
      cnt0923: 0,
      cnt1023: 0,
      cnt1123: 0,
      cnt1223: 0,
    };
    // this.myBadgeNotifications = [];
    this.scrollingTags = [];
    this.throwCounts = [];
    this.dashFolks = [];
    this.classicFolk = [];
    this.commentBadgeInfo = [];
    this.commentsOnUserPosts = [];
    this.friendRequests = [];   // normally this is empty
    this.requestsIMade = [];
    // this.fetchForeign = true;
    this.userDataList = [];
    this.allComments = [];
    this.messageID = '';
    this.didTheWork = false;
    this.usersReady = false;  // will need this before we can start
    this.userAuthenticated = false;
    this.myFriends = [];
    this.allFriendsList = [];
    this.userID = '';
    this.allMessages = [];
    // this.allUserMessages = [];
    this.myMessages = [];
    this.idsToHarvest = [];
    this.myFriendInfo = [];
    this.allFriendRequests = [];
    this.loggedIn = false;
    this.user = this.authService.getCurrentFBUser();  // back door
    this.zapMessages(); // trying to get good updates?
    // console.log('realtime - user', this.user);
    this.loadAll();
    this.bSortedMessages = false;

    // I will try to add a 'load' method which will start the ball rolling
    // getting messages depends on first getting the friends list - which I'll know by subscribing to an observable
  }

  zapMessages() {
    // not sure if this will help - but it's a full reset
    const lenC = this.commentsOnUserPosts.length;
    for (let i = 0; i < lenC; i++) {
      this.commentsOnUserPosts.pop();
    }
    this.commentsOnUserPosts = [];
    const lenA = this.allComments.length;
    for (let j = 0; j < lenA; j++) {
      this.allComments.pop();
    }
    this.allComments = [];
    try {
      const lenM = this.myMessages.length;
      // console.log('zap my messages', lenM);
      for (let k = 0; k < lenM; k++) {
        // console.log('zapping', k, lenM);
        if (this.myMessages[k] !== undefined &&  this.myMessages[k].postComments !== undefined && this.myMessages[k].postComments !== null) {
          const lenP = this.myMessages[k].postComments.length;
          // console.log('zap post', lenP);
          for (let m = 0; m < lenP; m++) {
            this.myMessages[k].postComments.pop();
            // console.log('zap post - pop');
          }
          this.myMessages.pop();
        }
      }
    } catch (ex) {
      console.log('zap error', ex);
    }

    this.myMessages = [];
  }

  async stopWatchChat() {
    // console.log('realtime stop watch');
    const itemListRef = firebase.database().ref(`chatMessage`);
    itemListRef
    .off('value', snapshot => {
      // console.log('chatMessage data stop: ', snapshot.val());
    });

    const userListRef = firebase.database().ref(`userChat`);
    userListRef
    .off('value', snapshot => {
      // console.log('userChat data stop: ', snapshot.val());
    });

    const friendListRef = firebase.database().ref(`friends`);
    friendListRef
    .off('value', snapshot => {
      // console.log('friends data stop: ', snapshot.val());
    });

    const friendsListRef = firebase.database().ref(`friendRequests`);
    friendListRef
    .off('value', snapshot => {
      // console.log('friendRequests data stop: ', snapshot.val());
    });

    const postCommentRef = firebase.database().ref('userComments');
    postCommentRef
    .off('value', snapshot => {
      // console.log('userComments data stop: ', snapshot.val());
    });
  }

  resetCache() {
    console.log('resetCache')
    // call this after login - to forget everything
    this.stopWatchChat(); // seems ok
    this.zapMessages();
    // console.log('realtime - reset cache');
    this.messageID = '';
    this.didTheWork = false;
    this.usersReady = false;  // will need this before we can start
    this.userAuthenticated = false;

    const lenC = this.allComments.length;
    for (let ic = 0; ic < lenC; ic++) {
      this.allComments.pop();
    }
    const len = this.myFriends.length;
    for (let i = 0; i < len; i++) {
      this.myFriends.pop();
    }
    this.myFriends = [];

    const lenAllFriends = this.allFriendsList.length;
    for (let i2 = 0; i2 < lenAllFriends; i2++) {
      this.allFriendsList.pop();
    }
    this.allFriendsList = [];
    this.userID = '';

    const lenAllMess = this.allMessages.length;
    for (let iam = 0; iam < lenAllMess; iam++) {
      this.allMessages.pop();
    }
    this.allMessages = [];

    const lenB = this.commentBadgeInfo.length;
    for (let iB = 0; iB < lenB; iB++) {
      this.commentBadgeInfo.pop();
    }
    this.commentBadgeInfo = [];

    // const lenAllUser = this.allUserMessages.length;
    // for (let iau = 0; iau < lenAllUser; iau++) {
    //   this.allUserMessages.pop();
    // }
    // this.allUserMessages = [];

    const lenMyMess = this.myMessages.length;
    for (let imm = 0; imm < lenMyMess; imm++) {
      this.myMessages.pop();
    }
    this.myMessages = [];
    this.bSortedMessages = false;
    const lenId = this.idsToHarvest.length;
    for (let ili = 0; ili < lenId; ili++) {
      this.idsToHarvest.pop();
    }
    this.idsToHarvest = [];

    const lenMyFI = this.myFriendInfo.length;
    for (let ilmf = 0; ilmf < lenMyFI; ilmf++) {
      this.myFriendInfo.pop();
    }
    this.myFriendInfo = [];
    const lenafr = this.allFriendRequests.length;
    for (let ilafr = 0; ilafr < lenafr; ilafr++) {
      this.allFriendRequests.pop();
    }
    this.allFriendRequests = [];
    this.loggedIn = false;
    this.user = this.authService.getCurrentFBUser();  // back door
    // console.log('realtime - user', this.user);
    this.loadAll();
  }

  // rather than have multiple loads - this should just bring the service into activity - and do nothing else
  dummyLoadAll() {
    // console.log('dummy real time call');
    this.loadAll(); // 1/11/21
  }

  loadAll() {
   

    // console.log('realtime - load all');
    // this.firestoreService.getUsers(); // this will trigger filling out user data
    this.firestoreService.usersReadyState.subscribe(usersRead => {
      this.usersReady = true;
      this.userDataList = this.firestoreService.getListOfUsers();
      if (this.usersReady && this.userAuthenticated && !this.didTheWork && this.userDataList.length > 0) {
        this.startWork(); // have to make sure all systems are read
      }
    });

     // yikes - since we have to know the user - I guess I'll hold off until that's established
     this.watchFriends();  // this kicks things off
     // this.watchFriendRequests();  // another thread - independent of friends list

    this.authService.authenticationState.subscribe(state => {
      // console.log('main app Auth changed:', state);
      this.loggedIn = state;
      if (this.loggedIn === true) {
        this.user = this.authService.getCurrentFBUser();  // back door
        this.userAuthenticated = true;
        this.userDataList = this.firestoreService.getListOfUsers();
        // console.log('real time - load all called -waited until now to start', this.user.uid);
        if (this.usersReady && this.userAuthenticated && !this.didTheWork && this.userDataList.length > 0) {
          this.startWork(); // have to make sure all systems are read
        }
      }
    });
  }

  async startWork() {
    this.didTheWork = true;
    console.log('real time - start work');
    // test if users are ready
    const me = this.firestoreService.GetUserUsingID(this.user.uid);
    // console.log('real time me', me);
    // this.watchFriends();  // this kicks things off
    this.watchFriendRequests();  // another thread - independent of friends list
    // this.watchUserMessages();
// now wait until friends are obtained to do more
    this.friendsReadyState.subscribe(state2 => {
    // console.log('real time - friends subscribe', state2);
    if (state2 > 0) {
      // console.log('will move forward now', this.allFriendsList.length, this.allFriendsList);
      if (this.user != null && this.user.uid != null) {
        this.watchForUserMessages(this.user.uid);
        // not sure how messages will append - but let's try :)
        this.getMyFriends(this.user.uid); // now should have a list of my friends
        // console.log('real time friends', this.myFriends.length, this.myFriends);
        this.myFriends.forEach(frnd => {
          // console.log('about to harvest friends messages', frnd.nickName, frnßd.userID);
          this.watchForUserMessages(frnd.userID);
        });
      }
    }
    });
    // 10-27 code to add comments to posts
    this.allMessagesReadyState.subscribe(stateM => {
      // console.log('messages ready', stateM, this.myMessages.length);
      if (stateM > 0) {
        // ? hope this doesn't add hits
        this.tryToRefreshMessages(this.user.uid); // 1-28-21
        this.collectAllCommentsForPosts();  // harvest comments for all my messages
      }
    });
  }

  async writeRTDB(chatString: string, userId: string, sharingData: string) {
    // this.fbUser = await this.authService.getFirebaseUser()
    const ChatId =  this.db.createId();
    const chat: ChatMessage = {
      messageID: ChatId,
      sharing: sharingData,
      timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
      typeMessage: 'chat',
      referenceID: ChatId,
      userID: userId,
      textMessage: chatString,
      tarotThrowID: '',
      pictureURL: '',
      // referenceID: ChatId
    };

    firebase.database().ref('chatMessage').child(ChatId).set( chat);

    // ok - user has made a post - now notify all of his friends
    if (chat.sharing === 'friends') {
      // console.log('notify friends of this post', chat);
      // this.addNotifyForFriends('post', chat);
    }
    

    // firebase.database().ref('userChat').child(userId).push({
    //   messageID: ChatId
    //   // timeStamp: Date.now()
    // });
    // console.log('item', chatString, userId);
  }

  

  // I guess I have to let the caller weave all this together - I dont know how to synchronize two unrelated fetches
  getAllMessages(): ChatMessage[] {
    // console.log('get all messages', this.allMessages);
    return this.allMessages;
  }

  // getAllUserMessages(): UsersMsg[] {
  //   return this.allUserMessages;
  // }

  getAllFriendRequests(): FriendsRequestData[] {
    // console.log('returning FR', this.allFriendRequests.length, this.allFriendRequests);
    return this.allFriendRequests;
  }

  // 10-10 going to do a major refact of this
  // rather than get all messages, which is what I do - I need to iterate
  // this will be very difficult, since I need certain lists to be populated before I can get messages
  // I have to get the friends list first - and refuse to do the rest without a working friends list.
  // I coded this as one method - but I need to break it up
  async watchFriends() {
    const len = this.allFriendsList.length;
    for (let i = 0; i < len; i++) {
      this.allFriendsList.pop();
    }
    console.log('DB-read:***** friends');
    // new - 10-7-20 get list of friends
    const friendListRef = firebase.database().ref(`friends`);
    friendListRef
    .on('value', snapshot => {
     //  console.log('Friend data:', snapshot.val(), snapshot.numChildren(), snapshot.key, snapshot.val);
      snapshot.forEach(frnd => {
        const aFriend = this.firestoreService.GetUserUsingID(frnd.key);
        if (aFriend != null) {
          // console.log('friend', frnd.key, aFriend, aFriend.email);
        }
        if (frnd != null) {
          frnd.forEach(item => {
            const itmData = item.val();
            const fd: FriendsRequestData = {
              userID: itmData.userID,
              userEmail: itmData.userEmail,
              requestingUserID: frnd.key,
              requestingUserEmail: aFriend == null ? '?' : aFriend.email,
              referenceID: itmData.referenceID
            };
            const index2 = this.allFriendsList.findIndex(i => i.userID === fd.userID);
            // console.log('friend data', index2, itmData.userID, fd);
            // if (index2 < 0) {
            this.allFriendsList.push(fd);
            // }
          });
        }
      });
  //     console.log('friends list complete - was...', this.allFriendsList, len);
      this.friendsReadyState.next(this.allFriendsList.length);
    });
  }

  watchFriendRequests() {
    console.log('DB-read:***** friendRequests');
    const friendsListRef = firebase.database().ref(`friendRequests`);
    friendsListRef
    .on('value', snapshot => {
      // console.log('friends data:', snapshot.val(), snapshot.numChildren(), snapshot.key, snapshot.val);
      snapshot.forEach(frnd => {
        const fdata = frnd.val();
        // console.log('friend entry', frnd.key );
        // ? go down a level
        if (frnd != null) {
          frnd.forEach(fr => {
            const aFriend = this.firestoreService.GetUserUsingID(frnd.key);
            // console.log('friend item', fr.val(), aFriend, aFriend.email);
            // const fdat = fr.val();
            const fd: FriendsRequestData = {
              userID: fr.val().userID,
              userEmail: fr.val().userEmail,
              requestingUserID: frnd.key,
              requestingUserEmail: aFriend == null ? '?' : aFriend.email,  // '?',
              referenceID: fr.val().referenceID    // ? hope this is it
            };
            // const index2 = this.allFriendRequests.findIndex(i => i.u === this.allFriendRequests.rawDateForSort);
            // if (index2 < 0) {
            this.allFriendRequests.push(fd);
            // console.log('adding friend request', fd, this.allFriendRequests);
            // }
          });
        }
      });
      this.friendsRequestState.next(this.allFriendRequests.length);
      // console.log('bump friend subscription', this.allFriendRequests.length, this.allFriendRequests);
    });
  }

  // just a way to get friendly people
  getAllFriends() {
    return this.allFriendsList;
  }

  // watchUserMessages() {
  //   const userListRef = firebase.database().ref(`userChat`);   // .orderByChild('timeStamp').limitToLast(100);
  //   userListRef
  //   .on('value', snapshot => {
  //     // console.log('User data: ', snapshot.val(), snapshot.numChildren(), snapshot.key, snapshot.val);

  //     snapshot.forEach(usr => {
  //       const data = usr.val();
  //       // console.log('user entry', usr.key);
  //       // go down one level
  //       if (usr != null) {
  //         usr.forEach(item => {
  //           const itemData = item.val();
  //           // console.log(' item data', itemData);
  //           const aUsr: UsersMsg = {
  //             messageID: itemData.messageID,
  //             // timeStamp: itemData.timeStamp,
  //             userID: usr.key
  //           };
  //           // console.log('adding user item', aUsr);
  //           this.allUserMessages.push(aUsr);
  //         });
  //       }
  //       // console.log('add user msg - bumped subscription', this.allUserMessages.length, this.allUserMessages);
  //       this.userMessagesReadyState.next(this.allUserMessages.length);
  //     });
  //   });
  // }

  async watchForUserMessages(userID: string) {
    // console.log('watch for user messages', userID);
    console.log('DB-read:***** chatMessage');
    let shareThis = true;
    const itemListRef = firebase.database()
      .ref('chatMessage').orderByChild('userID').equalTo(userID); // .limitToLast(100);
    itemListRef
    .limitToLast(33)  // some limit - no idea what # to use
    .on('value', snapshot => {
      // console.log('user message data: ', snapshot.val(), snapshot.key, snapshot.numChildren());
      snapshot.forEach(chat => {
        const data = chat.val();
        const aMsg: ChatMessage = {
          messageID: chat.key,
          sharing: data.sharing,
          timeStamp: data.timeStamp,
          textMessage: data.textMessage,
          typeMessage: data.typeMessage,
          referenceID: snapshot.key,
          userID: data.userID,
          tarotThrowID: data.tarotThrowID,
          pictureURL: data.pictureURL,
          // referenceID: chat.key
        };
        // console.log('user adding msg', userID, aMsg.sharing, aMsg);
        // 10-12 -- here's where we exclude if shared with just one user
        if (aMsg.sharing !== 'friends') {
          // console.log('private message - should I see it', this.user.uid);
          if (this.user.uid !== aMsg.sharing) {
            shareThis = false;
            // console.log('private message - skipping', aMsg.sharing, this.user.uid);
          }
        } else { shareThis = true; }
        // lets avoid duplicates
        const index2 = this.allMessages.findIndex(i => i.messageID === aMsg.messageID);
        if (index2 < 0 && shareThis) {
          this.allMessages.push(aMsg);
          // let's work on harvesting throws that aren't in our own list
          if ( aMsg.typeMessage === 'reading') {    // data.userID !== this.user.uid &&
            // we won't have this reading
            const harvestThis = {
              tarotThrowID: aMsg.tarotThrowID,
              userID: aMsg.userID
            };
            this.idsToHarvest.push(harvestThis);
            // console.log('need to fetch this reading', aMsg.tarotThrowID, harvestThis, this.idsToHarvest);
          }
        }
      //   else {
      //     console.log('message not for me');
      // }
        // console.log('message data - bumped subscription', aMsg, this.allMessages);
      });
      // const reversed =
      this.allMessages.reverse();  // this reverses the array - so we now have a reverse sort
      // console.log('going to reverse the order now', this.allMessages);
      this.allMessagesReadyState.next(this.allMessages.length);
    //  console.log('bump message subscription', this.allMessages.length, this.allMessages);
      // this.getSocialTarotReadings();  // probably will need to hit the database - unless all the readings are by our users
    });
    // this.allMessagesReadyState.next(this.allMessages.length); // 1-17-21 moved this from inside loop
  }

  async watchChat() {
    // need to clear previous messages
    const len = this.allMessages.length;
    for (let i = 0; i < len; i++) {
      this.allMessages.pop();
    }
    const len2 = this.idsToHarvest.length;
    for (let i = 0; i < len2; i++ ) {
      this.idsToHarvest.pop();
    }
    return; // for now - disable all of this.
  }

  getMyFriends(userID: string): UserData[] {
    // 10-12 -- interesting - the following code broke the friends list - would seem it erased the callers list?
    // const len = this.myFriends.length;
    // for (let i = 0; i < len; i++) {
    //   this.myFriends.pop();
    //   // console.log('pop friend');
    // }
  //  console.log('getMyFriends', userID, this.myFriends.length, this.allFriendsList.length, this.allFriendsList);
    // this.myFriends = [];
    this.allFriendsList.forEach(fl => {
      // list is mutual - so could look at either side
      // console.log('friend match?', fl.requestingUserID, userID, fl.requestingUserID === userID);
      if (fl.requestingUserID === userID) {
        const aFriend = this.firestoreService.GetUserUsingID(fl.userID);
  //      console.log('a friend', aFriend);
        if (aFriend != null) {
   //         console.log('friend added', aFriend.nickName, fl.requestingUserID, userID); 
          //  console.log('friend to my list', aFriend, fl); 
        // ?? this list gets too large?  let's test to avoid duplication
           const index2 = this.myFriends.findIndex(i => i.userID === aFriend.userID);
          //  console.log('making friends', index2, aFriend, this.myFriends.length, this.myFriends);
           if (index2 < 0) {
            this.myFriends.push(aFriend);
     //        console.log('found a friend', aFriend);
          }
        }
      }
    });
  //  console.log('got my friends', this.myFriends.length, this.myFriends, userID, this.allFriendsList.length);
    return this.myFriends;
  }

  crunchFriendRequests(myuserID: string) {
    // console.log('ready to crunch FR', myuserID, this.allFriendRequests.length);
    this.allFriendRequests.forEach(req => {
      // console.log('scanning friend requests', req);
      if (myuserID === req.userID) {
        // someone wants to be our friend
        const whichUser = this.firestoreService.GetUserUsingID(req.requestingUserID);
        if (whichUser != null) {
          const index2 = this.friendRequests.findIndex(i => i.userID === whichUser.userID);
          if (index2 < 0) {
            // console.log('requested by', whichUser);
            this.friendRequests.push(whichUser);
          }
        }
      }
    });
    // console.log('total requests', this.friendRequests);
    // while we're here - let's make a list of requests we've made - so user could cancel
    this.requestsIMade.splice(0, this.requestsIMade.length);
    this.allFriendRequests.forEach(req => {
      // console.log('scanning friend requests', req, myuserID);
      if (myuserID === req.requestingUserID) {
        // we've asked someone to be our friend
        // console.log('requests fr', req, myuserID);
        const whichUser = this.firestoreService.GetUserUsingID(req.userID);
        if (whichUser != null) {
          const index2 = this.friendRequests.findIndex(i => i.userID === myuserID);
          if (index2 < 0) {
            // console.log('requested ', whichUser);
            this.requestsIMade.push(whichUser);
          }
        }
      }
    });
  }

  getRequestsIMade()
  {
    return this.requestsIMade;
  }

  getMyFR() {
    return this.getMyFriendRequests(this.user.uid);
  }
  getMyFriendRequests(userID: string) {
    this.crunchFriendRequests(userID);
     console.log('my friend requests', userID, this.friendRequests.length, this.friendRequests);
    return this.friendRequests;
  }



  getMyMessages(): DisplayMessage[] {
    if (!this.bSortedMessages) {
      this.SortMessagesForDisplay();
      this.bSortedMessages = true;
    }
    // console.log('returning messages - realtime', this.myMessages.length);
    return this.myMessages;
  }

  SortMessagesForDisplay() {
    // console.log('here to sort messages for display', this.myMessages.length); // , this.myMessages

    if (this.myMessages.length > 0) {
      this.myMessages.sort( (a, b): number => {
        // console.log('sorting', a.displayDate, b.displayDate, a.messageText, b.messageText);    
        if (a.rawDateForSort > b.rawDateForSort) {
          // console.log('sorting:greater', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return -1;
        }
        else if (a.rawDateForSort === b.rawDateForSort) {
          // console.log('sorting:equal', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return 0;
        }
        else {
          // console.log('sorting:lesser', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return 1;
        }
      });
      // now have to replace the messages with sorted messages
      // console.log('sort complete', this.myMessages);
    }
  }


  // rather than read the db again - this routine is called after all data is ready
  // just put things back together
  tryToRefreshMessages(userID: string) {
    console.log('realtime try to refresh');
    if (this.idsToHarvest.length > 0) {
      this.firestoreService.crunchAllReadings(userID);  // don't try until we're ready
    }
    // this.firestoreService.crunchAllReadings(userID);  // probably will need to hit the database - unless all the readings are by our users
    this.userDataList = [];
    this.userDataList = this.firestoreService.getListOfUsers();
    // console.log('real time tryToRefreshMessages', userID, this.allMessages, this.allUserMessages, this.userDataList);
    // hopefully everything will always work here :)
    if (this.allMessages.length > 0  ) {    // && this.userDataList.length > 0    && this.allUserMessages.length > 0
      console.log('refresh messages', this.allMessages.length)
      // ready to go
    } else {
      const msg = 'yikes - not all data here:'
        + this.allMessages.length.toString() + '--'
        // + this.allUserMessages.length.toString() + '--'
        + this.userDataList.length.toString();
      // console.log(msg);
      // window.alert(msg );
    }
    this.scrollTag = '';
    this.bSortedMessages = false;
    this.myMessages = [];
    let scrollTagCount = 0;
    // have to weave things together
    // assume messages are already ordered
    this.allMessages.forEach(msg => {
      // const time = (new Date(msg.timeStamp)).toDateString();
      let dispDate =  this.datepipe.transform(msg.timeStamp, 'M/d/yy, h:mm a');
      dispDate = this.makeCreativeDate(msg.timeStamp);

      const thisText = msg.textMessage;
      const thisUser = this.firestoreService.GetUserUsingID(msg.userID);
      const usrName = thisUser == null ? 'unknown' : thisUser.nickName;
      // const userName = 'abc';  // thisUser.nickName == null ? thisUser.userID : thisUser.nickName;
      let profilePic = thisUser == null ?  '../assets/img/persons.png' : thisUser.profilePicURL; // thisUser.profilePicURL;
      if (profilePic === undefined ||  profilePic.length === 0 ) {
        profilePic = '../assets/img/persons.png';
      }
      // console.log('crunch msg', msg, thisDate, thisText, usrName, profilePic, thisUser);
      const thisMsg: DisplayMessage = {
        userName: usrName,     // thisUser.nickName,
        userProfileURL: profilePic,
        displayDate: dispDate, // thisDate,
        rawDateForSort: msg.timeStamp,
        messageText: msg.textMessage,
        referenceID: msg.referenceID,
        messageID: msg.messageID,
        messageType: msg.typeMessage,
        tarotThrowID: msg.tarotThrowID,
        pictureURL: msg.pictureURL,
        ownerID: msg.userID,  // 10-23
        iOwnThis: msg.userID === this.user.uid, // 12-13
        postComments: [],
        scrollTag: 'post0' + scrollTagCount.toString()
      };
      // console.log('Who owns? 1', thisMsg.iOwnThis, thisMsg.scrollTag, thisMsg.messageText,  msg.userID, this.userID, this.user.uid);
      scrollTagCount++;
      const index2 = this.myMessages.findIndex(i => i.messageID === thisMsg.messageID);
      if (index2 < 0) {
        // 1/17 - I allowed some empty messages - let's filter them out
        const msgTx = thisMsg.messageText.trim();
        const bOK = msgTx.length > 0 || thisMsg.messageType != 'chat';
        if (bOK) {
          this.myMessages.push(thisMsg);
        }
        // else { console.log('skipped empty msg', thisMsg.userName);}
      }
      // console.log('crunched', thisMsg, this.myMessages);
    });
    this.stitchCommentsToPosts(); // I was losing this
  }

  // porting code from social page to here - could be tricky with circular dependancies - we'll see
  // call this once users, and message data all present
  crunchMessages(userID: string) {    // fetchForeign: boolean
    this.userID = userID;
    // this.fetchForeign = fetchForeign;
    // console.log('real time user id', this.userID);
    this.getSocialTarotReadings();  // probably will need to hit the database - unless all the readings are by our users

    this.userDataList = this.firestoreService.getListOfUsers();
    // hopefully everything will always work here :)
    if (this.allMessages.length > 0 && this.userDataList.length > 0) {  // && this.allUserMessages.length > 0
      // ready to go
    } else {
      const msg = 'yikes - not all data here:'
        + this.allMessages.length.toString() + '--'
        // + this.allUserMessages.length.toString() + '--'
        + this.userDataList.length.toString();
      // console.log(msg);
      // window.alert(msg );
    }
    // console.log('ready to crunch', this.allMessages, this.userDataList);  // this.allUserMessages,
    const cnt = this.myMessages.length;
    // console.log('clear previous', cnt, this.myMessages);
    for (let i = 0; i < cnt; i++ ) {
      // console.log('pop');
      this.myMessages.pop();
    }
    this.bSortedMessages = false;
    this.myMessages = [];
    let scrollTagCount = 0;
    // have to weave things together
    // assume messages are already ordered
    this.allMessages.forEach(msg => {
      // const time = (new Date(msg.timeStamp)).toDateString();
      let displayDate =  this.datepipe.transform(msg.timeStamp, 'M/d/yy, h:mm a');
      displayDate = this.makeCreativeDate(msg.timeStamp);

      const thisDate = displayDate; // msg.timeStamp.toDate();
      const thisText = msg.textMessage;
      const thisUser = this.firestoreService.GetUserUsingID(msg.userID);
      const usrName = thisUser == null ? 'unknown' : thisUser.nickName;
      // const userName = 'abc';  // thisUser.nickName == null ? thisUser.userID : thisUser.nickName;
      let profilePic = thisUser == null ?  '../assets/img/persons.png' : thisUser.profilePicURL; // thisUser.profilePicURL;
      if (profilePic === undefined ||  profilePic.length === 0 ) {
        profilePic = '../assets/img/persons.png';
      }
      // console.log('crunch msg', msg, thisDate, thisText, usrName, profilePic, thisUser);
      const thisMsg = {
        userName: usrName,     // thisUser.nickName,
        userProfileURL: profilePic,
        displayDate: thisDate,
        rawDateForSort: msg.timeStamp,
        messageText: msg.textMessage,
        referenceID: msg.referenceID,
        messageID: msg.messageID,
        messageType: msg.typeMessage,
        tarotThrowID: msg.tarotThrowID,
        pictureURL: msg.pictureURL,
        ownerID: msg.userID,  // 10-23
        iOwnThis: msg.userID === this.user.uid, // 12-13
        postComments: [],
        scrollTag: 'post0' + scrollTagCount.toString()
      };
      // console.log('Who owns? 2', thisMsg.iOwnThis, thisMsg.scrollTag, thisMsg.messageText, msg.userID, this.userID, this.user.uid);
      scrollTagCount++;
       // 1/17 - I allowed some empty messages - let's filter them out
       const msgTx = thisMsg.messageText.trim();
       const bOK = msgTx.length > 0 || thisMsg.messageType != 'chat';
       if (bOK) {
        this.myMessages.push(thisMsg);
       } 
      //  else { console.log('skipped empty msg', thisMsg.userName);}
      
      // console.log('crunched', thisMsg, this.myMessages.length);
    });
    this.collectCommentsForUser(userID);  // this will collect comments for our user - so badge can be shown
  }

  // this is how other components get aligned
  setMessageID(messID: string) {
    this.messageID = messID;
  }
  getMessageID() {
    return this.messageID;
  }

  // setScrollTag(scrllTag: string) {
  //   this.scrollTag = scrllTag;    // so component can scroll too
  // }

  getScrollTag(messID: string) {
    // return this.scrollTag;
    // loop through the messages to find the scroll ID
    let scrollTag = '';
    this.myMessages.forEach(msg => {
      if (msg.messageID === messID) {
        scrollTag = msg.scrollTag;
      }
    });
    // console.log('got scroll tag', messID, scrollTag);
    return scrollTag;
  }

  getMessageUsingID(messID: string): DisplayMessage {
    let retMsg = null;
    if (messID.length > 0) {
      this.myMessages.forEach(msg => {
        // console.log('get msg', msg.ownerID, msg.messageText);
        if (msg.messageID === messID) {
          retMsg = msg;
        }
      });
      return retMsg;
    }
  }

  // 10-1 new command - share a reading
  // shareReading(userId: string, athrow: TarotCardsInThrow) {
    // console.log('real time - share reading', athrow);
  shareReading(userId: string, throwID: string, comment: string, shareData: string) {
    // get some data setup for us
    // this.tarotCardService.getCommentControl(editPref);
    // console.log('share reading', userId, throwID, comment);
    const ChatId =  this.db.createId();
    // const msg = 'What do you think of this reading?' + athrow.subject;
    const chat: ChatMessage = {
      messageID: ChatId,
      sharing: shareData,
      timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
      typeMessage: 'reading',
      referenceID: ChatId,
      userID: userId,
      textMessage: comment,   // msg,
      tarotThrowID: throwID,    // athrow.throwID,
      pictureURL: '',
      // referenceID: ChatId
    };

    firebase.database().ref('chatMessage').child(ChatId).set( chat);

    firebase.database().ref('userChat').child(userId).push({
      messageID: ChatId
      // timeStamp: Date.now()
    });
    // console.log('reading shared', throwID, userId);
  }

  getSocialTarotReadings() {
    this.user = this.authService.getCurrentFBUser();  // back door
    this.allReadings = this.firestoreService.getAllReadings();
    //  console.log('getSocialTarotReadings', this.idsToHarvest.length, this.allReadings.length);
    // console.log('realtime - user', this.user);
    const userID = this.user === null ? this.userID : this.user.uid;
   
    if (this.idsToHarvest.length > 0 && this.allReadings.length > 0) {
       console.log('getting social - hope readings are here by now', this.idsToHarvest.length, this.allReadings.length)
      // this.idsToHarvest
      this.firestoreService.crunchSocialReadings(userID, this.idsToHarvest);  // this.fetchForeign
    }
  
  }

  async friendRequest(myUserID: string, usrID: string, usrEmail) {
    if (this.checkAlreadyFriends(myUserID, usrID)) {
      console.log('already friends - skipping out');
      return;
    }
    const refID = this.db.createId();
    const fr: FriendRequest = {
      userID: usrID,
      userEmail: usrEmail,
      timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
      referenceID: refID
    };
    firebase.database().ref('friendRequests').child(myUserID).child(refID).set(fr);
    // console.log('friend request', fr);
  }

  async cancelFriendRequest(myUserID: string, usrID: string, frReferenceID) {
    // just delete the friend request - that is all
    let previousNumRequests = this.allFriendRequests.length;  // I think it must be more than 0
    if (previousNumRequests === 0) {
      previousNumRequests = 1;  // so I can dec it
    }
    // console.log('cancel request', myUserID, usrID, frReferenceID);
    firebase.database().ref('friendRequests').child(myUserID).child(frReferenceID).remove();  // complicated!

    this.friendsRequestState.next(previousNumRequests - 1); // trigger fresh gets
  }


  async rejectFriendRequest(myUserID: string, usrID: string, frReferenceID) {
    // just delete the friend request - that is all
    let previousNumRequests = this.allFriendRequests.length;  // I think it must be more than 0
    if (previousNumRequests === 0) {
      previousNumRequests = 1;  // so I can dec it
    }
    firebase.database().ref('friendRequests').child(frReferenceID).remove();  // complicated!

    this.friendsRequestState.next(previousNumRequests - 1); // trigger fresh gets
  }

  checkAlreadyFriends(myUserID: string, usrID) {
    let alreadyF = false;

    this.myFriends.forEach(fnd => {
      // console.log('check if friend', myUserID, usrID, fnd, fnd.userID);
      if (fnd.userID === usrID) {
        alreadyF = true;
        // console.log('already a friend', myUserID, usrID);
      }
    });
    return alreadyF;
  }

  async acceptFriendRequest(myUserID: string, myEmail, usrID: string, frReferenceID, frEmail) {
    // we need to write the friends list in two places
    // I'm friends withhim, and he's friends with me
    // then we need to delete the friend request
    // this.friendsRequestState.next(this.allFriendRequests.length);
    // 10-27 - let's first check to make sure we're not already friends
    // it was a serious bug to make friends twice
    if (this.checkAlreadyFriends(myUserID, usrID)) {
      // console.log('already friends - skipping out');
      return;
    }
    // console.log('accept friend request', myUserID, myEmail, usrID, frReferenceID, frEmail);
    let previousNumRequests = this.allFriendRequests.length;  // I think it must be more than 0
    if (previousNumRequests === 0) {
      previousNumRequests = 1;  // so I can dec it
    }
    const refID1 = this.db.createId();
    // first add him to my list
    const fd: FriendsData = {
      userID: usrID,
      userEmail: frEmail,
      timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
      referenceID: refID1
    };
    // firebase.database().ref('friends').child(myUserID).push(fd);
    firebase.database().ref(`friends`).child(myUserID).child(refID1).set(fd);
    // next add me to his list
    const refID2 = this.db.createId();
    const fd2: FriendsData = {
      userID: myUserID,
      userEmail: myEmail,
      timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
      referenceID: refID2
    };
    // firebase.database().ref('friends').child(usrID).push(fd2);
    firebase.database().ref('friends').child(usrID).child(refID2).set(fd2);
    // console.log('made friends', fd, fd2);
    // now delete the request
    firebase.database().ref('friendRequests').child(frReferenceID).remove();  // complicated!

    this.friendsRequestState.next(previousNumRequests - 1); // trigger fresh gets
  }


  unFriendUser(myUserID: string, usrID: string) {
    // we should verify thatwe're friends, I suppose
    // console.log('unfriend - me - them', myUserID, usrID);

    // so we have to undo everything that the friends code did:
    // remove the friend from both sides
    // nothing to do with friend request though
    // I put the reference ID in the db though - which should make this easy.
    let frdMe: FriendsRequestData = null;
    let frdThem: FriendsRequestData = null;
    this.allFriendsList.forEach(entry => {
      if (entry.requestingUserID === myUserID && entry.userID === usrID) {
        frdMe = entry;  // now we found it
      }
      if (entry.userID === myUserID && entry.requestingUserID === usrID) {
        // have the other guy
        frdThem = entry;
      }
    });
    if (frdMe != null && frdThem != null) {
      // we found what we need
      // console.log('ready to unfriend', frdMe, frdThem);
      firebase.database().ref('friends').child(frdMe.requestingUserID).child(frdMe.referenceID).remove();
      firebase.database().ref('friends').child(frdThem.requestingUserID).child(frdThem.referenceID).remove();
    }
  }

  AddCommentToPost(messID: string, comment: string) {
    if (comment.length > 2) { // empty string is just /n
      // const refID1 = this.db.createId();
      const refID1 = firebase.database().ref('userComments').child('comments').push().key;

      const uc = {
        messageID: messID,
        timeStamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
        referenceID: refID1,
        userID: this.user.uid,
        textComment: comment
      };
      // console.log('realtime - add comment', uc);
      // 11-12 reworked - need to allow many comments on a single post
      const ck = {
        commentID: refID1
      };
      firebase.database().ref('userComments').child(messID).child('comments').child(refID1).set(ck); // uc);
      firebase.database().ref('commentData').child(refID1).set(uc);
    }

    // 11-12 reworked again - I think I can't nest things deeper than one level
    // so I'll have to make two entries - one just a list of references (comment ID) under message ID
    // the other a new branch - commentData

    const numComments = this.commentReadState.getValue();
    this.commentReadState.next(numComments + 1);  // bump
  }

  // 10-27 - a post might have many comments - need to delete them all if post is deleted
  deleteCommentAttachedToPost(messID: string) {
    console.log('DELETE COMMENTS ATTACHED TO POST');
    alert('DELETE COMMENTS ATTACHED TO POST SOON');
  }

  findChatMessageUsingID(mssID: string): ChatMessage {
    let chat: ChatMessage = null;
    this.allMessages.forEach(msg => {
      if (msg.messageID === mssID) {
        chat = msg;
      }
    });
    return chat;
  }



  editSocialPostComment(mssID: string, cmt: string) {
    // console.log('real time - update social post', mssID, cmt);
    // ok - use the id to find the message
    // firebase.database().ref('chatMessage').child(aMsg.messageID).remove();
    const chat = this.findChatMessageUsingID(mssID);
    if (chat != null) {
      // console.log('found social post', chat);
      chat.textMessage = cmt;
      firebase.database().ref('chatMessage').child(mssID).set( chat);
    }
  }

  deletePost(mssID: string) {
    // let's try to find the message - we need to own it
    let aMsg: DisplayMessage = null;
    let indexToDelete = -1;
    let index = 0;
    // console.log('real time - delete post', mssID);
    if (this.myMessages.length > 0) {
      const oldLen = this.myMessages.length;
      this.myMessages.forEach(msg => {
        if (msg.messageID === mssID) {
          // console.log('found message to delete', msg);
          aMsg = msg;
          // indexToDelete = index;
        }
        // index++;
      });
      if (aMsg != null) {
        // console.log('here to delete', aMsg);
        firebase.database().ref('chatMessage').child(aMsg.messageID).remove();
        // need to bump the observable
        const alen = this.allMessages.length;
        for (let i = 0; i < alen; i++) {
          // this.allMessages.pop();
          // console.log('pop', this.allMessages.length);
          if (this.allMessages[i].messageID === mssID) {
            indexToDelete = index;
          }
          index++;
        }
        const removed = this.allMessages.splice(indexToDelete, 1);
        // console.log('bump state after delete', this.allMessages.length);
        //     this.myMessages, indexToDelete, removed, aMsg.ownerID); // splice isn't working :()
        this.allMessagesReadyState.next(0); // hope this will force a reset

        // this.watchForUserMessages(aMsg.ownerID);
      }
    }
  }

  makeCreativeDate(ts: firestore.Timestamp): string {
    let displayDate = '';
    const dispTime = this.datepipe.transform(ts, 'h:mm a');
    const dispDate = this.datepipe.transform(ts, 'MMM d yy');

    const nSec = new Date((ts as unknown) as number);
    const et = Date.now() -  nSec.getTime();
    const etSec = Math.round(et / 1000);
    const etMin = Math.round(etSec / 60);
    const etHour = Math.round(etMin / 60);
    const etDays = Math.round(etHour / 24);
    // console.log('ET 2', nSec, ts, et, etSec, etMin, etHour, etDays);

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
    // console.log('creative date', displayDate, etDays, etHour, etMin, etSec);
    return displayDate;
  }

  // 10-27 -- find all comments for our posts - I know this looks like a lot of hits
  // but I think this is better than just getting "all" comments - could be millions
  collectAllCommentsForPosts() {
    if (this.myMessages.length > 0) {
      // console.log('collect comments for posts');
      this.myMessages.forEach(msg => {
        // console.log('looking for comments', msg.messageID);
        // 11-22 try to remove all comments so delete works???
        const len = msg.postComments.length;
        for (let i = 0; i < len; i++) {
          msg.postComments.pop();
          // console.log('pop comments');
        }
        this.collectCommentsForThisMsg(msg.messageID);
      });
      // console.log('bump comment ready 2', this.allComments.length);
      this.commentReadState.next(this.allComments.length);
    }
  }

  // reworked this after watching a video:  https://www.youtube.com/watch?v=NcewaPfFR6Y
  collectCommentsForThisMsg(msgID: string) {
    // console.log('collect comments for message', msgID);
    // console.log('DB-read:***** userComments');
    const db = firebase.database();
    // const thisRef = db.ref('userComments').orderByKey().equalTo(msgID);
    const difRef = db.ref(`userComments/${msgID}`).orderByKey();
    // thisRef.on('value', this.gotData, this.errData);
    // difRef.on('value', this.gotData, this.errData);
    difRef
    // .limitToLast(22)  // some limit - no idea what # to use
    .on('value', snap => {
      const cmt = snap.val();
      if (cmt != null) {
        const keys = Object.keys(cmt);    // this was such a strange trip - but it seems to work
        const key = keys[0];
        const jkey = JSON.stringify(cmt[key]);
        const jp = JSON.parse(jkey);
        const jpk = Object.keys(jp);
        jpk.forEach(comntID => {
        // console.log('found ids?', comntID);
        // ok new function - use the ID to get the doc and add it as a comment
        this.readCommentAndAdditToPost(msgID, comntID);
      });
        this.commentReadState.next(this.allComments.length);
      }
    }, this.errCollectCommentData);   // nice to add the error function, which I've not been doing
  }

  errCollectCommentData(err) {
    console.log('error collecting comments!', err);
  }

  readCommentAndAdditToPost(msgID: string, commentID: string) {
    // console.log('about to get comment for post', msgID, commentID);
 //   console.log('DB-read:***** commentData');
    const db = firebase.database();

    firebase.database().ref('/commentData/' + commentID).once('value').then( snap => {
      const data = snap.val();
      // console.log('well?', snap, data, data.textComment);
      const nstComt: UserComment = {
        messageID: msgID,
        timeStamp: data.timeStamp,
        referenceID: data.referenceID,
        userID: data.userID,
        textComment: data.textComment
      };
      // console.log('found comment on post', nstComt.textComment, msgID, commentID);
      const nindex2 = this.allComments.findIndex(i => i.timeStamp === data.timeStamp);
      if (nindex2 < 0)  {
          // console.log('added comment', nstComt.textComment, this.allMessages.length, this.allComments.length, this.allComments);
          this.allComments.push(nstComt);
          // console.log('bump comment ready', this.allComments.length);
          this.commentReadState.next(this.allComments.length);
        }
      });
  }



SortCommentsForDisplay() {
    // console.log('here to sort comments for display', this.allComments.length, this.allComments);

    if (this.allComments.length > 0) {
      this.allComments.sort( (a, b): number => {
        // console.log('sorting cmt', a.textComment, b.textComment);
        if (a.timeStamp > b.timeStamp) {
          return -1;
        } else if (a.timeStamp === b.timeStamp) {
          return 0;
        } else {
          return 1;
        }
      });
    }
  }

findPostForComment(mssID: string): DisplayMessage {
    let retMsg: DisplayMessage = null;
    this.myMessages.forEach(msg => {
      if (msg.messageID === mssID) {
        retMsg = msg;
      }
    });
    return retMsg;
  }

makeDisplayComment(cmt: UserComment): DisplayMessage {
    const thisUser = this.firestoreService.GetUserUsingID(cmt.userID);
    const usrName = thisUser == null ? 'unknown' : thisUser.nickName;
    // const userName = 'abc';  // thisUser.nickName == null ? thisUser.userID : thisUser.nickName;
    let profilePic = thisUser == null ?  '../assets/img/persons.png' : thisUser.profilePicURL; // thisUser.profilePicURL;
    if (profilePic === undefined ||  profilePic.length === 0 ) {
      profilePic = '../assets/img/persons.png';
    }
    const dispDate = this.makeCreativeDate(cmt.timeStamp);
    const retDisp: DisplayMessage = {
      userName: usrName,
      userProfileURL: profilePic,
      displayDate: dispDate,
      rawDateForSort: cmt.timeStamp,
      messageText: cmt.textComment,
      referenceID: cmt.referenceID,
      tarotThrowID: '', // for now - only text in a comment
      pictureURL: '',   // for now - only text in a comment
      ownerID: cmt.userID,
      messageID: cmt.messageID,
      messageType: 'comment',
      iOwnThis: cmt.userID === this.user.uid, // 12-13
      postComments: [],
      scrollTag: ''       // ?? not sure how to make this
    };
    // console.log('display comment made', retDisp, cmt);
    return retDisp;
  }

  // export interface ScrollToComment {
  //   messageID: string;
  //   userID: string;
  //   scrollTag: string;
  // }

stitchCommentsToPosts() {
 //    console.log('realtime - stitch comments to post', this.allComments);

    this.scrollingTags.splice(0, this.scrollingTags.length);  // erase what's there
    // first step is order comments by time
    this.SortCommentsForDisplay();
    let cmtCnt = 0; // try to make custom scroll tag
    this.allComments.forEach(cmt => {
      // find the post this comment was attached to...
      const post = this.findPostForComment(cmt.messageID);
      // console.log('found post for comment', post, cmt);
      if (post != null) {
        const displayComment = this.makeDisplayComment(cmt);
        // should check for dups?
        // cmtCnt = post.postComments.length;  // 12-13-20
        const cmtTag = post.scrollTag + 'cmt0' + cmtCnt.toString(); // this is error prone - let's try something else

        const stc = {
          messageID: cmt.messageID,
          referenceID: cmt.referenceID,
          userID: cmt.userID,
          scrollTag: cmtTag
        };
        const sindex = this.scrollingTags.findIndex(i => i.messageID === cmt.referenceID );
        if (sindex < 0) {
          this.scrollingTags.push(stc);
          // console.log('scroll tag', stc);
        }

        displayComment.scrollTag = cmtTag;
        cmtCnt++;
        // console.log('Who owns? 3', displayComment.iOwnThis, displayComment.scrollTag,
        //       displayComment.messageText, cmt.referenceID);
        const index2 = post.postComments.findIndex(i => i.rawDateForSort === displayComment.rawDateForSort);
        // console.log('adding comment-stitch', index2, displayComment.messageText, displayComment.scrollTag);
        if (index2 < 0) {
          post.postComments.push(displayComment);
          // console.log('stitch adding comment to post', post.postComments.length, displayComment.messageText, post.messageText);
        }
      }
    });
    // 11-26 ok - let's sort the comments for each post - this is more complicated
    this.SortStitchedComments();  // yes, I know the name could be better :)
  }

  SortStitchedComments() {
    // have to post process
    // console.log('here to sort comments on posts', this.myMessages.length);
    this.myMessages.forEach(msg => {
      // console.log('any comments to sort?', msg.postComments.length);
      if (msg.postComments.length > 0) {
        // console.log('need to sort cop', msg);
        this.sortTheseCOP(msg);
      }
    });
  }

  sortTheseCOP(msg: DisplayMessage) {
    if (msg.postComments.length > 0) {
      msg.postComments.sort( (a, b): number => {
        // console.log('sorting', a, b);
        if (a.rawDateForSort < b.rawDateForSort) {
          // console.log('greater', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return -1;
        }
        else if (a.rawDateForSort === b.rawDateForSort) {
          // console.log('equal', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return 0;
        }
        else {
          // console.log('lesser', a.displayDate, a.rawDateForSort, b.displayDate, b.rawDateForSort);
          return 1;
        }
      });
    }
  }

  // export interface CommentsOnUserPosts {
  //   messageID: string;
  //   timestamp: Timestamp;
  //   userID: string;
  //   displayDate: string;
  // }
collectCommentsForUser(userID: string) {
    // console.log('collect comments for badge', userID, this.allComments.length);
    // console.trace();
    this.commentsOnUserPosts = [];
    // after all the dust has settled - let's collect all the comments for our dear user
    // this list is to build a notification to the user of who has commented on his/her posts
    this.allComments.forEach(cmt => {
      // find the post this comment was attached to...
      const post = this.findPostForComment(cmt.messageID);
      // console.log('badge found post for comment', post.messageText,
      //     cmt.textComment, post.messageID,
      //     userID, post.ownerID, this.allComments.length, cmt);
      if (post != null && userID === post.ownerID) {
        const displayComment = this.makeDisplayComment(cmt);
        const blurbText = this.makeBlurbText(cmt);
        // should check for dups?
        // const index2 = this.commentsOnUserPosts.findIndex(i => i.messageID === displayComment.messageID);
        const index2 = this.commentsOnUserPosts.findIndex(i => i.timestamp === displayComment.rawDateForSort);
        // console.log('badge adding comment', index2, displayComment, this.commentsOnUserPosts.length, this.commentsOnUserPosts);
        if (index2 < 0)
        {
          const dispDate = this.makeCreativeDate(cmt.timeStamp);
          const comt = {
            messageID: cmt.messageID,
            referenceID: cmt.referenceID,
            timestamp: cmt.timeStamp,
            userID: cmt.userID, 
            displayDate: dispDate,
            blurb: blurbText
          };
          this.commentsOnUserPosts.push(comt);
          // console.log('badge adding comment to post', comt.blurb, this.commentsOnUserPosts.length, this.commentsOnUserPosts);
        }
      }
    });
    this.createListOfCommentsForBadge();  // just format them so they can be clcked on
  }

makeBlurbText(post: UserComment): string {
  // extract a bit of the comment to show in notification
  let blurb = '';
  if (post !== undefined && post != null) {
    let len = post.textComment.length;
    if (len > 22) {
      len = 22; // cap
    }
    blurb = post.textComment.substring(0, len);
    if (len < post.textComment.length) {
      blurb += '...';
    }
  }
  // console.log('blurb made', blurb, post);
  return blurb;
}

createListOfCommentsForBadge() {
    // thinking the data should be simple
    this.commentBadgeInfo = [];
    if (this.commentsOnUserPosts.length > 0) {
      // console.log('creating badge list', this.commentsOnUserPosts.length);
      let cmtCnt = 0;
      this.commentsOnUserPosts.forEach(cmt => {
        const post = this.findPostForComment(cmt.messageID);

        if (post != null) {
          // console.log('badge comment:', cmt.blurb, post.messageText);
          const scrlTag = post.scrollTag + 'cmt0' + cmtCnt.toString();
          cmtCnt++;
          const aFriend = this.firestoreService.GetUserUsingID(cmt.userID);
          if (aFriend != null) {
            const badgeComment: CommentBadgeInfo = {
              scrollTag: scrlTag, // post.scrollTag,
              referenceID: cmt.referenceID,
              displayDate: post.displayDate,
              rawDateForSort: post.rawDateForSort,
              what: 'commented on',
              who: aFriend.nickName,
              pictureURL: aFriend.profilePicURL,
              blurb: cmt.blurb
            };
            this.commentBadgeInfo.push(badgeComment);
            // console.log('added badge comment', badgeComment.blurb, this.commentBadgeInfo.length, badgeComment.scrollTag);
          }
        }
      });
      this.badgeReadyState.next(this.commentBadgeInfo.length);
      // console.log('bump badge info');
    }
  }

getBadgeComments(): CommentBadgeInfo[] {
    return this.commentBadgeInfo;
  }

  getBadgeSrollTags(): ScrollToComment[] {
    // console.log('badge scrolling', this.scrollingTags.length, this.scrollingTags);
    return this.scrollingTags;
  }

  FindCommentUsingID(mssID: string, refID: string): UserComment {
    let uc = null;
    if (this.allComments.length > 0) {
      this.allComments.forEach(cmt => {
        if (cmt.referenceID === refID) {
          uc = cmt;
          // console.log('found matching comment', mssID, uc);
        }
      });
    }
    return uc;
  }

   // new 11-21 - edit user's comment made on a post
   // this works, but doesn't force a screen update
   // so I'm going to try delete then add, rather than mod
   async editSocialUserComment(mssID: string, refID: string, cmt: string) {
    // console.log('real time - update user comment', mssID, cmt);
    // ok - use the id to find the message
    const uc = this.FindCommentUsingID(mssID, refID);
    if (uc != null) {
      // so delete and add was no better than modify - so putting it back to modify
      // this.deleteSocialUserComment(mssID);  // then we'll add it back :(
      // // now add it back
      // this.AddCommentToPost(mssID, cmt);
      const uc1 = {
        messageID: mssID,
        timeStamp: uc.timeStamp,
        referenceID: uc.referenceID,
        userID: uc.userID,
        textComment: cmt
      };
      // console.log('realtime - update comment', uc1);
      // update cache
      uc.textComment = cmt;
      firebase.database().ref('commentData').child(uc.referenceID).set(uc1);
      this.collectCommentsForThisMsg(mssID);  // will this force update?
      // try to force an update
      const numComments = this.allMessagesReadyState.getValue();
      this.allMessagesReadyState.next(numComments + 1);  // bump
    }


    // try to force an update - this is data we don't care about - but it should force the .on code to be called
    // const refID2 = firebase.database().ref('userComments').child('comments').child(mssID).push().key;

    // firebase.database().ref('userComments').child(uc.referenceID).child('comments').child(refID2).set('edited: true'); // uc);

    // console.log('bumped?', refID2, uc);
    // const numComments = this.commentReadState.getValue();
    // this.commentReadState.next(numComments + 1);  // bump
  }

  deleteSocialUserComment(messID: string, refID: string) {
    // we have to remove two entries
    // firebase.database().ref('friendRequests').child(myUserID).child(frReferenceID).remove();
    const uc = this.FindCommentUsingID(messID, refID);
    if (uc != null) {
      // remove the first entry
      // console.log('delete comment', uc, messID);
      firebase.database().ref('userComments').child(messID).child('comments').child(uc.referenceID).remove();
      // and now remove the other
      firebase.database().ref('commentData').child(uc.referenceID).remove()
      .then( () => {
        // try to force an update
        this.zapMessages();
        const numComments = this.allMessagesReadyState.getValue();
        this.allMessagesReadyState.next(numComments - 1);  // bump
        // console.log('delete social - bumped messages ready');
      });
    }
  }

  // export interface LoginInfo {
  //   timestamp: Timestamp;
  //   userEmail: string;
  // }
  LogUserIn(user: firebase.User) {
    // let's just log the fact that we're in - add a timestamp
    if (user != null) {
      const ur = {
        timestamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
        userEmail: user.email
      };
      firebase.database().ref('loginTarot').child(user.uid).set( ur);
    }
    // console.log('realtime login', user.email, user);
  }

  LogGameUserIn(user: firebase.User) {
    // let's just log the fact that we're in - add a timestamp
    if (user != null) {
      const ur = {
        timestamp: firebase.database.ServerValue.TIMESTAMP as Timestamp,
        userEmail: user.email
      };
      firebase.database().ref('loginTarot').child(user.uid).set( ur);
    }
    // console.log('realtime login', user.email, user);
  }
  // some dashboard routines - so I can get a feeling for activity
countUserFR(userID: string): number {
  let numFR = 0;
  this.allFriendRequests.forEach(req => {
    if (req.requestingUserID === userID) {
      numFR++;
    }
  });
  return numFR;
}

  countUserFriends(userID: string): number {
    let numF = 0;
    this.allFriendsList.forEach(af => {
      if (af.requestingUserID === userID) {
        numF++;
      }
    });
    return numF;
  }

  countUserPosts(userID: string) {
    let numCmt = 0;
    this.myMessages.forEach(cmt => {
      // console.log('post?', cmt.ownerID, cmt.messageText);
      if (cmt.ownerID === userID) {
        numCmt++;
      }
    });
    return numCmt;
  }

  countUserCOP(userID: string) {
    let numCmt = 0;
    this.allComments.forEach(cmt => {
      // console.log('a comment?', cmt.textComment, cmt.userID);
      if (cmt.userID === userID) {
        numCmt++;
      }
    });
    return numCmt;
  }

  AreWeFriends(userID: string) {
    let stat = 'no';
    this.myFriends.forEach(f => {
      // console.log('friend?', userID, f.userID);
      if (f.userID === userID) {
        stat = 'yes';
      }
    });
    // console.log('status', stat);
    return stat;
  }

   // assume everything else has been settled by now - dashboard isn't brought up until late in the cycle
   watchClassicLogins() {
    this.classicFolk.splice(0, this.classicFolk.length);
    // const loginListRef = firebase.database().ref(`loginClassic`);
    console.log('DB-read:***** loginTarot');
    const loginListRef = firebase.database().ref(`loginTarot`);
    loginListRef
    .on('value', snapshot => {
      snapshot.forEach(login => {
        const aFriend = this.firestoreService.GetUserUsingID(login.key);
        if (aFriend != null) {
          const itmData = login.val();
          // console.log('watch dash loop', login.key, aFriend.email, itmData.timestamp, itmData.userEmail);
          const lastLogin = this.makeCreativeDate(itmData.timestamp);
          // const nFriends = this.countUserFriends(aFriend.userID);
          // const nFR = this.countUserFR(aFriend.userID);
          // const nPosts = this.countUserPosts(aFriend.userID);
          // const nCOP = this.countUserCOP(aFriend.userID);
          // let stat = this.AreWeFriends(aFriend.userID);
          let stat = 'classic';
          if (aFriend.email.toLowerCase() === 'iknowindigo@gmail.com') {
            stat = '';
          }
          const dash = {
            userID: aFriend.userID,
            userEmail: aFriend?.email,
            lastLoginTime: lastLogin,
            status: stat,
            rawDateForSort: itmData.timestamp,
            profilePicURL: aFriend.profilePicURL,
            numFriends: 0,
            numFriendRequests: 0,
            numPosts: 0,
            numComments: 0,  // nCOP
            totalThrows: 0,
            singleCard: 0,
            threeCards: 0,
            pyramidCards: 0,
            memoryGame: 0,
            nineRay: 0
          };
          this.classicFolk.push(dash);
          // console.log('dash entry', dash, this.classicFolk.length);
        }
      });
      this.dashBoardState.next(this.classicFolk.length);
      // console.log('bump dashboard state', this.classicFolk.length);
      this.sortClassicFolkByLoginData();
    });
  }

  sortClassicFolkByLoginData() {
    // console.log('here to sort messages for display', this.myMessages.length, this.myMessages);
    if (this.classicFolk.length > 0) {
      this.classicFolk.sort( (a, b): number => {
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
  // assume everything else has been settled by now - dashboard isn't brought up until late in the cycle
  watchLogins() {
    this.dashFolks.splice(0, this.dashFolks.length);
    console.log('DB-read:***** logins');
    const loginListRef = firebase.database().ref(`logins`);
    loginListRef
    .on('value', snapshot => {
      snapshot.forEach(login => {
        const aFriend = this.firestoreService.GetUserUsingID(login.key);
        if (aFriend != null) {
          const itmData = login.val();
          console.log('watch dash loop', login.key, aFriend.email, itmData.timestamp, itmData.userEmail);
          const lastLogin = this.makeCreativeDate(itmData.timestamp);
          const nFriends = this.countUserFriends(aFriend.userID);
          const nFR = this.countUserFR(aFriend.userID);
          const nPosts = this.countUserPosts(aFriend.userID);
          const nCOP = this.countUserCOP(aFriend.userID);
          let stat = this.AreWeFriends(aFriend.userID);
          if (aFriend.email.toLowerCase() === 'iknowindigo@gmail.com') {
            stat = '';
          }
          const dash = {
            userID: aFriend.userID,
            userEmail: aFriend.email,
            lastLoginTime: lastLogin,
            status: stat,
            rawDateForSort: itmData.timestamp,
            profilePicURL: aFriend.profilePicURL,
            numFriends: nFriends,
            numFriendRequests: nFR,
            numPosts: nPosts,
            numComments: nCOP,  // nCOP
            // I'll populate the following fields later
            totalThrows: 0,
            singleCard: 0,
            threeCards: 0,
            pyramidCards: 0,
            memoryGame: 0,
            nineRay: 0
            // totalThrows: number;
            // singleCard: number;
            // threeCards: number;
            // pyramidCards: number;
            // memoryGame: number;
          };
          this.dashFolks.push(dash);
          console.log('dash entry', dash, this.dashFolks.length);
        }
      });
      this.dashBoardState.next(this.dashFolks.length);
      this.sortDashFolksByLoginData();
    });
  }

  sortDashFolksByLoginData() {
    // console.log('here to sort messages for display', this.myMessages.length, this.myMessages);
    if (this.dashFolks.length > 0) {
      this.dashFolks.sort( (a, b): number => {
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

  getDashFolks() {
    console.log('get dash folks', this.dashFolks.length);
    return this.dashFolks;
  }

  getClassicFolk() {
    console.log('get classic folk', this.classicFolk.length, this.classicFolk);
    return this.classicFolk;
  }


  // allThrowCounts

  findRecordForUser(userID) {
    let ttc: TarotThrowCount = null;
    if (this.throwCounts.length > 0) {
      this.throwCounts.forEach(tc => {
        if (tc.userID === userID) {
          ttc = tc;
        }
      });
    }
    return ttc;
  }

  addReadingCounts(doc: firestore.DocumentData) {
    const usrID: string = doc.userId;
    const aUser = this.firestoreService.GetUserUsingID(usrID);
    const eMail = aUser == null ? '?' : aUser.email;
    if (aUser == null) {
      // I think I must have deleted these - user is no longer in the system
      const throwType = parseInt(doc.throwType, 10);
      const strDate: string = doc.dateTime.toDate();
      const dispDate = this.datepipe.transform(strDate, 'M');
      var aMonth = parseInt(dispDate, 10);
      // need a way to get months since 2020 - how about 
      const parsedYear = this.datepipe.transform(strDate, 'yyyy')
      const yearSince2020 = parseInt(parsedYear) - 2020;
      const oldMonth = aMonth
      aMonth = aMonth + yearSince2020*12 
     // if (parsedYear === '2022')
    //  if (aMonth === 13)
    //     console.log('add reading counts2',yearSince2020, '\t>>>\t', aMonth, '\t<<<\t', oldMonth, '\t<<<\t', dispDate, parsedYear,  strDate) // strDate

      switch (throwType) {
        case 1: { this.allThrowCounts.numSingleCard++; } break;
        case 3: {  this.allThrowCounts.numThreeCard++; } break;
        case 8: { this.allThrowCounts.numMemoryGame++; } break;
        case 11: {  this.allThrowCounts.numPyramid++; } break;
        case 111: {  this.allThrowCounts.rayOne++; } break;
        case 211: {  this.allThrowCounts.rayTwo++; } break;
        case 311: {  this.allThrowCounts.rayThree++; } break;
        case 411: { this.allThrowCounts.rayFour++; } break;
        case 511: {  this.allThrowCounts.rayFive++; } break;
        case 611: {  this.allThrowCounts.raySix++; } break;
        case 711: {  this.allThrowCounts.raySeven++; } break;
        case 811: {  this.allThrowCounts.rayEight++; } break;
        case 911: {  this.allThrowCounts.rayNine++; } break;
      }
      switch (aMonth) {
        // case 7: {  this.allThrowCounts.cnt0720++; } break;
        // case 8: {  this.allThrowCounts.cnt0820++; } break;
        // case 9: { this.allThrowCounts.cnt0920++; } break;
        // case 10: {  this.allThrowCounts.cnt1020++; } break;
        // case 11: {  this.allThrowCounts.cnt1120++; } break;
        // case 12: {  this.allThrowCounts.cnt1220++; } break;
        // case 1: {  this.allThrowCounts.cnt0121++; } break;
        // case 2: { this.allThrowCounts.cnt0221++; } break;
        // case 3: { this.allThrowCounts.cnt0321++; } break;
        // case 4: { this.allThrowCounts.cnt0421++; } break;
        // case 5: { this.allThrowCounts.cnt0521++; } break;
        // case 6: { this.allThrowCounts.cnt0621++; } break;
        case 7: {  this.allThrowCounts.cnt0720++; } break;
        case 8: {  this.allThrowCounts.cnt0820++; } break;
        case 9: {  this.allThrowCounts.cnt0920++; } break;
        case 10: {  this.allThrowCounts.cnt1020++; } break;
        case 11: {  this.allThrowCounts.cnt1120++; } break;
        case 12: {  this.allThrowCounts.cnt1220++; } break;
        case 13: {  this.allThrowCounts.cnt0121++; } break;
        case 14: {  this.allThrowCounts.cnt0221++; } break;

        case 15: {  this.allThrowCounts.cnt0321++; } break;
        case 16: { this.allThrowCounts.cnt0421++; } break;
        case 17: { this.allThrowCounts.cnt0521++; } break;
        case 18: { this.allThrowCounts.cnt0621++; } break;
        case 19: {  this.allThrowCounts.cnt0721++; } break;
        case 20: {  this.allThrowCounts.cnt0821++; } break;
        case 21: {  this.allThrowCounts.cnt0921++; } break;
        case 22: {  this.allThrowCounts.cnt1021++; } break;
        case 23: {  this.allThrowCounts.cnt1121++; } break;
        case 24: {  this.allThrowCounts.cnt1221++; } break;
        case 25: {  this.allThrowCounts.cnt0122++; } break;
        case 26: {  this.allThrowCounts.cnt0222++; } break;
        case 27: {  this.allThrowCounts.cnt0322++; } break;
        case 28: {  this.allThrowCounts.cnt0422++; } break;
        case 29: {  this.allThrowCounts.cnt0522++; } break;
        case 30: {  this.allThrowCounts.cnt0622++; } break;
        case 31: {  this.allThrowCounts.cnt0722++; } break;
        case 32: {  this.allThrowCounts.cnt0822++; } break;
        case 33: {  this.allThrowCounts.cnt0922++; } break;
        case 34: {  this.allThrowCounts.cnt1022++; } break;
        case 35: {  this.allThrowCounts.cnt1122++; } break;
        case 36: {  this.allThrowCounts.cnt1222++; } break;
        case 37: {  this.allThrowCounts.cnt0123++; } break;
        case 38: {  this.allThrowCounts.cnt0223++; } break;
        case 39: {  this.allThrowCounts.cnt0323++; } break;
        case 40: {  this.allThrowCounts.cnt0423++; } break;
        case 41: {  this.allThrowCounts.cnt0523++; } break;
        case 42: {  this.allThrowCounts.cnt0623++; } break;
        case 43: {  this.allThrowCounts.cnt0723++; } break;
        case 44: {  this.allThrowCounts.cnt0823++; } break;
        case 45: {  this.allThrowCounts.cnt0923++; } break;
        case 46: {  this.allThrowCounts.cnt1023++; } break;
        case 47: {  this.allThrowCounts.cnt1123++; } break;
        case 48: {  this.allThrowCounts.cnt1223++; } break;
      }
      // this.allThrowCounts.skippedUsers++;
      // console.log('skipping:', throwType, aMonth);
    } else {
      // see if we already have this email - if not create one
      let thisThrowCount = this.findRecordForUser(usrID);
      if (thisThrowCount === null) {
        thisThrowCount = {  // init it
          userID: usrID,
          userEmail: aUser.email,
          skippedUsers: 0,
          socialUser: false,
          numSingleCard: 0,
          numTotalThrows: 0,
          numThreeCard: 0,
          numMemoryGame: 0,
          numPyramid: 0,
          rayOne: 0,
          rayTwo: 0,
          rayThree: 0,
          rayFour: 0,
          rayFive: 0,
          raySix: 0,
          raySeven: 0,
          rayEight: 0,
          rayNine: 0,
          cnt0720: 0,
          cnt0820: 0,
          cnt0920: 0,
          cnt1020: 0,
          cnt1120: 0,
          cnt1220: 0,
          cnt0121: 0,
          cnt0221: 0,
          cnt0321: 0,
          cnt0421: 0,
          cnt0521: 0,
          cnt0621: 0,
           // 4/20/22 new
          cnt0721: 0,
      cnt0821: 0,
      cnt0921: 0,
      cnt1021: 0,
      cnt1121: 0,
      cnt1221: 0,
      cnt0122: 0,
      cnt0222: 0,
      cnt0322: 0,
      cnt0422: 0,
      cnt0522: 0,
      cnt0622: 0,
      cnt0722: 0,
      cnt0822: 0,
      cnt0922: 0,
      cnt1022: 0,
      cnt1122: 0,
      cnt1222: 0,
      cnt0123: 0,
      cnt0223: 0,
      cnt0323: 0,
      cnt0423: 0,
      cnt0523: 0,
      cnt0623: 0,
      cnt0723: 0,
      cnt0823: 0,
      cnt0923: 0,
      cnt1023: 0,
      cnt1123: 0,
      cnt1223: 0,
        };
        this.throwCounts.push(thisThrowCount);  // I think I'm pusing a reference - and it will be updated...
      }
     
      // ok - ready to update the record
      const throwType = parseInt(doc.throwType, 10);
      const strDate: string = doc.dateTime.toDate();
      const dispDate = this.datepipe.transform(strDate, 'M');
      var aMonth = parseInt(dispDate, 10);
      const parsedYear = this.datepipe.transform(strDate, 'yyyy')
      const yearSince2020 = parseInt(parsedYear) - 2020;
      const oldMonth = aMonth
      aMonth = aMonth + yearSince2020*12 
      //if (parsedYear === '2022')
      // if (aMonth === 13)
      //   console.log('add reading counts', yearSince2020, dispDate,'\t>>>\t',  aMonth,  '\t<<<\t', oldMonth, '\t<<<\t', parsedYear, strDate) // strDate
      //  // need a way to get months since 2020 - how about 
      thisThrowCount.numTotalThrows++;  // we've seen one throw at least
      this.allThrowCounts.numTotalThrows++;
       // 6/14/21 - let's bump user's personal count as well
       this.bumpPersonalUserCount(usrID, throwType);  
      // ok - time to bump
      switch (throwType) {
        case 1: { thisThrowCount.numSingleCard++; this.allThrowCounts.numSingleCard++; } break;
        case 3: { thisThrowCount.numThreeCard++; this.allThrowCounts.numThreeCard++; } break;
        case 8: { thisThrowCount.numMemoryGame++; this.allThrowCounts.numMemoryGame++; } break;
        case 11: { thisThrowCount.numPyramid++;  this.allThrowCounts.numPyramid++; } break;
        case 111: { thisThrowCount.rayOne++;  this.allThrowCounts.rayOne++; } break;
        case 211: { thisThrowCount.rayTwo++;  this.allThrowCounts.rayTwo++; } break;
        case 311: { thisThrowCount.rayThree++;  this.allThrowCounts.rayThree++; } break;
        case 411: { thisThrowCount.rayFour++;  this.allThrowCounts.rayFour++; } break;
        case 511: { thisThrowCount.rayFive++;  this.allThrowCounts.rayFive++; } break;
        case 611: { thisThrowCount.raySix++;  this.allThrowCounts.raySix++; } break;
        case 711: { thisThrowCount.raySeven++;  this.allThrowCounts.raySeven++; } break;
        case 811: { thisThrowCount.rayEight++;  this.allThrowCounts.rayEight++; } break;
        case 911: { thisThrowCount.rayNine++;  this.allThrowCounts.rayNine++; } break;
      }
      switch (aMonth) {
       /*  case 7: { thisThrowCount.cnt0720++;  this.allThrowCounts.cnt0720++; } break;
        case 8: { thisThrowCount.cnt0820++;  this.allThrowCounts.cnt0820++; } break;
        case 9: { thisThrowCount.cnt0920++;  this.allThrowCounts.cnt0920++; } break;
        case 10: { thisThrowCount.cnt1020++;  this.allThrowCounts.cnt1020++; } break;
        case 11: { thisThrowCount.cnt1120++;  this.allThrowCounts.cnt1120++; } break;
        case 12: { thisThrowCount.cnt1220++;  this.allThrowCounts.cnt1220++; } break;
        case 1: { thisThrowCount.cnt0121++;  this.allThrowCounts.cnt0121++; } break;
        case 2: { thisThrowCount.cnt0221++;  this.allThrowCounts.cnt0221++; } break;

        case 3: { thisThrowCount.cnt0321++;  this.allThrowCounts.cnt0321++; } break;
        case 4: { thisThrowCount.cnt0421++; this.allThrowCounts.cnt0421++; } break;
        case 5: { thisThrowCount.cnt0521++; this.allThrowCounts.cnt0521++; } break;
        case 6: { thisThrowCount.cnt0621++; this.allThrowCounts.cnt0621++; } break; */
        // 4/20/22 - reworked - I'm now looking at months since 2020
        case 7: { thisThrowCount.cnt0720++;  this.allThrowCounts.cnt0720++; } break;
        case 8: { thisThrowCount.cnt0820++;  this.allThrowCounts.cnt0820++; } break;
        case 9: { thisThrowCount.cnt0920++;  this.allThrowCounts.cnt0920++; } break;
        case 10: { thisThrowCount.cnt1020++;  this.allThrowCounts.cnt1020++; } break;
        case 11: { thisThrowCount.cnt1120++;  this.allThrowCounts.cnt1120++; } break;
        case 12: { thisThrowCount.cnt1220++;  this.allThrowCounts.cnt1220++; } break;
        case 13: { thisThrowCount.cnt0121++;  this.allThrowCounts.cnt0121++; } break;
        case 14: { thisThrowCount.cnt0221++;  this.allThrowCounts.cnt0221++; } break;

        case 15: { thisThrowCount.cnt0321++;  this.allThrowCounts.cnt0321++; } break;
        case 16: { thisThrowCount.cnt0421++; this.allThrowCounts.cnt0421++; } break;
        case 17: { thisThrowCount.cnt0521++; this.allThrowCounts.cnt0521++; } break;
        case 18: { thisThrowCount.cnt0621++; this.allThrowCounts.cnt0621++; } break;
        case 19: { thisThrowCount.cnt0721++;  this.allThrowCounts.cnt0721++; } break;
        case 20: { thisThrowCount.cnt0821++;  this.allThrowCounts.cnt0821++; } break;
        case 21: { thisThrowCount.cnt0921++;  this.allThrowCounts.cnt0921++; } break;
        case 22: { thisThrowCount.cnt1021++;  this.allThrowCounts.cnt1021++; } break;
        case 23: { thisThrowCount.cnt1121++;  this.allThrowCounts.cnt1121++; } break;
        case 24: { thisThrowCount.cnt1221++;  this.allThrowCounts.cnt1221++; } break;
        case 25: { thisThrowCount.cnt0122++;  this.allThrowCounts.cnt0122++; } break;
        case 26: { thisThrowCount.cnt0222++;  this.allThrowCounts.cnt0222++; } break;
        case 27: { thisThrowCount.cnt0322++;  this.allThrowCounts.cnt0322++; } break;
        case 28: { thisThrowCount.cnt0422++;  this.allThrowCounts.cnt0422++; } break;
        case 29: { thisThrowCount.cnt0522++;  this.allThrowCounts.cnt0522++; } break;
        case 30: { thisThrowCount.cnt0622++;  this.allThrowCounts.cnt0622++; } break;
        case 31: { thisThrowCount.cnt0722++;  this.allThrowCounts.cnt0722++; } break;
        case 32: { thisThrowCount.cnt0822++;  this.allThrowCounts.cnt0822++; } break;
        case 33: { thisThrowCount.cnt0922++;  this.allThrowCounts.cnt0922++; } break;
        case 34: { thisThrowCount.cnt1022++;  this.allThrowCounts.cnt1022++; } break;
        case 35: { thisThrowCount.cnt1122++;  this.allThrowCounts.cnt1122++; } break;
        case 36: { thisThrowCount.cnt1222++;  this.allThrowCounts.cnt1222++; } break;
        case 37: { thisThrowCount.cnt0123++;  this.allThrowCounts.cnt0123++; } break;
        case 38: { thisThrowCount.cnt0223++;  this.allThrowCounts.cnt0223++; } break;
        case 39: { thisThrowCount.cnt0323++;  this.allThrowCounts.cnt0323++; } break;
        case 40: { thisThrowCount.cnt0423++;  this.allThrowCounts.cnt0423++; } break;
        case 41: { thisThrowCount.cnt0523++;  this.allThrowCounts.cnt0523++; } break;
        case 42: { thisThrowCount.cnt0623++;  this.allThrowCounts.cnt0623++; } break;
        case 43: { thisThrowCount.cnt0723++;  this.allThrowCounts.cnt0723++; } break;
        case 44: { thisThrowCount.cnt0823++;  this.allThrowCounts.cnt0823++; } break;
        case 45: { thisThrowCount.cnt0923++;  this.allThrowCounts.cnt0923++; } break;
        case 46: { thisThrowCount.cnt1023++;  this.allThrowCounts.cnt1023++; } break;
        case 47: { thisThrowCount.cnt1123++;  this.allThrowCounts.cnt1123++; } break;
        case 48: { thisThrowCount.cnt1223++;  this.allThrowCounts.cnt1223++; } break;
        
      }
      // console.log('all readings:', this.throwCounts.length, thisThrowCount, throwType, aMonth);

      // console.log('all readings:', thisThrowCount, doc.userId, doc.throwType, aUser.email, dispDate, strDate, aMonth, throwType);
    }

  }
  bumpPersonalUserCount(userID: string, throwType: number) {
 //  console.log('bumping personal', userID, throwType, this.classicFolk.length);
    var dashUser = this.findDashUserFromID(userID);
    // hmm - perhaps I can make a dummy user
    if (dashUser === null) {
      const aUser = this.firestoreService.GetUserUsingID(userID);
      if (aUser != null) {
        const dash = {
          userID: userID,
          userEmail: aUser.email,
          lastLoginTime: '* early testing phase only *',
          status: 'never',
          rawDateForSort: null,
          profilePicURL: aUser.profilePicURL,
          numFriends: 0,
          numFriendRequests: 0,
          numPosts: 0,
          numComments: 0,  // nCOP
          totalThrows: 0,
          singleCard: 0,
          threeCards: 0,
          pyramidCards: 0,
          memoryGame: 0,
          nineRay: 0
        };
        this.classicFolk.push(dash);
        dashUser = dash;
   //     console.log('created classic user');
      }
     
    }
      if (dashUser != null) {
      // now bump his counts
      dashUser.totalThrows++;
      switch (throwType) {
        case 1: { dashUser.singleCard++ } break;
        case 3: { dashUser.threeCards++ } break;
        case 8: { dashUser.memoryGame++ } break;
        case 11: { dashUser.pyramidCards++} break;
        case 111: { dashUser.nineRay++ } break;
        case 211: { dashUser.nineRay++} break;
        case 311: { dashUser.nineRay++ } break;
        case 411: { dashUser.nineRay++ } break;
        case 511: { dashUser.nineRay++} break;
        case 611: { dashUser.nineRay++} break;
        case 711: { dashUser.nineRay++ } break;
        case 811: { dashUser.nineRay++ } break;
        case 911: { dashUser.nineRay++ } break;
      }
 //     console.log('bumped personal', dashUser.userEmail, dashUser.singleCard, dashUser.threeCards, dashUser.totalThrows, dashUser.memoryGame);
    }
    //  else {
    //   const aUser = this.firestoreService.GetUserUsingID(userID);
    //   console.log('classic user not found - missing bump?', aUser);
    // }
  }
  // switched from dash to classic...
  findDashUserFromID(userID: string) :DashboardUserInfo {
    let foundUser: DashboardUserInfo = null;
    this.classicFolk.forEach(df => {
//      console.log('searching dash', df.userID, userID);
      if (df.userID === userID) {
        foundUser = df;
     //   console.log('found classic user', foundUser);
      }
    });
    // if (foundUser == null) {
    //   console.log('could not find classic?', userID);
    // }
    return foundUser;
  }

  sortThrowsByCount() {
    if (this.throwCounts.length > 0) {
      this.throwCounts.sort( (a, b): number => {

        if (a.numTotalThrows > b.numTotalThrows) {
          return -1;
        }
        else if (a.numTotalThrows === b.numTotalThrows) {
          return 0;
        }
        else {
          return 1;
        }
      });
    }
  }

  // 12-11-10 -- more dashboard work
  countAllReadings() {
    console.log('count all readings starting');
    this.throwCounts.splice(0, this.throwCounts.length);
    const myRead = this.db.collection('Readings');
    this.db.collection('Readings') // , ref => ref.where('id', 'in',  data) )
    .get()
    .toPromise().then( (snapshot) => {
      console.log('did server call countAllReadings?', snapshot); // snapshot.docs
      snapshot.docs.forEach(async doc => {
        const dat = doc.data();
        this.addReadingCounts(dat);
      });
    })
    .finally( () => {
      this.sortThrowsByCount();  // one way to show
      console.log('all readings done?', this.throwCounts.length, this.throwCounts);
      this.dashboardReadyState.next(this.throwCounts.length);
      // I think we should have all the foreign readings now
      // this.buildForeignThrowArray();  // kludge copy - should make a common routine
    });
  }

  getAllReadings() {
    console.log('Get all readings', this.throwCounts)
    return this.throwCounts;
  }

  getAllReadingTotals() {
    console.log('Get All Readings Totals', this.allThrowCounts)
    return this.allThrowCounts;
  }

  // export interface BadgeNotifyData {
  //   messageID: string;
  //   messageType: string; 
  //   referenceID: string;  // use this to delete it later
  //   // userID: string;
  //   timestamp: Timestamp;
  // }
  // addNotifyForFriends(typePost: string, chat: ChatMessage) {
  //   console.log('notify friends', typePost, chat, this.myFriends.length);
  //   const notify = {
  //     messageID: chat.messageID,
  //     messageType: typePost,
  //     timestamp: chat.timeStamp,
  //     userID: chat.userID
  //   }
  //   if (this.myFriends.length > 0) {
  //     this.myFriends.forEach(fnd => {
  //       // get the id
  //       const refID1 = firebase.database().ref('badgeNotify').child('comments').push().key;
  //       firebase.database().ref(`badgeNotify`).child(fnd.userID).child(refID1).set(notify);
  //       console.log('db write', refID1, notify, fnd.userID, fnd.nickName);
  //     })
  //   }
  // }
  // watchBadgeNotify(userID: string) {
  //   // console.log('watch new badges', `badgeNotify/${userID}`);
  //   console.log('DB-read:***** badgeNotify');
  //   const badgeNotifyRef = firebase.database().ref(`badgeNotify/${userID}`);
  //   badgeNotifyRef
  //   .on('value', snapshot => {
  //     // console.log('Friend data:', snapshot.val(), snapshot.numChildren(), snapshot.key, snapshot.val);
  //     snapshot.forEach(msg => {
  //       const msgData = msg.val();
  //       const myNotify = this.createBadgeNotifyItem(msgData);
  //       if (myNotify !== null) {
  //         myNotify.scrollTag = msg.key;
  //         const index2 = this.myBadgeNotifications.findIndex(i => i.rawDateForSort === myNotify.rawDateForSort);
  //         if (index2 < 0) {
  //           this.myBadgeNotifications.push(myNotify);
  //         }
  //       } else {
  //         console.log('?null notify?');
  //       }
        
        
  //       console.log('watch badge: msg', msg.key, myNotify, this.myBadgeNotifications.length);
  //     });
  //     console.log('new notification list complete', this.myBadgeNotifications.length, this.myBadgeNotifications);
  //     this.badgeOneShotState.next(this.myBadgeNotifications.length);
  //   });
  // }

  // getMyNewBadgeNotifications() {
  //   console.log('get new badge notify', this.myBadgeNotifications.length);
  //   return this.myBadgeNotifications;
  // }

  createBadgeNotifyItem(msgData: any): BadgeNotifyInfo {
    let bni: BadgeNotifyInfo = null;
    if (msgData !== null) {
      const aFriend = this.firestoreService.GetUserUsingID(msgData.userID);
      if (aFriend !=  null) {
        const dispDate = this.makeCreativeDate(msgData.timestamp);
        console.log(msgData.messageID, msgData.userID, msgData.messageType);
        bni = {
          messageID: msgData.messageID,
          messageType: msgData.messageType,
          who: aFriend.nickName,
          pictureURL: aFriend.profilePicURL,
          userID: aFriend.userID,
          what: 'notSure',
          rawDateForSort: msgData.timestamp,
          displayDate: dispDate,
          blurb: '?',
          scrollTag: '?'
        }
      }
      else { 
        console.log('null friend');
      }
    }
    console.log('create notify', bni);
    return bni;
  }

  // export interface BadgeNotifyInfo {
  //   messageID: string;
  //   messageType: string;  // this will be displayed as a part of the menu text
  //   displayDate: string;
  //   rawDateForSort: Timestamp;
  //   userID: string;
  //   what: string;
  //   who: string;    // FB adds user names together (him, her, etc)
  //   pictureURL: string;
  //   blurb: string;
  //   scrollTag: string;   
  // }

}
