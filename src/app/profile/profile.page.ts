import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, ProfileUserData } from '../services/authentication.service';
import { FirestoreService, UserData } from '../services/firestore.service';
import { AlertController } from '@ionic/angular';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  genericImgUrl: string;
  myFile: File;
  convertedImageUrl: any;
  user: firebase.User;
  userProfileURL: string;
  firstName: string;
  lastName: string;
  nickName: string;
  Email: string;
  interests: string;
  city: string;
  state: string;
  birthday: Timestamp;
  updateEnabled: boolean;
  userDataList: UserData[];
  ourUser: UserData;
  profileFileName: string;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private firestoreServe: FirestoreService
  ) {
    this.genericImgUrl = '../assets/img/persons.png';
    this.convertedImageUrl = null;
    this.user = null;
    this.firstName = '';
    this.lastName = '';
    this.nickName = '';
    this.Email = '';
    this.interests = '';
    this.city = '';
    this.state = '';
    this.birthday = new Timestamp(0, 0);
    this.updateEnabled = false;
    this.ourUser = null;
    this.profileFileName = '-';
  }

  async ngOnInit() {
    this.user = this.authService.getCurrentFBUser();
    this.ourUser = this.firestoreServe.getUserUsingEmail(this.user.email);
    console.log('did we get our users?', this.ourUser); // I commented out a read call
    // commenting this call out - I exceeded my read quota - should only need to call this once per session
    // this.firestoreServe.getUsers().then(data => {
    //   this.ourUser = this.firestoreServe.getUserUsingEmail(this.user.email);
    //   // console.log('getting user 2', this.ourUser);
    // })
    // .finally( () => {
    //   if (this.user !== null) {
    //     this.ourUser = this.firestoreServe.getUserUsingEmail(this.user.email);
    //     // console.log('getting user', this.ourUser);
    //   }
    // });
    this.userProfileURL = this.user != null && this.user.photoURL != null ? this.user.photoURL : this.genericImgUrl;
    if (this.user != null) {
      // console.log('on init - user', this.user, this.user.photoURL, this.userProfileURL);
    }
// try to see when user changes profile pic
    this.authService.profilePicState.subscribe(state => {
      // console.log('profile pic subscribe', state);
      const downloadURL = state;
      if (downloadURL.length > 0) {
        this.authService.setUserProfilePic(downloadURL);
        this.user = this.authService.getCurrentFBUser();
        // trying to force page to refresh
        this.userProfileURL = this.genericImgUrl;
        // await new Promise(resolve => setTimeout(resolve, 3000));
        this.userProfileURL = this.user != null && this.user.photoURL != null ? this.user.photoURL : this.genericImgUrl;
        // console.log('new user pic', this.user, this.userProfileURL);
      }
    });

    this.firestoreServe.usersReadyState.subscribe(state => {
      // console.log('subscribe users', state, this.ourUser);
      if (this.user != null && state > 0) {
        this.userDataList = this.firestoreServe.getListOfUsers();
        // console.log('user list', this.userDataList);
        this.ourUser = this.firestoreServe.getUserUsingEmail(this.user.email);
        if (this.userDataList.length && this.user != null) {
          this.findMyMetaData(this.user);
        }
        // fill out our data
        if (this.ourUser != null) {
          this.firstName = this.ourUser.firstName;
          this.lastName = this.ourUser.lastName;
          this.nickName = this.ourUser.nickName;
          this.Email = this.ourUser.email;
          this.interests = this.ourUser.interests;
          this.city = this.ourUser.City;
          this.state = this.ourUser.State;
          this.birthday = this.ourUser.birthday;
        }
      }
    });
  }

// copied from social - should go into a serive
findMyMetaData(user: firebase.User) {
  if (this.userDataList.length) {
    // console.log('find my metadata', user.uid);
    this.userDataList.forEach((usr) => {
      // console.log('user match?', usr.userID, user.uid);
      if (usr.userID === user.uid) {
        // console.log('found meta data', usr);
        this.authService.setMyUserMetadata(usr);
      }
    });
  }
}

  goHome() {

    this.router.navigate(['/']);

    // let reader = new FileReader();

  }

  editProfilePic() {

  }

  handleTextChange() {

    // our job is to enable the update profile button
    this.updateEnabled = false;
    if (this.firstName.length > 0
      && this.lastName.length > 0
      && this.nickName.length > 0
      // && this.Email.length > 0
      // && this.interests.length > 0
      // && this.city.length > 0
      // && this.state.length > 0
      // && this.birthday.length > 0
      ) {
        this.updateEnabled = true;
      }
    // console.log('input', this.firstName, this.lastName, this.interests, this.birthday, this.city, this.state, this.updateEnabled);
  }

  verifyFileIsImage(type: string): boolean {
    let pass = false;
    // console.log('verify type', type);
    switch (type) {
      case ('image/jpeg'): {
        pass = true;
        break;
      }
      case ('image/png'): {
        pass = true;
        break;
      }
    }
    // console.log('pass?', pass);
    return pass;
  }

  async presentAlert(mess: string, subT: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Attention',
      subHeader: subT,
      message: mess,
      buttons: ['OK']
    });

    await alert.present();
  }

  profileFileUpload($event) {
    this.myFile = $event.target.files[0];
    // this.profileFileName = this.myFile.name;

    // console.log('file upload', this.profileFileName, $event.target.files[0], this.myFile);
    const reader = new FileReader();
    reader.addEventListener('load', async () =>  {
      // this.convertedImageUrl = 'data:image/jpeg;base64,' + reader.result;
      this.convertedImageUrl =  reader.result;
      // console.log('reader', this.convertedImageUrl, reader.result);
      // this.authService.setUserProfilePic(this.convertedImageUrl);
      const ext = '.' + this.myFile.name.split('.').pop();
      let downloadURL = '';
      const pass = this.verifyFileIsImage(this.myFile.type);
      if (!pass) {
        // alert('pick an image - jpg or png')
        this.presentAlert('Pick an image - jpg or png supported','Try again');
        return; // not sure if I should put up warning..
      }

      // let's limit how big a file we allow the user
      // console.log('size', this.myFile.size);
      if (this.myFile.size > 8000000) { // totally arbitraty
        // alert('pick a smaller file');
        this.presentAlert('Pick a smaller image, limit is 80 mb for now', 'Try again');
        return;
      }

      // return;

      await   this.authService.uploadProfileFile(this.convertedImageUrl, this.myFile.type, ext)
      .then(ref => {
        // console.log('set profile - url', ref);
        downloadURL = ref;
        // this.authService.setUserProfilePic(ref);
      })
      .finally( async () => {
        this.profileFileName = this.myFile.name;
        // console.log('setting profile pic ->', this.userProfileURL, downloadURL);
        this.presentAlert('Profile picture has changed - but page does not refresh - sorry', 'I am working to fix this :)');
        // I don't think the following code is ever called...
        if (downloadURL.length > 0) {
          this.authService.setUserProfilePic(downloadURL);
          this.user = this.authService.getCurrentFBUser();
          // trying to force page to refresh
          this.userProfileURL = this.genericImgUrl;
          await new Promise(resolve => setTimeout(resolve, 3000));
          this.userProfileURL = this.user != null && this.user.photoURL != null ? this.user.photoURL : this.genericImgUrl;
          // console.log('new user pic', this.user, this.userProfileURL);
          // let's update the user's metadata with the url
          const data = {
            profilePicURL: this.userProfileURL
          };
          // this.firestoreServe.updateUserMetadata(this.user.uid, data);
        }
      });
    });
    reader.readAsDataURL(this.myFile);
    // console.log('reader', reader, reader.result, reader.result.toString);


    // reader.addEventListener("load", function() {
    //   let stuff = reader.result;
    //   console.log('?', stuff)
    // }, false)
  }

  // here's the call to update everything
  updateProfileData() {
    // console.log('updating everything except profile pic',
    // this.firstName,
    // this.lastName,
    // this.nickName,
    // this.Email,
    // this.interests,
    // this.city,
    // this.state,
    // this.birthday
    // );
    const data: ProfileUserData = {
      firstName: this.firstName,
      lastName: this.lastName,
      nickName: this.nickName,
      Email: this.Email,
      interests: this.interests,
      City: this.city,
      State: this.state,
      birthday: this.birthday,
      profilePicURL: this.userProfileURL,
      dcComments: Timestamp.fromDate(new Date("May 5, 2020")), // really old
      dcFriends: Timestamp.fromDate(new Date("May 5, 2020")), // really old
      dcReadings: Timestamp.fromDate(new Date("May 5, 2020")), // really old
    };
    this.authService.updateUserProfileData(data);
    // this.authService.addAdminRole(this.Email);  // this worked btw
    // this.authService.addPremiumUserPaidUpRole(this.Email);
  }
}
