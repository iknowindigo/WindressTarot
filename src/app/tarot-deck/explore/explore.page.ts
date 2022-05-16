import { Component, OnInit } from '@angular/core';
import { TarotCard } from '../tarotCard.model';
import { TarotCardsService } from '../../services/tarot-cards.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { AlertController } from '@ionic/angular';
import { stringify } from 'querystring';
// import {createAnimation } from '@ionic/core';
import { AnimationController } from '@ionic/angular';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalCardDisplayPage } from '../../tarot-deck/modal-card-display/modal-card-display.page';

export interface CardDetails {
  card: TarotCard;
  positionText: string;
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {
  loadedTarotCards: TarotCard[];
  shuffledTarotDeck: TarotCard[];
  displayTarotDeck: TarotCard[];
  // selectedSetOfCards: TarotCard[];
  numberCardsToSelect: number;
  shuffleAnimation: any;
  textForNextPosition: string;
  textForTitle: string;
  textForRay: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private tarotCardService: TarotCardsService,
    private alertCtrl: AlertController,
    private animateCtrl: AnimationController,
    private modalCtrl: ModalController,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.loadedTarotCards = this.tarotCardService.getAllCards();
    this.shuffledTarotDeck = this.tarotCardService.getShuffledDeck();
    this.displayTarotDeck = this.tarotCardService.getDeckByRank();
    // this.selectedSetOfCards = []; // empty list
    this.numberCardsToSelect = this.tarotCardService.getNumberCardsToSelect();
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(this.numberCardsToSelect, 0);
  }

  goHome() {
    // this.router.navigate(['tarot-deck']);
    this.router.navigate(['/']);
  }

  cardClicked(acard: TarotCard) {
    this.playClick();
    // console.log('card clicked', acard);
    const dataToShow = {
      card: acard, // card.tarotCards[whichPosition],
      positionText: 'Exploring' // this.textForEachPosition[textPosition]
    };
    this.presentModal(dataToShow);
    // card.open = true; // keep it open
    // console.log('card clicked', acard);
  }
  playClick() {
    let audio = new Audio();
    audio.src = './assets/sounds/click.wav';
    audio.load();
    audio.play();
    // console.log('click');
  }
  playGong() {
    let audio = new Audio();
    audio.src = './assets/sounds/gongish.mp3';
    audio.load();
    audio.play();
    // console.log('click');
  }

  goPent() {
    this.playGong();
    // console.log('pentacles');
    this.displayTarotDeck = this.tarotCardService.getPentacleDeck();
  }
  goSword() {
    this.playGong();
    // console.log('swords');
    this.displayTarotDeck = this.tarotCardService.getSwordsDeck();
  }
  goWands() {
    // console.log('Wands');
    this.displayTarotDeck = this.tarotCardService.getWandsDeck();
  }
  goCups() {
    this.playGong();
    // console.log('Cups');
    this.displayTarotDeck = this.tarotCardService.getCupsDeck();
  }
  goAnkhs() {
    this.playGong();
    // console.log('Ankhs');
    this.displayTarotDeck = this.tarotCardService.getAnkhsDeck();
  }
  MajorA() {
    this.playGong();
    // console.log('Major Arcana');
    this.displayTarotDeck = this.tarotCardService.getMajorArcanaDeck();
  }
  goRank() {
    this.playGong();
    // console.log('order by rank');
    this.displayTarotDeck = this.tarotCardService.getDeckByRank();
  }

  goSuit() {
    // console.log('order by suit');
  }

  goRand() {
    // console.log('random order');
  }

  async presentModal(dataToShow: CardDetails) {
    // console.log('calling modal', dataToShow);
    const modal = await this.modalCtrl.create({
      component: ModalCardDisplayPage,
      cssClass: 'modal-wrapper',  // 'my-custom-class',
      // buttons: [ {
      //   text: 'close',
      //   role: 'cancel',
      //   icon: 'close',
      //   handler: () => { console.log('canceled clicked');}
      // }]
      componentProps: { dataToShow },
      backdropDismiss: true,
      showBackdrop: false
    });
    return await modal.present();
  }

}
