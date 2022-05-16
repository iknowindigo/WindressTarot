import { Component, OnInit, Input } from '@angular/core';
import { TarotCard } from '../tarotCard.model';
import { TarotCardsService } from '../../services/tarot-cards.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { stringify } from 'querystring';
// import {createAnimation } from '@ionic/core';
import { AnimationController } from '@ionic/angular';


@Component({
  selector: 'app-tarot-throw',
  templateUrl: './tarot-throw.page.html',
  styleUrls: ['./tarot-throw.page.scss'],
})

export class TarotThrowPage implements OnInit {
  loadedTarotCards: TarotCard[];
  shuffledTarotDeck: TarotCard[];
  selectedSetOfCards: TarotCard[];
  numberCardsToSelect: number;
  shuffleAnimation: any;
  textForNextPosition: string;
  textForTitle: string;
  textForRay: string;



  constructor(private activatedRoute: ActivatedRoute,
              private tarotCardService: TarotCardsService,
              private alertCtrl: AlertController,
              private animateCtrl: AnimationController,
              private router: Router
    ) {
      this.textForNextPosition = '?';
    }

  ngOnInit() {
    this.loadedTarotCards = this.tarotCardService.getAllCards();
    this.shuffledTarotDeck = this.tarotCardService.getShuffledDeck();
    this.selectedSetOfCards = []; // empty list
    this.numberCardsToSelect = this.tarotCardService.getNumberCardsToSelect();
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(this.numberCardsToSelect, 0);
    // console.log('position text', this.textForNextPosition);
    // if (this.numberCardsToSelect == 1) {
    //   this.textForTitle = "Select one card: ";
    // } else if (this.numberCardsToSelect == 3) {
    //   this.textForTitle = "Select three cards: ";
    // } else {
    //   this.textForTitle = "Select eleven cards: ";
    // }
    // console.log('text', this.textForTitle, this.numberCardsToSelect);
  }

  setAllCardsFaceDown() {
    this.shuffledTarotDeck.forEach(function(card) {
      card.FaceDownImageUrl = './assets/img/mcards/extracard.jpg';
    });
  }
  ionViewDidEnter(){
    this.tarotCardService.setSocialMode(false); // 12-8 bug - need this off to see menu
    this.selectedSetOfCards = [];
    this.shuffledTarotDeck = this.tarotCardService.getShuffledDeck();
    this.setAllCardsFaceDown();
    this.numberCardsToSelect = this.tarotCardService.getNumberCardsToSelect();
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(this.numberCardsToSelect, 0);
    if (this.numberCardsToSelect === 1) {
      this.textForTitle = 'Select One Card: ';
    } else if (this.numberCardsToSelect === 3) {
      this.textForTitle = 'Select Three Cards: ';
    } else {
      this.textForTitle = ''; // there's enough info already
    }
    this.textForRay = this.tarotCardService.GetTextForRay();
    // console.log('text', this.textForTitle, this.numberCardsToSelect, this.textForRay);
    // set up shuffle animation
    const elements = document.getElementsByClassName('cardToPick'); // hoping this gets an array of all cards
    // console.log('cards?', elements, elements.length)
    this.shuffleAnimation = this.animateCtrl.create()
    .duration(1200)
    .iterations(1)
    .fromTo('transform', 'scale(0.1)', 'scale(1)')
    .fromTo('opacity', 0.0, 1.0);
    // for (var elem of elements) {
    //   this.shuffleAnimation.addElement(elem);
    // }
    for (let i = 0; i < elements.length; i++) {
      this.shuffleAnimation.addElement(elements[i]);
    }

  }

  setNumberCardsToSelect(num: number) {
    this.numberCardsToSelect = num;
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(num, 0);
    // console.log('position text', this.textForNextPosition);
  }

  // cardHasBeenPicked(card: TarotCard) :boolean {
  //   console.log('checking', card.id);
  //   // see if card is in list of selected cards
  //   this.selectedSetOfCards.forEach(function(selectedCard) {
  //     console.log('reshuffle', card.id, selectedCard.id)
  //     if (card.id == selectedCard.id) {
  //       console.log('re-pick', selectedCard);
  //       return true;
  //     }
  //   })
  //   return false;
  // }

  startOver() {
    // decided to replace the shuffle button with start over - I know there are a lot of moving parts
    // console.log('start over', this.selectedSetOfCards.length);
    const len = this.selectedSetOfCards.length;
    for (let i = 0; i < len; i++) {
      this.selectedSetOfCards.pop();
    }
    // this.selectedSetOfCards.forEach(crd => {
    //   console.log('removing', crd);
    //   this.selectedSetOfCards.pop();
    // });
    this.shuffledTarotDeck.forEach(c => {
      if (c.cardSelected === true) {
        // console.log('resetting', c);
      }
      c.cardSelected = false;
    });
    this.setAllCardsFaceDown();
    const countSelected = this.selectedSetOfCards.length;
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(this.numberCardsToSelect, countSelected);
  }

  reshuffle() {
    // this could be tricky - not sure I can force a repaint?
    // first make a list of selected cards - then get a new deck - then reselect the cards already picked
    // console.log( this.selectedSetOfCards );
    // so confused - I'll make a copy of selected cards - for some reason when I try to access the local array I get error
    const myselectedCardsIds = [];
    this.selectedSetOfCards.forEach(function(card) {
      myselectedCardsIds.push(card.id);
      // console.log(myselectedCardsIds);
    });



    this.shuffledTarotDeck = this.tarotCardService.getShuffledDeck();
    this.shuffledTarotDeck.forEach(function(card) {
      // console.log('is this picked?', card.id);
      // ? strange problem calling internal method?? - i'll try inline coding
      // let res = this.cardHasBeenPicked(card);

      myselectedCardsIds.forEach(function(thisID) {
        // console.log('testing', thisID);
        if (card.id === thisID) {
          // console.log('found one', card.id);
          card.FaceDownImageUrl = card.imageUrl;
          card.cardSelected = true;
        }
      });
    });
    this.shuffleAnimation.play();
  }

  goHome() {
    // this.router.navigate(['tarot-deck']);
    this.router.navigate(['tarot-deck']);
  }

  playClick() {
    let audio = new Audio();
    audio.src = './assets/sounds/click.wav';
    audio.load();
    audio.play();
    // console.log('click');
  }

  // -- I think it would be nice to put up a popup window showing the card picked in larger size
  // trusted tarot does this - and it gets dismissed after 6 seconds or the user touches it
  cardClicked(card: TarotCard) {
    if (card.cardSelected === true) {
      return; // can't pick same card twice
    }
    this.playClick(); // add sound
    card.cardSelected = true;
    // console.log('clicked ', this.selectedSetOfCards.length, this.numberCardsToSelect);
    if (card.cardSelected) {
      card.FaceDownImageUrl = card.imageUrl;
      this.selectedSetOfCards.push(card);

      this.alertCtrl.create({
        header: card.title,
        message: `<img src="${card.imageUrl}" class="card-alert">`,
        cssClass: 'cssPickCard',
        // message: `<img src="${card.imageUrl}" style="height: 10px;width: 10px">`,
        // message: `<img src="${card.imageUrl}" alt="g-maps" style="border-radius: 2px" width="100" height="100" crop="fill">`,
        buttons: ['']
      }).then (alertEl => {
        alertEl.present();
        setTimeout( () => {
          alertEl.dismiss();
        }, 1000);
      });
    }
    // else {
    //   // this code would allow the guy to back away from his choice - but that's not how it works
    //   // card.FaceDownImageUrl = "./assets/img/mcards/cardback.jpg";
    //   card.FaceDownImageUrl = "./assets/img/mcards/extracard.jpg";
    // }

    //

    // see if we're done
    const countSelected = this.selectedSetOfCards.length;
    this.textForNextPosition = this.tarotCardService.getTextForNextPosition(this.numberCardsToSelect, countSelected);
    // console.log('position text', this.textForNextPosition, countSelected);

    if (countSelected >= this.numberCardsToSelect)
    {
      // ? let me insert a delay
      // console.log("waiting");
      setTimeout( () => {

      }, 1000);
      // that's enough - here we'll switch to the results page
      // console.log('done');
      this.tarotCardService.setSelectedSetOfCards(this.selectedSetOfCards); // pass this along
      // move to the results page
      this.router.navigate(['tarot-results']);
      // this.router.navigate(['/results']);    //navigateByUrl('results');    //'results');
      // this.router.navigateByUrl('results').then(success => console.log('routing status:', success));
      // this.router.navigateByUrl('tarot-results').then(success => console.log('routing status:', success));
      // console.log('throw completed');
    }
    // console.log(countSelected, " cards picked");
  }
}
