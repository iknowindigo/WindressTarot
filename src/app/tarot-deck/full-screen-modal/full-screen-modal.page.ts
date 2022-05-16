import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { CardDetails } from '../diary/diary.page'

@Component({
  selector: 'app-full-screen-modal',
  templateUrl: './full-screen-modal.page.html',
  styleUrls: ['./full-screen-modal.page.scss'],
})
export class FullScreenModalPage implements OnInit {
  cardDetails : CardDetails;

  constructor(
    public modalController: ModalController,
    public navParams: NavParams
  ) { 
    this.cardDetails = this.navParams.get('dataToShow');
  }

  ngOnInit() {
  }

  public closeModal(){
    this.modalController.dismiss();
}

}
