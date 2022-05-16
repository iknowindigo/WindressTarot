import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  img1url: string;
  img2url: string;
  img3url: string;

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.img1url = '../assets/img/mcards/2m.jpg';

  }

  async ngOnInit() {
    const isUp = this.authService.getLandingUp();
    if (isUp) {
      await this.modalCtrl.dismiss();
    } else {
      this.authService.setLandingUp(true);
    }
  }

  async close() {
    await this.modalCtrl.dismiss();
    this.authService.setLandingUp(false);
  }

  async login() {
    // first dismiss modal - then login
    await this.modalCtrl.dismiss();
    this.authService.setShownLandingPage(true);
    this.authService.setLandingUp(false);
    this.router.navigate(['login']);  // navigateByUrl('login');
  }

  async register() {
    // await this.modalCtrl.dismiss();
    this.authService.setShownLandingPage(true);
    this.authService.setLandingUp(false);
    await this.modalCtrl.dismiss().finally( () => {
      this.router.navigate(['register']);
    });
  }
}
