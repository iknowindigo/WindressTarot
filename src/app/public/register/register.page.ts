import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  // username: string = "";
  firstName: string = "";
  lastName: string = "";
  password: string = "";
  email: string = "";
  confirmPassword: string = "";
  // bio: string = "";
  notes: string = "";
  loggedIn: boolean;
  fbUser : firebase.User;
  currentLoginName: string = "";

  allFieldsGood: boolean = false;
  showPass : boolean = false;
  public type = 'password';

  constructor(
    private authService: AuthenticationService,
    private alertCtrl: AlertController,
    private router: Router,
  ) { 
    this.loggedIn = false;
  }

  ngOnInit() {
    this.fbUser = null;
    this.loggedIn = this.authService.isUserLoggedIn();

    this.authService.eventAuthError$.subscribe(data => {
      if (data.length > 0) {
        alert(data);
      }
    })
    
    // console.log('register - user is logged in', this.loggedIn);
    if (this.loggedIn == true) {
      this.presentAlert('Please log out first', "Can't register while logged in");
    }
  }
  ionViewDidEnter(){
    const fbUser = this.authService.getCurrentFBUser();
    // console.log('pdf -> fb user', fbUser);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  // we'll just verify that all data is ready for register
  // firstName: string = "";
  // lastName: string = "";
  // password: string = "";
  // email: string = "";
  // confirmPassword: string = "";

  handleTextChange() {

    const passwordsMatch = this.password === this.confirmPassword;
    this.allFieldsGood = false;
    if (this.firstName.length > 0 
      && this.lastName.length > 0
      && this.password.length > 5
      && this.email.length > 5
      && passwordsMatch
      ) {
        this.allFieldsGood = true;
      }
    // console.log(this.allFieldsGood, this.confirmPassword, this.password);
  }

  showHidePW() {
    this.showPass = !this.showPass;
    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }

  async presentAlert(title: string, mess: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: title,
      message: mess,
      buttons: ['OK']
    });

    await alert.present();
  }

  wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
  }

  register() {
    const val = {
      firstName:  this.firstName,
      lastName: this.lastName,
      email: this.email,    // this.username,
      userPW: this.password,
      notes: this.notes // this.bio
    }
    // console.log('before sign up')
    this.authService.signUp(val);
    // console.log('after sign up');
    this.wait(7000).then(

    );
    // console.log('after wait');
    this.authService.logout();  // grr - can't figure this out

    // let fbUser = this.authService.getCurrentFBUser();
    // console.log('get usr', fbUser);
    // this.authService.setFirebaseUser(fbUser);
    // alert('thanks for signing up!');
    // this.authService.addAdminRole(this.username);  // this worked btw
    this.router.navigate(['/']);  // 'login']);  // go make them login now
  }
}
