import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import { CardDetails } from '../tarot-deck/diary/diary.page';
import { TarotCard } from '../tarot-deck/tarotCard.model';
import { TarotCardsService, TarotCardsInThrow } from '../services/tarot-cards.service';
import { AuthenticationService } from '../services/authentication.service';
import { FirestoreService, UserData } from '../services/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class PdfGenService {
  throw: TarotCardsInThrow;   // this is just about all I need - one throw
  textForEachPosition: string[];
  throwName: string;
  throwHasBeenSaved: boolean;
  pageNumber: number;  // for header
  userDataList: UserData[];


  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthenticationService,
    private tarotCardService: TarotCardsService,
  ) {
    this.userDataList = [];
    this.textForEachPosition = [];
    this.textForEachPosition.push('The Question');
    this.textForEachPosition.push('The Foundation ');
    this.textForEachPosition.push('Crown');
    this.textForEachPosition.push('Support/Oppose');
    this.textForEachPosition.push('Significator');
    this.textForEachPosition.push('Near Future');
    this.textForEachPosition.push('Environment');
    this.textForEachPosition.push('Hopes and Fears');
    this.textForEachPosition.push('Final Outcome ');
    this.textForEachPosition.push('Modifier');
    this.textForEachPosition.push('Modifier');

    // tricky - I'll add a different string for singlecard throw
    this.textForEachPosition.push('Current situation ');  // (one card reading)

    this.textForEachPosition.push('The Question'); // 'What you can change');
    this.textForEachPosition.push('Modifier'); // 'What you can’t change');
    this.textForEachPosition.push('Modifier'); // 'What you may not be aware of');

  }




  // 7-27 - add uniform header to each page except the first
  AddHeader(doc: jsPDF, addPage: boolean) {
    // assume footer is at Y = 270
    const botY = 290;
    const botLineY = 285;

    const foot = '- ' + this.pageNumber.toString() + ' -';
    if (this.pageNumber > 1)
    {
      doc.text(100, botY, foot, 'center');
      doc.line(20, botLineY, 200, botLineY, 'DF');
    }
    let throwT = this.tarotCardService.getReadingNameForThrow(this.throw);
    if (throwT == undefined)
      throwT = 'Tarot Reading';
    console.log('header', this.throw.displayDateTime, this.throw.displayDateModified, throwT);
    if (addPage == true) {
      this.pageNumber += 1;
      doc.addPage();
      // yikes - with rays header can be too long - let's limit the subject
      const dateS = this.throw.displayDateTime.substring(0, 8);

      let head = throwT  // this.throw.typeThrow
        + '\t' + dateS // this.throw.displayDateTime
        + '\t' + this.throw.subject;
      const len = head.length;
        // console.log('head len', head, len, dateS);
      if (len > 88) {
          const lens = this.throw.subject.length;
          const shortSub = this.throw.subject.substring(0, 30);
          head = throwT + '  ' + dateS + ' ' + shortSub;
          // console.log('header shorter?', lens, shortSub, head, head.length)
        }

      // if (this.throw.displayDateTime != this.throw.displayDateModified) {
      //   head += `\t(edited: ${this.throw.displayDateModified})`;
      // }
      doc.text(100, 6, head, 'center');
      doc.line(20, 9, 200, 9, 'DF');
    }

    // console.log('header', this.pageNumber, foot, addPage);
  }

  addBlobToDoc(doc, blobOfText: string, startX: number, startY: number): number {

    const width = 200 - startX;
    const pageHigh = 280;
    let bNewPageStarted = false;

    const splitText = doc.splitTextToSize(blobOfText, width); // 150);
    let y = startY, len = 500;
    const x = startX;
    // console.log('blob', splitText, blobOfText.length)
    for (let c = 0, strLen = splitText.length; c < strLen; c++)
    {
      // console.log('blob', x, y, splitText[c]);
      doc.text(x, y, splitText[c]);
      y = y + 6;

      if (y > pageHigh) {
        // break to new page?
        // console.log('add page', y);
        // doc.addPage();    // doesn't work :(
        this.AddHeader(doc, true);
        y = 14;
        bNewPageStarted = true;
      }
    }
    if (bNewPageStarted == true) {
      y = 0 - y;  // return negative #
    }
    return y;
  }

  RenderOneCard(doc, thisThrow: TarotCardsInThrow, startY: number) {
    const title = this.textForEachPosition[11];
    const img = new Image();
    img.src = thisThrow.tarotCards[0].imageUrl;

    const imageWidth = 100;   // 1/3 -> 67; 200 x 334 orig
    const imageHeight = 167;  // 1/3 -> 111;

    let topY = 22;
    const topX = 50 ; // center of page is 100 - minus half width
    // console.log('title ', title, strLen, pixWide, textX, startY);
    const midImageWide = 50; // for centered text
    // console.log('add card', title, topX, topY, startY);
    doc.text(topX + midImageWide, topY + startY, title, 'center');
    topY += 6;
    // doc.line(3, topY, 203, topY + startY, 'DF');
    // topY += 9;
    // console.log('add image', topX, topY);
    doc.addImage(img, 'JPEG', topX, topY + startY, imageWidth, imageHeight);
  }

  RenderThreeCards(doc, thisThrow: TarotCardsInThrow, startY: number) {
    // will just tweak this by hand - portrait mode - three images
    // one centered high
    // two below - side by side
    const imageWidth = 67;
    const imageHeight = 111;

    let topY = 7;
    let topX = 60 ; // center of page is 100 - minus half width

    let title = this.textForEachPosition[12];
    const img = new Image();
    img.src = thisThrow.tarotCards[0].imageUrl;

    const midImageWide = 33; // for centered text
    // // kludge center text
    // let strLen = title.length;
    // let pixWide = strLen * 4;
    // let textX = 150 - (pixWide);
    // console.log('title ', title, strLen, pixWide, textX, startY);

    // console.log('add card', title, topX, topY, startY);
    doc.text(topX + midImageWide, topY + startY, title, 'center');
    // topY += 2;
    // doc.line(3, topY, 203, topY, 'DF');
    // topY += 9;
    // console.log('add image', topX, topY);
    doc.addImage(img, 'JPEG', topX, topY + startY + 2, imageWidth, imageHeight);

    // ok - now image 2
    title = this.textForEachPosition[13];
    const img2 = new Image();
    img2.src = thisThrow.tarotCards[1].imageUrl;
    // move down a bit more than height of image
    topY += imageHeight + 6;
    topX = 20;
    // console.log('add card + image', title,  topX, topY, startY);
    doc.text(topX + midImageWide, topY - 2 + startY, title, 'center');
    doc.addImage(img2, 'JPEG', topX, topY + startY, imageWidth, imageHeight);

    // image 3
    title = this.textForEachPosition[14];
    const img3 = new Image();
    img3.src = thisThrow.tarotCards[2].imageUrl;

    // Y doesn't change - X does
    topX += imageWidth + 20;
    // console.log('add card + image', title, topX, topY, startY);
    doc.text(topX + midImageWide , topY - 2 + startY, title, 'center');
    doc.addImage(img3, 'JPEG', topX, topY + startY, imageWidth, imageHeight);
  }

  RenderEightCards(doc, thisThrow: TarotCardsInThrow, startY: number) {
    console.log('here to render memory game cards')
    // copying code for pyramid - except here there are 8 cards
    const imageWidth = 33;
    const imageHeight = 56;
    // ok - this will also be hand tweaked - fixed card size - and I'll make an array of positions
    // I still don't know exact dimensions of screen - but I bet I will when this is done
    const midImageWide = 13; // for centered text



    const celx1 = 6;
    const celx2 = celx1 + midImageWide + celx1;
    const celx3 = celx2 + midImageWide + celx1;
    const celx4 = celx3 + midImageWide + celx1;
    const celx5 = celx4 + midImageWide + celx1;
    const celx6 = celx5 + midImageWide + celx1;
    const celx7 = celx6 + midImageWide + celx1;

   

    const xspace = 3;

    const botx1 = 3;
    const botx2 = botx1 + imageWidth + xspace;
    const botx3 = botx2 + imageWidth + xspace;
    const botx4 = botx3 + imageWidth + xspace;
    const botx5 = botx4 + imageWidth + xspace;

    const topX1 = botx1 + midImageWide;
    const topx2 = botx3;
    const topx3 = botx4 + midImageWide;


    const textX: number[] = [
      10 + midImageWide,      170 + midImageWide,      90 + midImageWide,
      40 + midImageWide,      140 + midImageWide,      90 + midImageWide,
      70 + midImageWide,      110 + midImageWide,      90 + midImageWide,
      60 + midImageWide,      120 + midImageWide
    ];

    const imgX: number[] = [
      topx2, topX1, topx3,  // note - putting first image in middle of top row
      botx1, botx2, botx3, botx4, botx5
    
    ];
    // const line4Y = 218;  // 66 per row
    // const line3Y = 152;
    const line2Y = 120;   //86;
    const line1Y = 20;

    const imgY: number[] = [
      line1Y, line1Y, line1Y,
      line2Y, line2Y, line2Y, line2Y, line2Y
    ];

    // ok let's just try that
    for (let i = 0; i < 8; i++) {
      // console.log(i, imgX[i], imgY[i]), startY;
      const img = new Image();
      img.src = thisThrow.tarotCards[i].imageUrl;
      doc.addImage(img, 'JPEG', imgX[i], imgY[i] + startY, imageWidth, imageHeight);
      // console.log('pyramid', imgX[i], imgY[i], textX[i]+4, startY);
      doc.text(imgX[i] + midImageWide, imgY[i] - 3 + startY, thisThrow.tarotCards[i].title, 'center'); // 'center'
    }
  }

  Render11Cards(doc, thisThrow: TarotCardsInThrow, startY: number) {
    const imageWidth = 34;
    const imageHeight = 56;
    // ok - this will also be hand tweaked - fixed card size - and I'll make an array of positions
    // I still don't know exact dimensions of screen - but I bet I will when this is done
    const midImageWide = 13; // for centered text

    const textX: number[] = [
      10 + midImageWide,      170 + midImageWide,      90 + midImageWide,
      40 + midImageWide,      140 + midImageWide,      90 + midImageWide,
      70 + midImageWide,      110 + midImageWide,      90 + midImageWide,
      60 + midImageWide,      120 + midImageWide
    ];

    const imgX: number[] = [
      10,      170,      90,
      40,      140,      90,
      70,      110,      90,
      60,      120
    ];
    const line4Y = 218;  // 66 per row
    const line3Y = 152;
    const line2Y = 86;
    const line1Y = 20;

    const imgY: number[] = [
      line4Y,
      line4Y,
      line1Y,
      line4Y, line4Y, line2Y,
      line4Y, line4Y, line3Y,
      line3Y, line3Y
    ];

    // ok let's just try that
    for (let i = 0; i < 11; i++) {
      // console.log(i, imgX[i], imgY[i]), startY;
      const img = new Image();
      img.src = thisThrow.tarotCards[i].imageUrl;
      doc.addImage(img, 'JPEG', imgX[i], imgY[i] + startY, imageWidth, imageHeight);
      // console.log('pyramid', imgX[i], imgY[i], textX[i]+4, startY);
      doc.text(textX[i] + 4, imgY[i] - 3 + startY, this.textForEachPosition[i], 'center'); // 'center'
    }
  }


  addOneCardToDoc(doc, thisX: number, thisY: number, positionText: string, card: TarotCard): number {
    // format is image top left - and then text to the right
    // perhaps I can make the text flow around the image?
    // image is 1/3 size - still larger than on the screen

    // the size of a card is variable - I'll start at the designated X,Y - perhaps I'll need to create page breaking logic too
    // then return the final Y - I think I'll draw a line when I'm done with a card

    // looks like Y = 300 is one page -
    // first the image


    let topY = thisY;
    const topX = thisX;

    const imageWidth = 67;
    const imageHeight = 111;
    const leftXMarg = 3;
    const paddingAfterImage = 1; // 3;
    const lineBump = 3; // 6;
    const pageHigh = 280;
    let bNewPageStarted: Boolean = false;


    // images are 200x334
    doc.line(leftXMarg, topY, topX + 200, topY, 'DF');

    let newLeftX = topX + imageWidth + paddingAfterImage;  // 70;
    // console.log('one card - 2', topX, newLeftX, topY)

    topY += lineBump + 3;  // 10;
    let newY = this.addBlobToDoc(doc, positionText, newLeftX, topY + 2);  // position
    if (newY < 0) {
      bNewPageStarted = true;
      newY = 0 - newY;
      // console.log('detected new page');
    }
    topY = newY + lineBump;
    // console.log('one card - 3', topX, newLeftX, topY)

    newY = this.addBlobToDoc(doc, card.title, newLeftX, topY + 2);
    if (newY < 0) {
      bNewPageStarted = true;
      newY = 0 - newY;
      // console.log('detected new page');
    }
    topY = newY + lineBump;
    // console.log('one card - 4', topX, newLeftX, topY);

    newY = this.addBlobToDoc(doc, card.key, newLeftX, topY);
    if (newY < 0) {
      bNewPageStarted = true;
      newY = 0 - newY;
      // console.log('detected new page');
    }
    topY = newY + lineBump;
    // console.log('one card - 5', topX, newLeftX, topY)

    newY = this.addBlobToDoc(doc, card.comment, newLeftX, topY);
    if (newY < 0) {
      bNewPageStarted = true;
      newY = 0 - newY;
      // console.log('detected new page');
    }
    topY = newY + lineBump;
    // console.log('one card - 6', topX, newLeftX, topY)

    if ( (topY - thisY) > 130)  {
      newLeftX = leftXMarg;
      // console.log('reset left margin', topY, thisY);
    }
    newY = this.addBlobToDoc(doc, card.thoughts, newLeftX, topY);
    if (newY < 0) {
      bNewPageStarted = true;
      newY = 0 - newY;
      // console.log('detected new page');
    }
    topY = newY;
    // console.log('one card - 7', topX, newLeftX, topY)

    // doc.line(leftXMarg, topY, topX + 200, topY, 'DF');
    if (bNewPageStarted) {
      topY  = 0 - topY;
    }
    return topY;
  }



  SaveAsPDF(thisThrow: TarotCardsInThrow) {
    // console.log('pdf service called', thisThrow, thisThrow.typeThrow);

    this.throw = thisThrow;

    this.throwName = '?';
    if (this.throw.numberCards == 1) {
      this.throw.typeThrow = 'One Card';
    } else if (this.throw.numberCards == 3) {
      this.throw.typeThrow = 'Three Cards';
    } else if (this.throw.numberCards == 11) {
      // this.throw.typeThrow = "Pyramid Reading"
      // this.throw.typeThrow = this.tarotCardService.GetTextForRay();
    }
    // ok - I worked with PDFs on tarot results - but I think, rather than make a service - I'll just put the code here
    this.pageNumber = 1;  // 7-27 added this for the header - will try to format things

    // console.log('save PDF', thisThrow);

    if (thisThrow.subject == undefined) {
      thisThrow.subject = '';
    }


    const doc = new jsPDF();
    // doc.canvas.height = 72*11;
    // doc.canvas.width = 72*8.5;
    // doc.setFont('RopaSans-Regular');
    doc.setFontType('normal');
    doc.setFontSize(12);

    const now = new Date();
    const dateString =
    now.getMonth()
      + '-' + now.getDay()
      + '-' + now.getFullYear();

    const theUser = this.firestoreService.GetUserUsingID(this.throw.userID);

    // const fbUser = this.authService.getCurrentFBUser();
    // console.log('pdf -> fb user', fbUser, fbUser.email);

    const fileN = 'Windress Tarot ' + dateString + '-' + now.getHours() + '-' + now.getMinutes() + '.pdf';
    const shorterDate = thisThrow.displayDateTime.substring(0, 8);
    const shorterSub = thisThrow.subject.substring(0, 40);

    const throwT = this.tarotCardService.getReadingNameForThrow(this.throw);

    // let firstLine = thisThrow.typeThrow + ': ' + thisThrow.displayDateTime + '\t\t (' + now.toLocaleString() + ") \t\t" + fbUser.email;
    // let firstLine = thisThrow.typeThrow + ': ' + thisThrow.displayDateTime + '\t\t' + thisThrow.subject + " \t\t" + fbUser.email;
    const firstLine = throwT + ': ' + shorterDate + '\t' + shorterSub + ' \t' + theUser.nickName + ', ' + theUser.email;

    console.log('first stuff', fileN, shorterDate, shorterSub, '->', throwT);

    console.log('first line', firstLine, shorterSub);

    const thisX = 3;
    let thisY = 9;
    let lastCardHigh = 20;
    const imageHeight = 111;
    const pageHigh = 280;

    doc.text(thisX, thisY, firstLine);
    thisY += 3;
    doc.line(thisX, thisY, thisX + 200, thisY, 'DF');
    // added extra logic so long comments are supported
    // if (thisThrow.comment.length > 40)
    {
      thisY += 6;
      // 8-17 -- added subject
      // let newY = this.addBlobToDoc(doc, thisThrow.subject, thisX, thisY);  // position
      // thisY = newY; // subject is one line - shouldn't cause page break

      const newY = this.addBlobToDoc(doc, thisThrow.comment, thisX, thisY);  // position
      // console.log('blob added Y->', newY);
      if (newY < 0) {
        // we already added a new page
        thisY = 0;
        // console.log('detected new page');
      } else {
        // we may need to add a page - depends on threshold - which I'm guessing at
        // doc.line(thisX, thisY + newY, thisX + 200, thisY + newY, 'DF');
        // if this is a pyramid throw - it needs almost the entire page
        let maxCommentY = 70;
        if (thisThrow.numberCards == 11) {
          maxCommentY = 24;
        }
        if (newY > maxCommentY)
        {
          thisY = 0;
          this.AddHeader(doc, true); // 7-27 -
          // doc.addPage();
          // doc.line(thisX, thisY, thisX + 200, thisY);
          // console.log('added page after blob', thisY);
        }
        else {
          thisY = newY;
          // doc.line(thisX, thisY, thisX + 200, thisY);
       }
      }
    }
    console.log('after comment ', thisY, thisThrow.numberCards);


    if (thisThrow.numberCards == 1) {
      this.RenderOneCard(doc, thisThrow, thisY);
    } else if (thisThrow.numberCards == 3) {
      this.RenderThreeCards(doc, thisThrow, thisY);
    } else if (thisThrow.numberCards == 11) {
      this.Render11Cards(doc, thisThrow, thisY - 9);
    } else if (thisThrow.numberCards == 8) {
      this.RenderEightCards(doc, thisThrow, thisY);
    }
    console.log('rendered cards done', thisThrow.numberCards);
    // g.s. 7-11 - now add all the text for the cards - as we used to do when we saved the cards
    // first a page break
    // doc.addPage();    // doesn't work :(
    this.AddHeader(doc, true);
    thisY = 14;
    // now I think I can skip the image (because it's already there - but add the text)
    console.log('PDF length ', thisThrow.tarotCards.length, thisThrow.tarotCards);
    for (let i = 0; i < thisThrow.tarotCards.length; i++) {
      if (thisY > 180) {
        // doc.addPage();
        this.AddHeader(doc, true);
        // console.log('main loop - add page', thisY, lastCardHigh);
        thisY = 9;
      }

      // figure positional text
      let posText = this.textForEachPosition[i];
      if (thisThrow.numberCards == 1) {
        posText = this.textForEachPosition[11];
      } else if (thisThrow.numberCards == 3)
      {
        posText = this.textForEachPosition[12 + i];
      } else if (thisThrow.numberCards == 8) {
        posText = ''; // leave blank
      }

      lastCardHigh = this.addOneCardToDoc(doc, thisX, thisY, posText, thisThrow.tarotCards[i]);
      if (lastCardHigh > 0) {
        thisY += lastCardHigh;  // move down the page
      } else {
        // we broke the page - so keep going from the new height
        thisY = 0 - lastCardHigh + 4; // I make this negative to show we did a page break
      }
    }
    this.AddHeader(doc, false);  // this will add the footer - second param says no new page
    // console.log('PDF done?', thisX, thisY)
    doc.save(fileN);

    thisThrow.open = true;  // keep it open
    // console.log('after pdf', thisThrow);
  }

}
