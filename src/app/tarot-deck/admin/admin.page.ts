import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service'
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  userIsAdmin : boolean;
  userIsPremium: boolean;
  userPaidUp: boolean;
  loggedIn: boolean;
  email: string;
  premiumEmail: string;
  adminEmail: string;
  userList : [];


  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit() {
    this.premiumEmail = "";
    this.email = "";
    this.adminEmail = "";
  }

  async ionViewDidEnter() {
    this.loggedIn = this.authService.isUserLoggedIn();
    this.userIsAdmin = this.authService.isUserAdmin(); 
    // await this.firestoreService.getListOfUsers().then (userList => this.userList = userList);
    console.log('admin-users', this.userList);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  makeUserAdmin() {
    console.log('make admin', this.adminEmail);
  }

  makeUserPremiumUser() {
    console.log('make premium user', this.premiumEmail);
  }

  payUpPremiumUser() {
    console.log('premium user now paid up', this.adminEmail);
  }

  userOwesUsMoney() {
    console.log('premium user now owes us money', this.adminEmail);
  }
}
