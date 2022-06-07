import { Injectable } from '@angular/core';
import { BehaviorSubject, merge } from 'rxjs';
// import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorageModule, AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { async } from '@angular/core/testing';
import { NavController, AlertController } from '@ionic/angular';
import { TarotCardsService } from '../services/tarot-cards.service';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { FirestoreService, UserData } from '../services/firestore.service';
import { timestamp } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { analytics } from 'firebase';

const TOKEN_KEY = 'auth-token';
const USER_NAME_PW = 'user-name-pw';
const FIREBASE_USER = 'firebase-user';


 // I guess I'll make it so you first
 // updated - 6/30
export interface UserNamePW {
  firstName: string;
  lastName: string;
  email: string;
  userPW: string;
  notes: string;
}

export class ProfileUserData {
      firstName = '';
      lastName = '';
      nickName = '';
      Email = '';
      interests = '';
      City = '';
      State = '';
      birthday: Timestamp = new Timestamp(0, 0);
      profilePicURL = '';
      dcFriends: Timestamp = new Timestamp(0, 0);
      dcReadings: Timestamp = new Timestamp(0,0);
      dcComments: Timestamp = new Timestamp(0,0);
        // dateCheckFriends: usr.data().dcFriends,
          // dateCheckReadings: usr.data().dcReadings,
          // dateCheckComments: usr.data().dcComments,
}


@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userID: string;
  fbUser: firebase.User;
  userIsAdmin: boolean;
  userIsLoggedIn: boolean;
  authenticationState = new BehaviorSubject(false);
  private eventAuthError = new BehaviorSubject<string>('');
  profilePicState = new BehaviorSubject<string>('');  // hope this will help update page
  eventAuthError$ = this.eventAuthError.asObservable();
  myMetaData: ProfileUserData;
  shownLandingPage: boolean;
  landingUp: boolean;


  constructor(
    // private storage: Storage,
    private plt: Platform,
    public db: AngularFirestore,
    private fireFunctions: AngularFireFunctions,
    public angularFireAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private storage: AngularFireStorage,
    private tarotCardService: TarotCardsService,
    ) {
      this.landingUp = false; // 11-24 seem to be putting two up
      this.shownLandingPage = false;
      this.plt.ready().then( () => {
            this.checkToken();
            });
      this.userID = '';
      this.fbUser = null;
      this.userIsAdmin = false;
      this.userIsLoggedIn = false;
      this.myMetaData = new ProfileUserData();

      // console.log('auth: logged in', this.userIsLoggedIn);
     }

     setMyUserMetadata(myData: UserData) {
      this.myMetaData.firstName = myData.firstName;
      this.myMetaData.lastName = myData.lastName;
      this.myMetaData.birthday = myData.birthday;
      this.myMetaData.nickName = myData.nickName;
      this.myMetaData.City = myData.City;
      this.myMetaData.State = myData.State;
      this.myMetaData.Email = myData.email;
      this.myMetaData.interests = myData.interests;
      this.myMetaData.profilePicURL = myData.profilePicURL;
      // 5/7/22
      this.myMetaData.dcFriends = myData.dateCheckFriends;
      this.myMetaData.dcReadings = myData.dateCheckReadings;
      this.myMetaData.dcComments = myData.dateCheckComments;

     }


     signUp(userInfo: UserNamePW) {
      // console.log('sign up', userInfo);
      this.angularFireAuth.createUserWithEmailAndPassword(userInfo.email, userInfo.userPW).then(cred => {
        // console.log('signup', cred);
        cred.user.updateProfile( {
          displayName: userInfo.firstName + ' ' + userInfo.lastName
        });
        this.setFirebaseUser(cred.user);  // we weren't doing this?
        this.fbUser = cred.user;
        this.setUserNameAndPW(userInfo).then( (res) => {
                 // now create a user record for profile
        this.db.collection('users').doc(cred.user.uid).set( {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          notes: userInfo.notes,
          email: userInfo.email,
          role: 'network user'
          });
        });  // remember it
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        console.log('error', console.error, errorCode, errorMessage);
        // this.eventAuthError.next(error);
      });
     }


  async presentAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: title,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

    login(userInfo: UserNamePW): firebase.User {    // boolean {
      // console.log('sign in', userInfo);
      let theUser: firebase.User = null;
      this.angularFireAuth.signInWithEmailAndPassword(userInfo.email, userInfo.userPW).then(cred => {
         console.log('login auth', cred);
        this.setUserNameAndPW(userInfo).then ( (res) => {
       // this.storage.set(TOKEN_KEY, userInfo.userName).then(res => {
         // 5-14-22 trying to debug - pretend I'm Jerry
        //  cred.user.uid = '5HGPCvdp2ZSq5LaMiPVrkqqdA0C2';  // this is Jerry's ID
          this.authenticationState.next(true);
          this.setFirebaseUser(cred.user);
          theUser = cred.user;
          this.userIsLoggedIn = true;
          // console.log('login was good');
          return true;
        }).catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
          console.log('error', console.error, errorCode, errorMessage);
          // this.eventAuthError.next(error);
        });

      // })
    }).catch( function(error) {
      console.log('bad login');
      // this.presentAlert("Login failed",  'bad combination of email and password?  Try again!');
      alert('Login failed - bad combination of email and password?  Try again!');
      return null;
    });
      console.log('why login is here?');
      return theUser;  // true;  // ??
  }

    logout() {
      // console.log('log out');
      this.angularFireAuth.signOut().then( () => {
        // console.log('logout');
      });
      this.authenticationState.next(false);  // this.angularFireAuth.currentUser != null);
      this.userIsLoggedIn = false;
      this.fbUser = null;
      // return this.storage.remove(TOKEN_KEY).then(() => {
      //   this.authenticationState.next(false);
      // });
    }

    isUserAdmin(): boolean {
      // console.log('is user admin?', this.userIsAdmin);
      return this.userIsAdmin;
    }


     isUserLoggedIn(): boolean {
      //  console.log('au-serve: is user?', this.userIsLoggedIn);
       return this.userIsLoggedIn;
     }


    addAdminRole(email: string) {
      const fnAddAdminRole = this.fireFunctions.httpsCallable('addAdminRole');
      fnAddAdminRole({email}).subscribe(result => {
        console.log(result);
      });
    }

    async addPremiumUserRole(email: string) {
      const fnAddPremiumRole = this.fireFunctions.httpsCallable('addPremiumRole');
      fnAddPremiumRole({email}).subscribe(result => {
        console.log(result);
      });
    }

    async addPremiumUserPaidUpRole(email: string) {
      const fnAddPremiumPaidUpRole = this.fireFunctions.httpsCallable('addPremiumPaidUpRole');
      fnAddPremiumPaidUpRole({email}).subscribe(result => {
        console.log(result);
      });
    }

    setFirebaseUser(user: firebase.User) {
      const val = JSON.stringify(user);
      this.userID = user.uid;
      this.fbUser = user;

      // console.log('set user', this.userID, this.fbUser);
      // return this.storage.set(FIREBASE_USER, val);
    }

    async getFirebaseUser(): Promise<firebase.User>  {
      // 5-14-22 hack
      
   //  this.fbUser.uid = '5HGPCvdp2ZSq5LaMiPVrkqqdA0C2';
       console.log('get fb user - entry', this.fbUser);
      // await this.storage.get(FIREBASE_USER).then ( (info) => {
      //     let val = JSON.parse(info);
      //     this.fbUser = val;
      //     // console.log('get user from storage', this.angularFireAuth.currentUser, this.fbUser);
      //     if (val != null) {
      //       this.userIsLoggedIn = true;
      //       // console.log('get user->set');
      //       // this.setFirebaseUser(this.fbUser);
      //     }
      //     console.log('get fb user', val);
      //     return val;
      //   }).catch (err => {
      //     console.log('get fb err', err);
      //   })
        // console.log('get user', this.angularFireAuth.currentUser, this.fbUser);
        if (this.fbUser == null) {
        this.userIsLoggedIn = false;
      } else if (this.fbUser.uid != null ){
        this.userIsLoggedIn = true;
      }
        // console.log('get fb user 2', this.fbUser);
        
        return this.fbUser;

      // this.storage.get(FIREBASE_USER).then ( (info) => {
      //   let val = JSON.parse(info);
      //   console.log(val);
      //   return val;
      // })
      // return null;
    }



     // this doesn't work - let's make it async
     public getUserNPW = async (): Promise<UserNamePW> => {
      //  if (this.userIsLoggedIn) {
      //    await this.storage.get(USER_NAME_PW).then ( (info) => {
      //      let val = JSON.parse(info);
      //      console.log('async get user ', val);
      //       return val;
      //    }).catch(err => console.log('getunp', err));
      //  }
       console.log('async get - failed');
       return null;
     }

     public getCurrentFBUser(): firebase.User {
      //  console.log('get fb user', this.fbUser);
       return this.fbUser;
     }

     getUserNameAndPW(): UserNamePW {
      //  if (this.userIsLoggedIn == true) {
      //   this.storage.get(USER_NAME_PW).then ( (info) => {
      //     let val = JSON.parse(info);
      //     console.log('get user', info, val);
      //     return val;
      //  })
      //  }

       return null;
     }


    isAuthenticated(): boolean {
      // this.angularFireAuth.onAuthStateChanged( (user) => {
      //   this.authenticationState.next(user != null);
      // })
      // console.log('is auth?');
      let unsubscribe;
      unsubscribe = this.angularFireAuth.onAuthStateChanged( (user) => {
        if (user != null && user.uid != null) {
          this.userIsLoggedIn = true;
          this.setFirebaseUser(user);
          // console.log('auth state changed -> set user', user, user.uid);
          user.getIdTokenResult().then(idTokenResult => {
            // console.log('user is admin?', idTokenResult.claims.admin, idTokenResult.claims);
            if (idTokenResult.claims.admin) {
              this.userIsAdmin = true;  // elevated rights
            }
           });
        } else {
          this.userIsLoggedIn = false;
        }
        // console.log(user, 'on auth changed - logged in', this.userIsLoggedIn, user, user != null ? user.uid : 'null');
        this.fbUser = user;
        this.authenticationState.next(!!user);
      });
      // console.log('auth=', this.authenticationState.value, this.angularFireAuth.currentUser);
        // unsubscribe();  // stop
      return this.authenticationState.value;
      // return this.authenticationState.value;
    }

    checkToken() {
      if (this.isAuthenticated() === true) {
        this.authenticationState.next(true);
      }

      // return this.storage.get(TOKEN_KEY).then( res => {
      //   if (res) {
      //     this.authenticationState.next(true);
      //   }
      // })

    }

    async setUserNameAndPW(userInfo: UserNamePW)
    {
       const val = JSON.stringify(userInfo);
      //  console.log('set user', val, userInfo);
       // return this.storage.set(USER_NAME_PW, val);
    }

    async uploadProfileFile(f: any, type: string, ext: string): Promise< string> {
      // console.log('upload', f, type, ext);
      let fileRef: firebase.storage.Reference = null;
      const realData = f.split(',')[1];
      // console.log('better?', realData);
      // const fileBlob = new Blob([f], {type});
      // const fileBlob = new Blob([realData], {type});
      // console.log('upload', fileBlob, type, ext);
      const randId = this.tarotCardService.getRandomInt(0, 64000);
      let downloadURL = '';

      const path = `files/${new Date().getTime()}_${randId}${ext}`; // probably will have a path for each user?
      const ref = this.storage.ref(path);
      // boy - after days of trying - this finally works
      // had to use put string - and tell it base64, but strip off the prefix: data:image/jpeg;base64,
      const uploadTask = this.storage.ref(path).putString(realData, 'base64'); // , {contentType: type} );

      // const uploadTask = this.storage.upload(`files/${new Date().getTime()}_${randId}${ext}`, fileBlob);
      uploadTask.percentageChanges().subscribe(changes => {
        // console.log('uploading', changes);
      });
      uploadTask.then(async res => {
        // console.log('done?', res);
        fileRef = (await uploadTask).ref;
        downloadURL = await fileRef.getDownloadURL();
      })
      .then( async () => {
        downloadURL = await fileRef.getDownloadURL();
        // console.log('finally done?', downloadURL);
        // sigh - this is how we actually set the pic - :(
        if (downloadURL.length > 0) {
          this.setUserProfilePic(downloadURL);
          this.profilePicState.next(downloadURL); // tell our subscribers
        }
        return downloadURL;
      });
      // console.log('early return?', downloadURL);
      return '';
    }



    async setUserProfilePic(downloadURL: string) {
      // let picStoreRef = firebase.storage().ref("picuploads" + this.userID + "/avatar.jpg");
      // this.angularFireAuth.updateCurrentUser.

      const dispName =  this.fbUser.displayName != null ? this.fbUser.displayName : this.fbUser.email;

      // console.log('update user profile - name and photo', downloadURL, dispName, this.myMetaData);
      this.fbUser.updateProfile( {
        displayName: dispName,
        photoURL: downloadURL
      });
      // let's update metadata while we're here
      const data = {
        profilePicURL: downloadURL,
        email: this.fbUser.email,
      };
      if (this.myMetaData.firstName.length > 0) {
        // use metadata - this is a horrible kludge
        const moreData = {
          profilePicURL: downloadURL,
          email: this.fbUser.email,
          firstName: this.myMetaData.firstName,
          lastName: this.myMetaData.lastName,
          nickName: this.myMetaData.nickName,
          birthday: this.myMetaData.birthday,
          dcFriends: this.myMetaData.dcFriends,
          dcReadings: this.myMetaData.dcReadings,
          dcComments: this.myMetaData.dcComments,
          // dateCheckFriends: usr.data().dcFriends,
          // dateCheckReadings: usr.data().dcReadings,
          // dateCheckComments: usr.data().dcComments,
          interests: this.myMetaData.interests,
          City: this.myMetaData.City,
          State: this.myMetaData.State
        };
        // console.log('update db more', moreData);
        this.updateUserMetadata(this.fbUser.uid, moreData);
      } else {
        this.updateUserMetadata(this.fbUser.uid, data);
      }
    }

    async updateUserProfileData(data: any) {
      // console.log('auth - update user', this.fbUser.uid);
      // ?? this suddenly looks wrong??  Should point to 'users' ???
      this.updateUserMetadata(this.fbUser.uid, data); // try using another method??

      // const userRef = this.db.doc(this.fbUser.uid);
      // userRef.update(data)    // .set({data, merge: true} )    //
      // // userRef.set( data, {merge: true})
      // .then(() => {
      //   console.log('updated user', data);
      // })
      // .catch( (err) => {
      //   console.log('error update', err);
      // });
    }


  async updateUserMetadata(userID: string, data: any) {
    // console.log('update user metadata', userID, data);
    this.db.collection('users').doc(userID).update( data )   // caller has to format things correctly -
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      console.log('error', console.error, errorCode, errorMessage);
      // a little risky - but I think these are legacy folks
      // let's just create a record
      if (this.fbUser != null) {

        this.db.collection('users').doc(this.fbUser.uid).set( {
          firstName: '',
          lastName: this.fbUser.email,
          notes: '',
          email: this.fbUser.email,
          role: 'network user'
          });
      }

      // this.eventAuthError.next(error);
    });
  }

  LogUserIn(usr: firebase.User) {
    // let's update our record - we could update login time, and previous login
    // console.log('login?', usr);
    // first get and then update our record
    const myRef =     this.db.collection('users').doc(usr.uid);
    myRef.get()
    .toPromise()
    .then( (snapShot) => {
      // console.log('checking login', snapShot);
      const fn = snapShot.data()?.firstName;
      const ln = snapShot.data()?.lastName;
      const nn = snapShot.data()?.nickName;
      // const ok = snapShot.data().firstName ?? snapShot.data().lastName;

      if (fn === undefined || ln === undefined || nn === undefined) {
        console.log('login bad');
      // if (snapShot.data().firstName === undefined || snapShot.data().lastName === undefined || snapShot.data().nickName === undefined) {
        // I suspect this is a legacy login - but let's fill some stuff out here
        const data = {
          firstName: '',
          lastName: usr.email,
          nickName: usr.email,
          email: usr.email,
          interests: '',
          City: '',
          State: '',
          // profilePicURL: ''
        };
        this.updateUserMetadata(usr.uid, data);
      } else {
          // console.log('have good login data', snapShot.data().firstName, snapShot.data().nickName);
        }
    })
    .catch((error) => {
      console.log('error getting user data');
    });
  }

  // 11/6 use service to pass data
  setShownLandingPage(shownit: boolean) {
    // console.log('auth: show landing page', shownit);
    this.shownLandingPage = shownit;
  }
  getShownLandingPage() {
    // console.log('auth: get shown landing', this.shownLandingPage);
    return this.shownLandingPage;
  }

  setLandingUp(itIsUp: boolean) {
    this.landingUp = itIsUp;
    // console.log('landing is up', itIsUp);
  }
  getLandingUp(): boolean {
    // console.log('is landing up?', this.landingUp);
    return this.landingUp;
  }
}
