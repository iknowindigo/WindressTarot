import { Component, OnInit, ViewChild, ElementRef, Directive, Input } from '@angular/core';
import { FirestoreService, RayReadingsFolders } from '../../services/firestore.service';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy, FolderForReadings, LeftSelect } from '../../services/tarot-cards.service';
import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';  //FabContainer
import { analytics } from 'firebase';
import { IonFab } from '@ionic/angular';


// tslint:disable-next-line: no-conflicting-lifecycle
@Component({
  selector: 'app-folder-nav',
  template: `<p> {{ favoriteFolders }} </p>`,
  templateUrl: './folder-nav.component.html',
  styleUrls: ['./folder-nav.component.scss'],
})
export class FolderNavComponent implements OnInit {
  activeFilter: FilterThrowsBy;  // I want to highlight this
  currentSel: LeftSelect;
  menuAllRead: boolean;
  menuOneCard: boolean;
  menuThreeCards: boolean;
  menuPyramid: boolean;
  menuMemory: boolean;
  menuFolderIndex: number;
  rayIndex: number;  // 8-29
  @Input() favoriteFolders: FolderForReadings[];
  @ViewChild('FolderSelectId') favFolderEl: ElementRef; // back door way to update the folder list after delete
  // @ViewChild('fabRef') fabRef : IonFab;
  decoratedFolderList: FolderForReadings []; // includes counts
  myRayList: RayReadingsFolders; // each ray will have a list of readings - perhaps (probably) none
  decoratedRayList: FolderForReadings [];  // so we can display
  // just decorate the counts
  decorateAllReadings: string;
  decorateOneCard: string;
  decorateThreeCards: string;
  decoratePyramid: string;
  decorateMemory: string;

  constructor(
    private firestoreService: FirestoreService,
    private alert: AlertController,
    private tarotCardService: TarotCardsService,
  ) {
    this.activeFilter = {
      includeAll : true,	// if this is true - then ignore the filter
      throwType: 'all'
    };
    this.currentSel = {
      allRead: true,
      oneCard: false,
      ThreeCards : false,
      Pyramid : false,
      folderIndex : -1,
      folderName: '',
      folderDocID: ''
    };
    this.favFolderEl = null;
    this.menuAllRead  = true;
    this.menuOneCard = false;
    this.menuThreeCards = false;
    this.menuPyramid = false;
    this.menuMemory = false;
    this.menuFolderIndex  = -1;
    this.rayIndex = -1;
    this.favoriteFolders = this.firestoreService.getPublicFolderList();
 //   console.log('folder nav: constructor', this.firestoreService, this.favoriteFolders);
    // this.highlightSelection();  // show which menu leaf is selected
    this.decoratedFolderList = [];
    this.decoratedRayList = [];
    this.myRayList = null;
  }

  ngOnInit() {
    // console.log('folder nav: ngOnInit');
       // have to subscribe so we can get updates when readings are added or removed from folders
    this.firestoreService.FolderListReadyState.subscribe(state => {
      // console.log('FolderListReadyState subscription', state);
      if (state > 0) {
        this.favoriteFolders = this.firestoreService.favoriteFolders;
         console.log('folder nav: subscription update!! heres the list', this.favoriteFolders);
        // console.log('here is list', this.favoriteFolders)
        this.addCountsToFolderList();
      }
    });
  }

  // unsubscribe from stuff
  ionViewWillLeave() {
    this.firestoreService.FolderListReadyState.unsubscribe();
    // console.log('unsubscribing folder-ray')
  }

  ngDoCheck() {
  //   console.log('folders?', this.decoratedFolderList.length, this.favoriteFolders.length)
  //   console.log('folder nav: ngDoCheck')
    // console.log('FAB active?', this.fabRef.activated, this.fabRef);
    this.favoriteFolders = this.firestoreService.favoriteFolders;
    this.addCountsToFolderList();
    // let's add counts
    let filter: FilterThrowsBy = {
      includeAll : true,	// if this is true - then ignore the filter
      throwType: 'all'
    };
    let countAll = this.firestoreService.getCountOfReadings(filter);
    this.decorateAllReadings = countAll ?
       'All Readings' + ' (' + countAll.toString() + ')'
       : 'All Readings';

    filter = {
      includeAll: false,
      throwType: 'One Card'
  };
    let countOne = this.firestoreService.getCountOfReadings(filter);
    this.decorateOneCard = countOne ?
        'One Card'+ ' (' + countOne.toString() + ')'
        : 'One Card';

//        console.log('One card - count', countOne);

    filter  = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType: 'Three Cards'
    };
    let countThree = this.firestoreService.getCountOfReadings(filter);
    this.decorateThreeCards = countThree ?
       'Three Cards'+ ' (' + countThree.toString() + ')'
       : 'Three Cards';

    filter = {  
      includeAll: false,
      throwType: '11' 
    };
    let countP = this.firestoreService.getCountOfReadings(filter);
    this.decoratePyramid = countP ?
       'Pyramid'+ ' (' + countP.toString() + ')'
       : 'Pyramid';

       // 2-28-21 new reading type - memory game
       filter = {
        includeAll: false,
        throwType: '8'
      };

      let countM = this.firestoreService.getCountOfReadings(filter);
      this.decorateMemory = countM > 0 ?
         'Memory'+ ' (' + countM.toString() + ')'
         : 'Memory';
 //     console.log('momory count:',filter, countM);

    // console.log('decorating', this.decorateAllReadings);
    let resetNav = this.firestoreService.shouldNavReset();
    if (resetNav == true) {
      // console.log('nav: set all readings')
      this.setAllReadings();
      this.firestoreService.clearNavReset();  // turn it off
    }
  }

  ngOnChanges() {
    // console.log('folder nav: ngOnChanges');
  }
  public onFabClick() {
    // console.log('FAB active?', this.fabRef.activated, this.fabRef);
  }



  ngAfterContentInit() {
    // console.log('folder nav: ngAfterContentInit');
  }
  // ngAfterViewChecked() {
  //   console.log('folder nav: ngAfterViewChecked');
  // }

  ngOnDestroy() {
    // console.log('folder nav: ngOnDestroy');
  }

  ngAfterViewInit() {
    // console.log('folder nav: ngAfterViewInit');

    this.favoriteFolders = this.firestoreService.getPublicFolderList();
   //  console.log('folder nav:', this.favoriteFolders);
    this.myRayList = this.firestoreService.getRayReadingFolders(); // get data for rays
   //  console.log('got rays', this.myRayList)
    this.createDecoratedRays(); // crunch the data
    this.firestoreService.rayFolderState.subscribe(state => {
      // console.log('ray list subscription');
      this.myRayList = this.firestoreService.getRayReadingFolders(); // get data for rays
    //   console.log('got subscribed rays', this.myRayList);
      this.createDecoratedRays(); // crunch the data
    });
  }

  ionViewDidLoad() {
    // console.log('folder ionViewDidLoad');
  }

  async ionViewDidEnter(){
    // console.log('view did enter')
  }

  addCountsToFolderList() {
    this.decoratedFolderList = [];  // we'll make a copy of the list - but add current count
    this.favoriteFolders.forEach(folder => {

      let count = folder.throw.length;
      let countedName = folder.name + ' (' + count.toString() + ')';
      let decorateFolder: FolderForReadings = {
        name: countedName,
        folderID: folder.folderID,
        ownerID: folder.ownerID,
        throw: folder.throw
      };
      // console.log('decorated folder', decorateFolder);
      this.decoratedFolderList.push(decorateFolder);
    });
  }

  selected() {
    // console.log('i was selected');
  }

  setAllReadings() {
    let filter: FilterThrowsBy = {
      includeAll : true,	// if this is true - then ignore the filter
      throwType: 'all'
    };

    this.menuAllRead  = true;
    this.menuOneCard = false;
    this.menuThreeCards = false;
    this.menuPyramid = false;
    this.menuMemory = false;
    this.menuFolderIndex  = -1;
    this.rayIndex = -1;

    this.currentSel = {
      allRead: true,
      oneCard: false,
      ThreeCards : false,
      Pyramid : false,
      folderIndex : -1,
      folderName: '',
      folderDocID: ''
    };
    this.tarotCardService.setLeftSelect(this.currentSel);

    this.activeFilter = filter;
    // this.highlightSelection();
    let result =  this.firestoreService.setReadingFilter(filter).then (data => {
    //   console.log('called new get reading list', data)
    });
  }

  setOneCard() {
    let filter: FilterThrowsBy = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType: '1' //'One Card'
    };
    this.menuAllRead  = false;
    this.menuOneCard = true;
    this.menuThreeCards = false;
    this.menuPyramid = false;
    this.menuFolderIndex  = -1;
    this.rayIndex = -1;
    this.currentSel = {
      allRead: false,
      oneCard: true,
      ThreeCards : false,
      Pyramid : false,
      folderIndex : -1,
      folderName: '',
      folderDocID: ''
    };
    this.tarotCardService.setLeftSelect(this.currentSel);
    this.activeFilter = filter;
    // this.highlightSelection();
    let result =  this.firestoreService.setReadingFilter(filter).then (data => {
      // console.log('called new get reading list', data)
    });
  }

  setThreeCards() {
    let filter: FilterThrowsBy = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType: '3' //'Three Cards'
    };
    this.menuAllRead  = false;
    this.menuOneCard = false;
    this.menuThreeCards = true;
    this.menuPyramid = false;
    this.menuFolderIndex  = -1;
    this.rayIndex = -1;
    this.currentSel = {
      allRead: false,
      oneCard: false,
      ThreeCards : true,
      Pyramid : false,
      folderIndex : -1,
      folderName: '',
      folderDocID: ''
    };
    this.tarotCardService.setLeftSelect(this.currentSel);
    this.activeFilter = filter;
    // this.highlightSelection();
    let result =  this.firestoreService.setReadingFilter(filter).then (data => {
      // console.log('called new get reading list', data)
    });
  }

  callCommonClick(filter: FilterThrowsBy) {

    this.menuAllRead  = false;
    this.menuOneCard = false;
    this.menuThreeCards = false;
    this.menuPyramid =  false;//true;
    this.menuFolderIndex  = -1;
    this.rayIndex = -1;

    this.currentSel = {
      allRead: false,
      oneCard: false,
      ThreeCards : false,
      Pyramid : false,
      folderIndex : -1,
      folderName: '',
      folderDocID: ''
    };
    this.tarotCardService.setLeftSelect(this.currentSel);
    this.activeFilter = filter;
    // this.highlightSelection();
    let result =  this.firestoreService.setReadingFilter(filter).then (data => {
    //   console.log('called new get reading list', filter, this.currentSel, data)
    });
  }

  FigureRayIndexOut(typeThrow: string) {
    this.rayIndex = -1; // so far no idea

    // the string is 111 through 911 - so let's just try math?
    // let throwT = parseInt( typeThrow);
    // let ray = throwT/100;
    // let rayInt = Math.floor(ray);
    // this.rayIndex = rayInt - 1; // think this is right?
    for (let i=0; i < this.decoratedRayList.length; i++) {
     //  console.log('->', this.decoratedRayList[i].name, this.decoratedRayList[i].folderID[0]);
      if (this.decoratedRayList[i].folderID[0] == typeThrow) {
        this.rayIndex = i;
      }
    }
   //  console.log('is this the ray?', this.rayIndex, typeThrow, this.decoratedRayList.length, this.decoratedRayList);
  }
  SetRayReading(typeThrow: string) {
    let filter: FilterThrowsBy = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType:  typeThrow
    };
    // have to figure out index so can highlight it :(


    this.callCommonClick(filter);
    this.FigureRayIndexOut(typeThrow);
  }

  setPyramidReadings() {
    let filter: FilterThrowsBy = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType:  '11'    //'Pyramid Reading'
    };
    this.callCommonClick(filter);
    this.menuPyramid = true;
  }

  setMemoryReadings() {
    let filter: FilterThrowsBy = {
      includeAll : false,	// if this is true - then ignore the filter
      throwType:  '8'    //'Pyramid Reading'
    };
    this.callCommonClick(filter);
    this.menuMemory = true;
  }

  folderClicked(index: number) {
    // ??
    // console.log('clicked folder ', index, this.favoriteFolders[index].name, this.favoriteFolders[index].folderID);
    this.menuAllRead  = false;
    this.menuOneCard = false;
    this.menuThreeCards = false;
    this.menuPyramid = false;
    this.menuFolderIndex  = index;
    this.rayIndex = -1;
    this.currentSel = {
      allRead: false,
      oneCard: false,
      ThreeCards : false,
      Pyramid : false,
      folderIndex : index,
      folderName: this.favoriteFolders[index].name,
      folderDocID: this.favoriteFolders[index].folderID[0] // ????
    };
    this.tarotCardService.setLeftSelect(this.currentSel);
    this.firestoreService.SetFolderAsSourceForReadings(this.favoriteFolders[index].folderID);
    this.firestoreService.setCurrentFolderIndex(index); // it needs this
   //  console.log('folder element?', this.favFolderEl)
  }

  addFolder() {
    // console.log('add folder?', this.currentSel);
  }
  renameFolder() {
    // console.log('Rename folder?', this.currentSel);
  }

  // try to make confirmation dialog??
  async presentConfirmationDialogDeleteFolder(folderName: string) {
    const alert = await this.alert.create( {
      header: 'Confirm Deletion of Folder',
      subHeader: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (meh) => {
            // console.log('confirm cancel');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.firestoreService.deleteFolder(folderName).then(a => {

            }).finally( () => {
              if (this.favFolderEl != null && this.favFolderEl !== undefined) {
                this.favFolderEl.nativeElement.innnerHTML = '';
                this.favFolderEl.nativeElement.innerText = '';
                this.favFolderEl.nativeElement.outerText = '';
                this.favFolderEl.nativeElement.remove();
                // console.log('kludge html hit 2')
              }
              this.favoriteFolders = this.firestoreService.getPublicFolderList();
              // console.log('folder nav:', this.favoriteFolders);
              // switch to "all readings" - we lost our 'current folder'
              this.setAllReadings();
            });
          }
        }
      ]
    });
    await alert.present();
  }
  // fab : FabContainer
  deleteFolder() {
    // console.log('Delete folder?', this.currentSel)
    this.presentConfirmationDialogDeleteFolder(this.currentSel.folderName)
    .then(a=> {
      // try to force update to html
      // if (this.favFolderEl != null && this.favFolderEl != undefined) {
      //   this.favFolderEl.nativeElement.innnerHTML = "";
      //   this.favFolderEl.nativeElement.innerText = "";
      //   this.favFolderEl.nativeElement.outerText = "";
      //   this.favFolderEl.nativeElement.remove();
      //   console.log('kludge html hit')
      // }
      // update our list of folders - service will update cache
      // this.favoriteFolders = this.firestoreService.getPublicFolderList();
      // console.log('folder component', this.favoriteFolders);
      // // switch to "all readings" - we lost our 'current folder'
      // this.setAllReadings();
    });
  }

  // here to create displayable list of rays - only display if there are readings
  createDecoratedRays() {
    // same crap trying to clear the array :(
      // console.log('before create decorated', this.myRayList, this.decoratedRayList)
    if (this.decoratedRayList.length > 0) {
      let len = this.decoratedRayList.length;
      // console.log('trying to delete decorated ray');
      for (let i=0; i < len; i++) {
        this.decoratedRayList.pop();
        // console.log('pop');
      }
    }

    this.decoratedRayList = [];
    let aName: string = '';
    if (this.myRayList != null) {
      // console.log('creating decorated rays', this.myRayList, this.myRayList.eachRay.length);
      // ?? I think I'll just hard code each ray
      for (let i=0; i < this.myRayList.eachRay.length; i++) {
        let rayRead = this.myRayList.eachRay[i];
        if (rayRead.throw.length > 0) {
          // ray has data
          // aName = 'Ray ' + (i + 1).toString() + ' (' + rayRead.throw.length + ')';
          aName = rayRead.name + ': (' + rayRead.throw.length + ')';
          rayRead.name = aName; // replace
          this.decoratedRayList.push(rayRead);
          // console.log('adding ray', aName, rayRead);
        }
      }
      // console.log('decorated rays', this.decoratedRayList);
    }
  }

}
