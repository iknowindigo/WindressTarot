
import { Component, OnInit, NgZone } from '@angular/core';
import { TarotCard } from '../tarotCard.model'
import { TarotCardsService } from '../../services/tarot-cards.service';
import { SpiritualServiceService } from '../../services/spiritual-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service'
import { AuthenticationService } from '../../services/authentication.service';
// import { YoutubePipe } from 'src/app/youtube.pipe'
import { HttpClientModule, HttpClient } from '@angular/common/http'; 
// import {ViewController} from ‘ionic-angular’;
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, ModalController } from '@ionic/angular';
import { AnimationController } from '@ionic/angular'

@Component({
  selector: 'app-nine-ray',
  templateUrl: './nine-ray.page.html',
  styleUrls: ['./nine-ray.page.scss'],
})
export class NineRayPage implements OnInit {
  tarotDeck: TarotCard[];
  pathRay1 : string;
  pathRay2 : string;
  pathRay3 : string;
  pathRay4 : string;
  pathRay5 : string;
  pathRay6 : string;
  pathRay7 : string;
  pathRay8 : string;
  pathRay9 : string;
  beforeReadingModal : any;

  constructor(
     private modalCtrl: ModalController,
    private tarotCardService: TarotCardsService,
    private firestoreService: FirestoreService,
    private spiritualQuoteService: SpiritualServiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private ngZone: NgZone,
    private animateCtrl: AnimationController,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.pathRay1 = '../assets/img/ray1.jpg';
    this.pathRay2 = '../assets/img/ray2.jpg';
    this.pathRay3 = '../assets/img/ray3.jpg';
    this.pathRay4 = '../assets/img/ray4.jpg';
    this.pathRay5 = '../assets/img/ray5.jpg';
    this.pathRay6 = '../assets/img/ray6.jpg';
    this.pathRay7 = '../assets/img/ray7.jpg';
    this.pathRay8 = '../assets/img/ray8.jpg';
    this.pathRay9 = '../assets/img/ray9.jpg';
  }

  goHome() {
    this.router.navigate(['/']);
  }

  async tryToDismissBeforeReading() {
    // this.makeEverythingOpaqueAgain();
    // console.log('try to dismiss?')
    const modal = await this.modalCtrl.getTop();
    if (modal != null && modal != undefined) {
      modal.dismiss();
      // console.log('dismissed modal')
      // this.fadeUpAnimation.play();  // bring everything back to visible
    }   
  }

  abc() {
    // console.log('main - dealThreeCards');
    this.tryToDismissBeforeReading(); // try to kill previous modal
    // this.fadeAnimation.play();
    this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
    .then( (val) => {
      // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
      // console.log('prepare ', this.beforeReadingModal )
      this.tarotCardService.shuffleCards();
      this.tarotCardService.setNumberCardsToSelect(3);  // once this many cards have been selected - we'll move on
      // this.router.navigateByUrl('throw');
      // this.router.navigate(['throw'])
    });
  }

  commonRayLogic(rayNumber: number) {
    this.tryToDismissBeforeReading(); // try to kill previous modal

    this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
    .then( (val) => {
      // console.log('common Ray logic ', this.beforeReadingModal, rayNumber )
      // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
      // this.tarotCardService.dealOneCard();
      this.tarotCardService.shuffleCards();
      this.tarotCardService.setNumberCardsToSelect(11);  // once this many cards have been selected - we'll move on
      this.tarotCardService.setRayOfThrow(rayNumber);       // 8-20 new
      this.tarotCardService.GetTextForRay();  // testing

      // testing
      this.tarotCardService.getThrowType();
      // console.log('testing throw type', throwT);
      // this.router.navigate(['throw'])
     }); 
  }

  Ray1() {
    // console.log('ray 1');
    // console.log('main - dealPyramidThrow');
    this.commonRayLogic(1);
    // this.makeEverythingOpaqueAgain();
    // this.fadeAnimation.play();
    // this.tryToDismissBeforeReading(); // try to kill previous modal

    // this.beforeReadingModal  = this.tarotCardService.prepareYourselfBeforeReading()
    // .then( (val) => {
    //   console.log('prepare ', this.beforeReadingModal )
    //   // this.tarotCardService.prepareYourselfBeforeReading(); // g.s.7-8
    //   // this.tarotCardService.dealOneCard();
    //   this.tarotCardService.shuffleCards();
    //   this.tarotCardService.setNumberCardsToSelect(11);  // once this many cards have been selected - we'll move on
    //   this.tarotCardService.setRayOfThrow(1);       // 8-20 new
    //   // this.router.navigate(['throw'])
    //  }); 
  }
  Ray2() {
    // console.log('ray 2');
    this.commonRayLogic(2);
  }
  Ray3() {
    // console.log('ray 3');
    this.commonRayLogic(3);
  }
  Ray4() {
    // console.log('ray 4');
    this.commonRayLogic(4);
  }
  Ray5() {
    // console.log('ray 5');
    this.commonRayLogic(5);
  }
  Ray6() {
    // console.log('ray 6');
    this.commonRayLogic(6);
  }
  Ray7() {
    // console.log('ray 7');
    this.commonRayLogic(7);
  }
  Ray8() {
    // console.log('ray 8');
    this.commonRayLogic(8);
  }
  Ray9() {
    // console.log('ray 9');
    this.commonRayLogic(9);
  }
}
