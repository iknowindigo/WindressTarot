import { Component, OnInit, HostListener } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { CardDetails } from '../diary/diary.page'
import { FullScreenModalPage } from '../full-screen-modal/full-screen-modal.page';

@Component({
  selector: 'app-modal-card-display',
  templateUrl: './modal-card-display.page.html',
  styleUrls: ['./modal-card-display.page.scss'],
})
export class ModalCardDisplayPage implements OnInit {
  cardDetails: CardDetails;
  wantFullScreen: boolean;
    // cardText : string;

  constructor(
    public modalController: ModalController,
    public navParams: NavParams
  ) {
    this.cardDetails = this.navParams.get('dataToShow');
    this.wantFullScreen = false;
    // console.log('modal constructor', this.cardDetails);
  }

  ngOnInit() {
    // console.log('modal', '{cardDetails}');
  }

  public closeModal(){
    // console.log('modal dismiss', this.wantFullScreen);
    if (!this.wantFullScreen) {
      this.modalController.dismiss();
    }
}
@HostListener('document:mousedown', ['$event']) onMouseDown() {
  // const el = event.target;
  if (event.target instanceof Element) {
    const elm = event.target as Element;
    const cn: string = elm?.className;
    const inside = cn.includes('cardDetail') || cn.includes('cardText') || cn.includes('main-view');
    // console.log('host listen click',  cn, inside);  // event.target, event);
    if (!inside) {
      this.modalController.dismiss();
    }
  }
}

async presentModal(dataToShow: CardDetails) {
  // console.log('calling modal', dataToShow);
  this.wantFullScreen = true;
  const modal = await this.modalController.create({
    component: FullScreenModalPage,
    cssClass: 'modal-fullscreen',   // this is how we make this full screen - it's in global scss
    // buttons: [ {
    //   text: 'close',
    //   role: 'cancel',
    //   icon: 'close',
    //   handler: () => { console.log('canceled clicked');}
    // }]
    componentProps: { dataToShow }
  });
  return await modal.present();
}

// david asked for full screen view of card
clickedCard() {
  // console.log('clicked modal', this.cardDetails);
  this.presentModal(this.cardDetails);
}

}
