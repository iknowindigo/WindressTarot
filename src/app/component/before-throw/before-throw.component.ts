import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-before-throw',
  templateUrl: './before-throw.component.html',
  styleUrls: ['./before-throw.component.scss'],
})
export class BeforeThrowComponent implements OnInit, OnDestroy {
  blueFlameGif: string;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {}

  ngOnDestroy() {
    // console.log('before throw: ngOnDestroy');
  }
  ionViewDidLeave() {
    // console.log('before throw: ionViewDidLeave');
  }
  ionViewWillLeave() {
    // console.log('before throw: ionViewWillLeave');
  }

  ionViewDidEnter(){
    this.blueFlameGif = '../../assets/gif/bluef1.gif';
    // this.blueFlameGif = "../../assets/gif/trees.gif";
    // console.log(this.blueFlameGif);
  }

  async Deal() {
    await this.modalCtrl.dismiss();
    this.router.navigate(['throw']);
  }
}
