import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FirestoreService } from  '../../services/firestore.service'

@Component({
  selector: 'app-card-search',
  templateUrl: './card-search.component.html',
  styleUrls: ['./card-search.component.scss'],
})
export class CardSearchComponent implements OnInit {
  textForLowerDropdown : string [];
  selectedCard : string;  // in code
  indexSuit : number;
  indexCard : number;
  enableSearch : boolean;

  constructor(
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
  ) { 
    this.textForLowerDropdown = [];
    // load up lower text for first suit - but we want them to pick upper first
    // this.fillTextForPentacles();
    this.textForLowerDropdown.push('Select Suit First...')
    this.enableSearch = false;   
  }
 
  ngOnInit() {}

  async close(data:any) {
    await this.modalCtrl.dismiss(data);
  }

  zapText() {
    let len = this.textForLowerDropdown.length;
    for (let i=0; i < len; i++) {
      this.textForLowerDropdown.pop();
      // console.log('pop fill');
    }
  }
  fillTextForPentacles() {
    this.zapText();

    this.textForLowerDropdown.push('Ace of Pentacles');
    this.textForLowerDropdown.push('Two of Pentacles');
    this.textForLowerDropdown.push('Three of Pentacles');
    this.textForLowerDropdown.push('Four of Pentacles');
    this.textForLowerDropdown.push('Five of Pentacles');
    this.textForLowerDropdown.push('Six of Pentacles');
    this.textForLowerDropdown.push('Seven of Pentacles');
    this.textForLowerDropdown.push('Eight of Pentacles');
    this.textForLowerDropdown.push('Nine of Pentacles');
    this.textForLowerDropdown.push('Ten of Pentacles');
    this.textForLowerDropdown.push('Page of Pentacles');
    this.textForLowerDropdown.push('Knight of Pentacles');
    this.textForLowerDropdown.push('Queen of Pentacles');
    this.textForLowerDropdown.push('King of Pentacles');
  }

  fillTextForSwords() {
    this.zapText();

    this.textForLowerDropdown.push('Ace of Swords');
    this.textForLowerDropdown.push('Two of Swords');
    this.textForLowerDropdown.push('Three of Swords');
    this.textForLowerDropdown.push('Four of Swords');
    this.textForLowerDropdown.push('Five of Swords');
    this.textForLowerDropdown.push('Six of Swords');
    this.textForLowerDropdown.push('Seven of Swords');
    this.textForLowerDropdown.push('Eight of Swords');
    this.textForLowerDropdown.push('Nine of Swords');
    this.textForLowerDropdown.push('Ten of Swords');
    this.textForLowerDropdown.push('Page of Swords');
    this.textForLowerDropdown.push('Knight of Swords');
    this.textForLowerDropdown.push('Queen of Swords');
    this.textForLowerDropdown.push('King of Swords');
  }

  fillTextForWands() {
    this.zapText();

    this.textForLowerDropdown.push('Ace of Wands');
    this.textForLowerDropdown.push('Two of Wands');
    this.textForLowerDropdown.push('Three of Wands');
    this.textForLowerDropdown.push('Four of Wands');
    this.textForLowerDropdown.push('Five of Wands');
    this.textForLowerDropdown.push('Six of Wands');
    this.textForLowerDropdown.push('Seven of Wands');
    this.textForLowerDropdown.push('Eight of Wands');
    this.textForLowerDropdown.push('Nine of Wands');
    this.textForLowerDropdown.push('Ten of Wands');
    this.textForLowerDropdown.push('Page of Wands');
    this.textForLowerDropdown.push('Knight of Wands');
    this.textForLowerDropdown.push('Queen of Wands');
    this.textForLowerDropdown.push('King of Wands');
  }

  fillTextForCups() {
    this.zapText();

    this.textForLowerDropdown.push('Ace of Cups');
    this.textForLowerDropdown.push('Two of Cups');
    this.textForLowerDropdown.push('Three of Cups');
    this.textForLowerDropdown.push('Four of Cups');
    this.textForLowerDropdown.push('Five of Cups');
    this.textForLowerDropdown.push('Six of Cups');
    this.textForLowerDropdown.push('Seven of Cups');
    this.textForLowerDropdown.push('Eight of Cups');
    this.textForLowerDropdown.push('Nine of Cups');
    this.textForLowerDropdown.push('Ten of Cups');
    this.textForLowerDropdown.push('Page of Cups');
    this.textForLowerDropdown.push('Knight of Cups');
    this.textForLowerDropdown.push('Queen of Cups');
    this.textForLowerDropdown.push('King of Cups');
  }

  fillTextForAnkhs() {
    this.zapText();

    this.textForLowerDropdown.push('Ace of Ankhs');
    this.textForLowerDropdown.push('Two of Ankhs');
    this.textForLowerDropdown.push('Three of Ankhs');
    this.textForLowerDropdown.push('Four of Ankhs');
    this.textForLowerDropdown.push('Five of Ankhs');
    this.textForLowerDropdown.push('Six of Ankhs');
    this.textForLowerDropdown.push('Seven of Ankhs');
    this.textForLowerDropdown.push('Eight of Ankhs');
    this.textForLowerDropdown.push('Nine of Ankhs');
    this.textForLowerDropdown.push('Ten of Ankhs');
    this.textForLowerDropdown.push('Page of Ankhs');
    this.textForLowerDropdown.push('Knight of Ankhs');
    this.textForLowerDropdown.push('Queen of Ankhs');
    this.textForLowerDropdown.push('King of Ankhs');
  }

  fillTextForMajorArcana() {
    this.zapText();

    this.textForLowerDropdown.push('0 The Fool');
    this.textForLowerDropdown.push('I The Magician');
    this.textForLowerDropdown.push('II The High Priestess');
    this.textForLowerDropdown.push('III The Empress');
    this.textForLowerDropdown.push('IV The Emporer');
    this.textForLowerDropdown.push('V The Hierophant');
    this.textForLowerDropdown.push('VI The Lovers');
    this.textForLowerDropdown.push('VII The Chariot');
    this.textForLowerDropdown.push('VIII Strength');
    this.textForLowerDropdown.push('IX The Hermit');
    this.textForLowerDropdown.push('X The Wheel of Fortune');
    this.textForLowerDropdown.push('XI Justice');
    this.textForLowerDropdown.push('XII The Hanged Man');
    this.textForLowerDropdown.push('XIII Death');
    this.textForLowerDropdown.push('XIV Temperance');
    this.textForLowerDropdown.push('XV The Devil');
    this.textForLowerDropdown.push('XVI The Tower');
    this.textForLowerDropdown.push('XVII The Star');
    this.textForLowerDropdown.push('XVIII The Moon');
    this.textForLowerDropdown.push('XIX The Sun');
    this.textForLowerDropdown.push('XX Judgement');
    this.textForLowerDropdown.push('XXI The Rose');
    this.textForLowerDropdown.push('XXII The Universe');
  }

  DoTheSearch() {
    // console.log('do the search', this.selectedCard);

    let numFound = this.firestoreService.StartReadingSearch(this.selectedCard);
    // this.firestoreService.forceNavigationReset(); // this will force the navigation control to switch to all readings
    // console.log('did search - found', numFound);
    // tell caller we did something
    this.close(numFound > 0 ? this.selectedCard: null);
  }

  selectChangeTop(event) {
    this.enableSearch = false;   
    this.indexCard = 0; // we show them the first card
    let srcEle = event.srcElement;
    let options : HTMLOptionsCollection = srcEle.options;
    let selectedI = options.selectedIndex;
    // console.log('top select changed', event, selectedI);
    if (selectedI ==0) {
      this.zapText();
      this.textForLowerDropdown.push('Select Suit First...');
      this.enableSearch = false;
    } else {
      this.enableSearch = true;
      this.indexSuit = selectedI;

      switch (selectedI) {
        case 1:
          this.fillTextForPentacles();
          break;
        case 2:
          this.fillTextForSwords();
          break;
        case 3:
          this.fillTextForWands();
          break;
        case 4:
          this.fillTextForCups();
          break;
        case 5:
          this.fillTextForAnkhs();
          break;
        case 6:
          this.fillTextForMajorArcana();
          break;
      }
      this.createCard();
    }
  }

  createCard() {
    let suitCode = '';
    switch(this.indexSuit) {
      case 1:
        suitCode = 'p';
        break;
      case 2:
        suitCode = 's';
        break;
      case 3:
        suitCode = 'w';
        break;
      case 4:
        suitCode = 'c';
        break;
      case 5:
        suitCode = 'a';
        break;
      case 6:
        suitCode = 'm';
        break;
    }
    let cardCode = this.indexSuit == 6 ? this.indexCard : this.indexCard + 1;
    this.selectedCard = '#' + cardCode.toString() + suitCode;
    // console.log('selected card code', this.selectedCard);
  }

  selectChangeLower(event) {
    this.enableSearch = true;   
    let srcEle = event.srcElement;
    let options : HTMLOptionsCollection = srcEle.options;
    let selectedI = options.selectedIndex;
    this.indexCard = selectedI;
    this.createCard();
    // console.log('Lower select changed', event, selectedI);
  }
}
