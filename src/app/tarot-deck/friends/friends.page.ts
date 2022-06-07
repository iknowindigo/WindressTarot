import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, ProfileUserData } from '../../services/authentication.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { AlertController } from '@ionic/angular';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { RealtimeDbService, UsersMsg, FriendsRequestData } from '../../services/realtime-db.service'; // 9-25-20
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  userDataList: UserData[];
  user: firebase.User;
  displayName: string;
  loggedIn: boolean;
  // allUserMessages: UsersMsg[];
  possibleFriends: UserData[];  // this will be our suggested list - they can still search
  searchedFriends: UserData[];
  searchTerm: string;
  currentSearchText: string;
  searchCount: number;
  searchDisplay: string;
  allFriendRequests: FriendsRequestData[];
  friendRequests: UserData[];   // normally this is empty
  friendRequestIveMade: FriendsRequestData[];
  requestsIMade: UserData[];
  myFriends: UserData[];
  allFriendsList: FriendsRequestData[];


  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private firestoreService: FirestoreService,
    private realtimeDB: RealtimeDbService,
    private alert: AlertController,
  ) {
    this.allFriendsList = [];
    this.requestsIMade = [];
    this.myFriends = [];
    this.userDataList = [];
    // this.allUserMessages = [];
    this.possibleFriends = [];
    this.searchedFriends = [];
    this.allFriendRequests = [];
    this.friendRequests = [];
    this.friendRequestIveMade = []; // 12-4
    this.searchTerm = '';
    this.currentSearchText = '';
    this.searchCount = 0;
    this.searchDisplay = '';
  }

  ngOnInit() {
    // this.realtimeDB.resetCache(); // might help?
    this.realtimeDB.dummyLoadAll();
    console.log('init friends');
    this.firestoreService.getUsers();
    this.userDataList = this.firestoreService.getListOfUsers();
    // this.allUserMessages = this.realtimeDB.getAllUserMessages();
    // this.allFriendRequests = this.realtimeDB.getAllFriendRequests();

    this.authService.authenticationState.subscribe(state => {
      // console.log('main app Auth changed:', state);
      this.loggedIn = state;
      if (this.loggedIn === true) {
        this.user = this.authService.getCurrentFBUser();  // back door
        this.displayName = '??';  // trying to force update?
        this.displayName = this.user.email;
           // let's 'login' and make sure our profile is updated
        if (this.user != null) {
          this.authService.LogUserIn(this.user);
        }
      }

      this.realtimeDB.friendsRequestState.subscribe(stateFR => {
        // console.log('friend requests', stateFR);
        if (stateFR > 0 ) {
          // I think the array doesn't empty itself
          // const len = this.allFriendRequests.length;
          // for (let i = 0; i < len; i++) {
          //   this.allFriendRequests.pop();
          // }
          this.userDataList = this.firestoreService.getListOfUsers();
          this.allFriendRequests = this.realtimeDB.getAllFriendRequests();
          this.allFriendsList = this.realtimeDB.getAllFriends(); // just to seed possible friends
          // console.log('have some requests', stateFR, this.allFriendRequests.length, this.allFriendRequests);
          this.crunchFriendRequests();
        }
        else {
          this.zapFRLists();
        }
      });

      this.realtimeDB.friendsReadyState.subscribe(stateFriends => {
        // console.log('friend list complete', stateFriends);
        if (stateFriends > 0 && this.userDataList.length > 0) {
          this.userDataList = this.firestoreService.getListOfUsers();
          this.myFriends = this.realtimeDB.getMyFriends(this.user.uid);
          this.crunchFriendRequests();
          // console.log('friends page: my friends', this.myFriends, this.possibleFriends.length);
          if (this.possibleFriends.length > 0) {
            // console.log('trim list of possible');
            this.prunePossibleList();
          }
        }
      });

      // 1/11/21 commented this call out - I was exceeding my quota of reads
      // this.firestoreService.getUsers(); // this should trigger get a list of users
      this.firestoreService.usersReadyState.subscribe(stateUsers => {
        if (stateUsers > 0) {
          this.allFriendRequests = this.realtimeDB.getAllFriendRequests();
          this.userDataList = this.firestoreService.getListOfUsers();
          this.myFriends = this.realtimeDB.getMyFriends(this.user.uid);
          // this.allUserMessages = this.realtimeDB.getAllUserMessages();    // note - during dev this may not be populated - main calls
          this.makeListOfPossibleFriends();
          this.prunePossibleList();
          // console.log('getting users', this.allUserMessages, this.userDataList);
        }
      });
    });
  }

  // ngOnDestroy() {
  //   console.log('Friends page: ngOnDestroy');
  // }

  ionViewDidLeave() {
    // console.log('friends ionViewDidLeave');
    this.realtimeDB.stopWatchChat();  // stop watching
    // this.authService.authenticationState.unsubscribe();
    // this.firestoreService.usersReadyState.unsubscribe();
    // this.realtimeDB.friendsRequestState.unsubscribe();
    // this.realtimeDB.friendsReadyState.unsubscribe();
  }

  crunchFriendRequests() {
    this.friendRequests = this.realtimeDB.getMyFriendRequests(this.user.uid);
    this.realtimeDB.crunchFriendRequests(this.user.uid); // ported to the service
    this.requestsIMade = this.realtimeDB.getRequestsIMade();
    // console.log('requests I made', this.requestsIMade);

    // console.log('ready to crunch FR', this.allFriendRequests.length);
    // this.allFriendRequests.forEach(req => {
    //   console.log('scanning friend requests', req);
    //   if (this.user.uid === req.userID) {
    //     // someone wants to be our friend
    //     const whichUser = this.firestoreService.GetUserUsingID(req.requestingUserID);
    //     console.log('requested by', whichUser);
    //     this.friendRequests.push(whichUser);
    //   }
    // });
    // console.log('total requests', this.friendRequests);
    // // while we're here - let's make a list of requests we've made - so user could cancel
    // this.allFriendRequests.forEach(req => {
    //   console.log('scanning friend requests', req);
    //   if (this.user.uid === req.requestingUserID) {
    //     // we've asked someone to be our friend
    //     const whichUser = this.firestoreService.GetUserUsingID(req.userID);
    //     console.log('requested ', whichUser);
    //     this.requestsIMade.push(whichUser);
    //   }
    // });
    this.prunePossibleList();
  }
  removeUserFromFriendRequestList(userID: string) {
    const frd: FriendsRequestData = this.findRDRecord(userID);
    // console.log('remove user after not now cancel', userID, frd, this.friendRequests.length);
    if (frd !== null) {
      const index = this.friendRequests.findIndex(i => userID === userID);
      // console.log('found?', index);
      if (index >= 0) {
        this.friendRequests.splice(index, 1);
        // console.log('found and removed', this.friendRequests.length);
      }
    }
    // console.log('removed?', this.friendRequests.length);
  }

  pruneMyRequests(userID: string, frd: FriendsRequestData) {
    // console.log('remove request from our list', userID, frd, this.requestsIMade.length);
    if (this.requestsIMade.length > 0) {
      const index = this.requestsIMade.findIndex(i => userID === userID);
      // console.log('found?', index, this.requestsIMade.length);
      if (index >= 0) {
        this.requestsIMade.splice(index, 1);
        // console.log('spliced', index);
      }
    }
    // console.log('after prune requests I made', this.requestsIMade.length);
  }

  prunePossibleList() {
    // only here once we have both lists - my friends and possible friends
    if (this.myFriends.length > 0 && this.possibleFriends.length > 0) {
      // we want to remove friends from possible friends
      // console.log('before trimming possible', this.possibleFriends, this.myFriends);
      this.myFriends.forEach(frn => {
        // const index = this.possibleFriends.indexOf(frn);
        const index2 = this.possibleFriends.findIndex(i => i.userID === frn.userID);
        // console.log('remove?', frn, index2);
        if (index2 >= 0) {
          this.possibleFriends.splice(index2, 1);
          // console.log('removed');
        }
      });
      // console.log('after prunning', this.possibleFriends);
    }
    // I guess I'll do the same - remove friend requests from the list
    // part of me wants to not show possible if user has any friends or any friend requests
    this.friendRequests = this.realtimeDB.getMyFriendRequests(this.user.uid);
    // console.log('filter possible more?', this.friendRequests.length, this.possibleFriends.length);
    if (this.friendRequests.length > 0 && this.possibleFriends.length > 0) {
      // console.log('filter possible using requests');
      this.friendRequests.forEach(fr => {
        const ind = this.possibleFriends.findIndex(i => i.userID === fr.userID);
        if (ind >= 0) {
          this.possibleFriends.splice(ind, 1);
          // console.log('removed', fr, ind);
        }
      });
    }
    // console.log('filter possible even more?', this.requestsIMade.length, this.possibleFriends.length);
    if (this.requestsIMade.length > 0 && this.possibleFriends.length > 0) {
      // console.log('filter possible using requests');
      this.requestsIMade.forEach(fr => {
        const ind = this.possibleFriends.findIndex(i => i.userID === fr.userID);
        if (ind >= 0) {
          this.possibleFriends.splice(ind, 1);
          // console.log('removed', fr, ind);
        }
      });
    }
  }


  goHome() {
    this.router.navigate(['/']);
  }

  addFriend(userID: string, userEmail) {
    // console.log('friend request', userID, userEmail);
    // before adding - make sure we've not already done so - without this check I get multiple db entries
    const already = this.checkFRListForThisGuy(userID);
    if (!already) {
      // console.log('making request');
      this.realtimeDB.friendRequest(this.user.uid, userID, userEmail);
      // let's refresh screen - if user requested this from possible friends
      this.removeUserFromPossible(userID);
      this.removeUserFromSearched(userID);  // perhaps should just remove the button...
      this.addUserToRequestsIveMade(userID);
      this.zapFRLists();
    } else {
      // console.log('request already made - ignored');
      // let's get rid of the "request button"
      this.removeUserFromSearched(userID);  
    }
  }

 
  removeUserFromSearched(userID: string) {
    // for now - let's just hide the "friend request button"
    this.searchedFriends.forEach(usr => {
      if (usr.userID === userID) {
        usr.friend = true;  // small white lie - this is how we decide to show the button
      }
    });
  }

  cancelRequest(userID: string) {
    // console.log('cancel request', userID);
    const frd: FriendsRequestData = this.findRDRequestRecord(userID); // oops - opposite
    // console.log('request data', frd);
    // this.zapFRLists();
    if (frd != null) {
      this.realtimeDB.cancelFriendRequest(frd.requestingUserID, frd.userID, frd.referenceID);
    }
    this.pruneMyRequests(userID, frd); // remove this from our list
    // this.zapFRLists();
  }

  addUserToRequestsIveMade(userID: string) {

    const aUser = this.firestoreService.GetUserUsingID(userID);
    // console.log('add user to my request list', userID, aUser);
    if (aUser != null) {
      this.requestsIMade.push(aUser);
    }
    // console.log('added?', aUser, this.requestsIMade.length);
    // export class UserData {
    //   firstName = '';
    //   lastName = '';
    //   nickName = '';
    //   City = '';
    //   State = '';
    //   birthday: Timestamp = new Timestamp(0, 0);
    //   email = '';
    //   interests = '';
    //   notes = '';
    //   role = '';
    //   profilePicURL = '';
    //   userID = '';
    //   friend = false;
    // }
  }


  checkFRListForThisGuy(userID: string) {
    let found = false;
    if (this.requestsIMade.length > 0) {
      this.requestsIMade.forEach(req => {
        // console.log('checking', userID, req.userID);
        if (userID === req.userID) {
          found = true;
        }
      });
    }
    return found;
  }
  zapFRLists() {
     // try to force a reload
     const len = this.requestsIMade.length;
     for (let i = 0; i < len; i++ ) {
       this.requestsIMade.pop();
     }
     const len2 = this.allFriendRequests.length;
     for (let i2 = 0; i2 < len2; i2 ++) {
       this.allFriendRequests.pop();
     }
  }

  unFriend(userID: string) {
    // console.log('unfriend', userID);
    this.presentConfirmationDialogUnfriend(userID);
  }

  findRDRecord(userID: string): FriendsRequestData {
    let frd: FriendsRequestData = null;
    // console.log('search fr', this.allFriendRequests);
    this.allFriendRequests.forEach(req => {
      // console.log('match?', req.userID, userID);
      if (req.requestingUserID === userID) {
        frd = req;
      }
    });
    return frd;
  }
  findRDRequestRecord(userID: string): FriendsRequestData {
    let frd: FriendsRequestData = null;
    // console.log('search fr', this.allFriendRequests);
    this.allFriendRequests.forEach(req => {
      // console.log('match?', req.userID, userID);
      if (req.userID === userID) {
        frd = req;
      }
    });
    return frd;
  }

  removeUserFromFriends(userID: string) {
    if (this.myFriends.length > 0) {
      const indx = this.myFriends.findIndex(i => i.userID === userID);
      if (indx >= 0) {
        this.myFriends.splice(indx, 1);
     }
    }
  }

  removeUserFromPossible(userID: string) {
    // shorten possible list
    if (this.possibleFriends.length > 0) {
      const indx = this.possibleFriends.findIndex(i => i.userID === userID);
      if (indx >= 0) {
        this.possibleFriends.splice(indx, 1);
     }
    }
  }

  removeUserFromFR(userID: string) {
    if (this.friendRequests.length > 0) {
      const indx = this.friendRequests.findIndex(i => i.userID === userID);
      if (indx >= 0) {
        this.friendRequests.splice(indx, 1);
     }
    }
  }

  rejectFriend(userID: string) {
    // console.log('reject friend request', userID);
    const frd: FriendsRequestData = this.findRDRecord(userID);
    // console.log('request data', frd);
    if (frd != null) {
      this.realtimeDB.rejectFriendRequest(this.user.uid, userID, frd.requestingUserID);
      this.removeUserFromFriendRequestList(userID);
    }
  }



  acceptFriend(userID: string) {
    // console.log('accepting friend', userID);
    // grr - have to get reference id
    const frd: FriendsRequestData = this.findRDRecord(userID);
    // console.log('request data', frd);
    if (frd != null) {
      this.realtimeDB.acceptFriendRequest(this.user.uid, this.user.email, userID, frd.requestingUserID, frd.requestingUserEmail);
      // console.log('new friend data', this.user.uid, this.user.email, userID, frd.requestingUserID, frd.requestingUserEmail);
      this.removeUserFromFR(userID);
      this.zapFRLists();
      // console.log('removed user from FR?', this.friendRequests.length, this.friendRequests);
    }
    // this.removeUserFromFriendRequestList(userID); // hope this will force repaint
  }

  makeListOfPossibleFriends() {
    this.possibleFriends = [];
    // reworked - just for now
    if (this.allFriendsList.length > 0) {
      this.allFriendsList.forEach(fr => {
        // make sure not already a friend (and not us)
        const noUs = fr.userID !== this.user.uid;
        const notFriend = this.myFriends.findIndex(i => i.userID === fr.userID);
        const index2 = this.possibleFriends.findIndex(i => i.userID === fr.userID);
        // console.log('possible friend?', noUs, notFriend, index2);
        if (index2 < 0 && notFriend < 0 && noUs) {
          const aUser = this.firestoreService.GetUserUsingID(fr.userID);
          // console.log('possible friend??', aUser);
          if (aUser != null) {
            this.possibleFriends.push(aUser);
            // console.log('add possible', aUser, this.possibleFriends);
          }
        }
      });
    }
    // console.log('possible friends', this.allUserMessages);
    // this.allUserMessages.forEach(usr => {
    //   if (usr.userID !== this.user.uid) { // don't include ourselves
    //     const aPossible = this.firestoreService.GetUserUsingID(usr.userID);
    //     // console.log('possible', usr, aPossible);
    //     // check to make sure user's not there already
    //     let index = -1;
    //     if (this.possibleFriends.length > 0) {
    //       index = this.possibleFriends.indexOf(aPossible);
    //     }
    //     // console.log('testing friends', index);
    //     if (index < 0 && aPossible !== null) {
    //       this.possibleFriends.push(aPossible);
    //       // console.log('adding', aPossible);
    //     }
    //   }
    // });
    // console.log('have a list of possible friends', this.possibleFriends);
  }

  onSearch(ev) {
      // console.log('search?', ev, this.searchTerm, this.searchedFriends.length);
      const len = this.searchedFriends.length;
      for (let i = 0; i < len; i++) {
        this.searchedFriends.pop();
        // console.log('pop sf');
      }
      this.searchedFriends = this.firestoreService.searchForUsers(this.user.uid, this.searchTerm, false);
      // console.log('search results', this.searchedFriends);
      // let's modify the list - marking any who are already friends
      this.flagSearchedFriends();
      this.searchCount = this.searchedFriends.length;
      if (this.searchCount === 0) {
        this.searchDisplay = 'none found';
      } else {
        this.searchDisplay = this.searchCount.toString() + ' found';
      }
    }

    isMyFriend(fnd: UserData): boolean {
      let isFriend = false;
      this.myFriends.forEach(my => {
        // console.log('is friend?', my, my.userID, fnd, fnd.userID);
        if (my.userID === fnd.userID) {
          isFriend = true;
        }
      });
      return isFriend;
    }

    flagSearchedFriends() {
      if (this.searchedFriends.length > 0 && this.myFriends.length > 0) {
        this.searchedFriends.forEach(fnd => {
          if (this.isMyFriend(fnd)) {
            fnd.friend = true;
            // console.log('marked as a friend', fnd.nickName);
          } else {
            fnd.friend = false;
          }
        });
      }
      // go through requests I made as well
      if (this.requestsIMade.length > 0) {
        this.searchedFriends.forEach(fnd => {
          if (this.IRequested(fnd) === true) {
            fnd.friend = true;
          }
        });
      }
    }

    IRequested(fnd: UserData): boolean {
      let is = false;
      if (fnd != null && this.requestsIMade.length > 0) {
        // console.log('checking against requests', fnd, this.requestsIMade.length);
        this.requestsIMade.forEach(rim => {
          if (rim.userID === fnd.userID) {
            // console.log('user is already requested', fnd);
            is = true;
          }
        });
      }
      return is;
    }

    // try to make confirmation dialog??
  async presentConfirmationDialogUnfriend(userID: string) {
    const whichUser = this.firestoreService.GetUserUsingID(userID);
    if (whichUser != null) {

    }
    const msg = 'Confirm that you want to unfriend' + whichUser.nickName + ' ' + whichUser.firstName + ', ' + whichUser.lastName;
    const alert = await this.alert.create( {
      header: msg,
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
          text: 'Unfriend',
          handler: () => {
            // here's to unfriend
            // window.alert('would unfriend this clown');
            this.realtimeDB.unFriendUser(this.user.uid, userID);  // this should do it
            this.removeUserFromFriends(userID);
          }
        }
      ]
    });
    await alert.present();
  }
}
