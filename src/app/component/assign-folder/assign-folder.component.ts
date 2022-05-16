import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AlertController, ModalController, PickerController } from '@ionic/angular';
import { FirestoreService } from  '../../services/firestore.service'  
import { CommonModule } from "@angular/common";
import { BrowserModule } from '@angular/platform-browser';
import { TarotCardsService, ATarotThrow, TarotCardsInThrow, FilterThrowsBy, FolderForReadings } from '../../services/tarot-cards.service';
import { PickerOptions, PickerColumnOption} from '@ionic/core'

export class folderInfo {
  name: string;
  folderID: string;
  enabledForThisThrow: boolean;
  throwID : string;
}

// I guess this will have two modes:  (1) create new folder; (2) select which folder

@Component({
  selector: 'app-assign-folder',
  templateUrl: './assign-folder.component.html',
  styleUrls: ['./assign-folder.component.scss'],
})
export class AssignFolderComponent implements OnInit, AfterViewChecked
{
  folderName : any;
  responseData : any; 
  languageSelected: any;
  favoriteFolders : FolderForReadings[];
  throw : TarotCardsInThrow; 
  folderInfoList : folderInfo[]
  newFolderMode : boolean;  // decided to use same dialog for new folder and select existing folder
  inputValid : boolean;
  shownNothingToDo : boolean;
  @ViewChild('inputId', {static: false}) ionInput: { setFocus: () => void; };
  @ViewChild('inputId') test: ElementRef;
  @ViewChild('FolderSelectId') folderSelect: ElementRef;
  @ViewChild('inputnewfolder') newFileInput : ElementRef;
 
  constructor(
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
    private tarotService: TarotCardsService,
    private alert: AlertController,
    private pickerCtrl : PickerController
  ) { 
    this.folderName = '';
    this.inputValid = false;
    this.folderInfoList = [];
    this.shownNothingToDo = false;
  }

  ngOnInit() {
    this.newFolderMode = this.tarotService.getFolderPickerCreatesNewFolders(); // my way to exchange data

    if (!this.newFolderMode) {
      this.favoriteFolders = this.firestoreService.getPublicFolderList();
      // this.createFolderInfoList();
    }
  
    // console.log('assign folder ngOnInit', this.favoriteFolders)
    this.throw = this.tarotService.getCurrentThrow();
    // console.log('assign folder constructor', this.throw.throwID)
   
  }

  ngAfterViewChecked() {
    // console.log('after view checked - setting focus', this.newFileInput, this.newFileInput.nativeElement);
    if (this.newFileInput.nativeElement != undefined) {
      this.newFileInput.nativeElement.setFocus();
      // console.log('set focus finally')
    }
    // this.newFileInput.nativeElement.setFocus();
  }

  ionViewDidEnter(){
    // this.ionInput.setFocus();
// 8-13 find out if we're here to make a new folder, or select 
    this.newFolderMode = this.tarotService.getFolderPickerCreatesNewFolders(); // my way to exchange data
    // console.log('assign folder', this.newFolderMode, this.ionInput);
    if (!this.newFolderMode) {
      // no need to do all of this if we're not going to show the folder list
      this.firestoreService.getFolderList()
      .then (data => {})
      .finally(()=>
        {
          this.favoriteFolders = this.firestoreService.getPublicFolderList();
          // console.log('assign folder got folders', this.favoriteFolders, this.favoriteFolders.length);
          this.createFolderInfoList();
        });  // this will update the folder data
    }
  

    // this.favoriteFolders = this.firestoreService.getPublicFolderList();
    // console.log('assign folder ionViewDidEnter', this.favoriteFolders)
  }




  getListOfFolders() : PickerColumnOption [] {
    let folderList : PickerColumnOption [] = [];
    this.favoriteFolders.forEach(folder => {
      // check this folder - see if this reading is already in the folder - if so - disable the selection
      // console.log('assign folder: looking at ', folder)
      let index = this.IsThisReadingInFolder(folder.throw, this.throw.throwID);
      let readingInThere = index >= 0 ? true : false;
      let fname = readingInThere ? '*(' + folder.name + ')' : folder.name;
      let info = {
        text: fname,  //folder.name,
        value: folder.folderID[index], // ???? hmm
        disabled:!readingInThere
        // throwID: this.throw.throwID
      }
      folderList.push(info); // missing enable info
    });

    // just for testing
    let info2 = {
      text: "apple",
      value: "123",
      disable: false
    }
    folderList.push(info2);
    return folderList;
  }
  // 8-12 trying the new picker UI
  async showBasicPicker() {
    let folderNames : PickerColumnOption[] = this.getListOfFolders();
    

    let opts: PickerOptions = {
      cssClass: 'folder-picker',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Done',
          cssClass: 'foldpick-done'
        }
      ],
      columns: [
        {
          name: 'folder',
          options: folderNames
        }
      ]
    };
    let picker = await this.pickerCtrl.create(opts);
    picker.present();
    picker.onDidDismiss().then(async data => {
      let col = await picker.getColumn('folder');
      
      this.folderName = col.options[col.selectedIndex].text;
      // console.log('picked', col, this.folderName);
    })
  }

  IsThisReadingInFolder(throwsInFolder : TarotCardsInThrow[], throwID : string) : number {
    let foundIt = false;
    let index = 0;
    throwsInFolder.forEach(thrw => {
      // console.log('checking folders - present?', thrw.throwID, throwID)
      if (thrw.throwID.trim() == throwID.trim()) {
        foundIt = true;
      }
      if (!foundIt) {
        index++;
      }
    })
    if (!foundIt) {
      index = -1;
    }
    // console.log('is Reading in folder check is', throwID, foundIt, index);
    return index;
  }

  createFolderInfoList() {
    this.folderInfoList = []; // zap
    // console.log('assign folder: create info list', this.favoriteFolders, this.favoriteFolders.length)
    let foundOneFolder = false;
    this.favoriteFolders.forEach(folder => {
      // check this folder - see if this reading is already in the folder - if so - disable the selection
      
      let index = this.IsThisReadingInFolder(folder.throw, this.throw.throwID);
      // console.log('assign folder: looking at ', folder, index)
      let readingInThere = index >= 0 ? true : false;
      if (!readingInThere) { 
        foundOneFolder = true 
      };
      let fname = readingInThere ? '*(' + folder.name + ')' : folder.name;
      let info = {
        name: fname,  //folder.name,
        folderID: readingInThere ? folder.folderID[index] : '123123', // ???? hmm
        enabledForThisThrow: readingInThere,  // yes I realize the logic is backwards - this is should we disable
        throwID: this.throw.throwID
      }
      this.folderInfoList.push(info);
      // console.log('folder info', info, this.folderInfoList, foundOneFolder);
    })
    // ok - we shouldn't be here if no folders exist - and if there's only one - make sure it's enabled
    // || this.favoriteFolders.length > 0
    // if the user doesn't do anything except click OK - preselect the first folder
    if (this.favoriteFolders.length > 0) {
      this.folderName = this.favoriteFolders[0].name;
      // console.log('preselecting first folder', this.folderName);
    }
    
    if ( (foundOneFolder==false && !this.shownNothingToDo) ) {
      // console.log('did not find folder', foundOneFolder, this.shownNothingToDo)
      this.presentNothingToDo();  // tell the user the bad news
      this.shownNothingToDo = true; // somehow we were getting two ??
      this.close(); // we're done here
    }
  }

  // name: string;
  // folderID: string;
  // enabledForThisThrow: boolean;
  // throwID : string;

  async close() {
    await this.modalCtrl.dismiss();
  }

  optionsFn(value) {
   
    // console.log('pick folder', this.folderName, '->', value.detail);
    if (this.folderName == undefined || value.detail == undefined) {
      return; // invalid input
    }

    // let's figure out which folder to use
    this.favoriteFolders.forEach( folder => {
      // console.log('testing', folder.name, this.folderName);
      if (folder.name.trim() == this.folderName.trim()) {
        // console.log('found it')
        this.firestoreService.addReadingToFolder(folder.name, this.throw.throwID, false);  // wow
      }
    })

    this.modalCtrl.dismiss();
  }

  // setLanguage() {
  //   let me=this;
  //   console.log('languageSelected',me.languageSelected);
  // }

  saveNewFolder() {
   
    if (this.folderName.length > 0 && this.throw.throwID.length > 0) {
      // here we go - get this throw and create a new folder with this folder name and reading
      this.firestoreService.addReadingToFolder(this.folderName, this.throw.throwID, true);  // I think this is it!  
      // console.log('save folder ->', this.folderName);
      // now update cached data
      
      let readingInThere = true;
      
      let fname =  '*(' + this.folderName + ')';
      let info = {
        name: fname,  //folder.name,
        folderID: '1234', // no idea - not sure it matters
        enabledForThisThrow: readingInThere,  // yes I realize the logic is backwards - this is should we disable
        throwID: this.throw.throwID
      }
      this.folderInfoList.push(info);
      // console.log('folder info', info, this.folderInfoList);
    }
    this.close(); // exit
  }

  selectExistingFolder() {
    // console.log('select existing folder', this.folderName); //, this.folderSelect);
    
    // ??? somehow foldername is "folder.name" - and not valid name
    this.firestoreService.addReadingToFolder(this.folderName, this.throw.throwID, false);  // wow
    this.close(); // exit
  }

  setFocusOnInput() {
    this.ionInput.setFocus();
    this.test.nativeElement.firstChild['autofocus'] = 'true';
 }

 // try to make confirmation dialog??
 async presentNothingToDo() {
  const alert = await this.alert.create( {
    header: 'No folder found without this reading.',
    subHeader: '(Nothing to do)',
    buttons: [
      {
        text: 'OK',
        role: 'cancel',
        handler: (meh) => {
          // console.log('confirm cancel');
          this.close(); // exit
        }
      }
    ]
  })
  await alert.present();
}


// new folder - this code validates new name
  onChangeTime(newFolderName) {
   
    if (newFolderName.trim().length > 0) {
      this.inputValid = true;
    } else {
      this.inputValid = false;
    }
    if (this.inputValid && this.folderInfoList.length > 0) {
      // look to see if this folder is enabled
      this.folderInfoList.forEach(folder => {
        if (folder.name.trim() == newFolderName.trim()) {
          if (!folder.enabledForThisThrow) {
            this.inputValid = false;  // folder not enabled
          }
        }
      })
    }
    // console.log('folder name change', newFolderName, this.inputValid, newFolderName.trim().length);
  }

  // here when select UI changes folder select option
  selectChange(event) {
    // ! wow - had to jump through hoops to get the data I needed :(
    // console.log('select change', event, event.value);
    let srcEle = event.srcElement;
    let options : HTMLOptionsCollection = srcEle.options;
    let selectedI = options.selectedIndex;
    // I might be able to get the folder name from the HTML itself (srcEle->option[selectedI]) - but I'm going to use my data
  
    this.folderName = this.folderInfoList[selectedI].name;
    // console.log('sel change', selectedI, this.folderName);
  }


}
