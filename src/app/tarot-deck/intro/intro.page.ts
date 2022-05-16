import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { File } from '@ionic-native/file/ngx';

// import * as fs from 'fs';
// import * as path from 'path';
// import { writeFileSync, readFileSync } from 'fs';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
  welcomeText : string [];

  constructor(
    private router: Router
  ) { }
 
  ngOnInit() {
    this.ReadWelcomeTextIntoArray();
  }

  ReadWelcomeTextIntoArray() {
   
   this.welcomeText = [
     "Welcome Traveler!",
     "We suspect many different roads have led some of you here, and however you found yourself here, our hope is that the Windress Tarot will be a useful tool in helping you understand the various forces that act on your life, as well as a helpful tool to uncover hints and messages that the universe constantly provides – as you find your footsteps following a path that leads to the unknown. ",
     "There are many tarot apps available, but we hope you’ll find the Windress Tarot unique as it allows you to construct a diary of your readings and explorations.  The Windress Tarot deck introduced in these pages has not eliminated any of the seventy-eight cards of the traditional deck, but has added to it. In order to advance the role of Tarot reading, in a manner that can help travelers on the Path interpret their desire for inner realization, The Windress Tarot has added fifteen new cards. These include the new Minor Arcana suit of Ankhs which represent the element of “ether.",
      " While Greek writings (the foundation of much of western thought) noted that all matter consists of earth, air, fire, and water, we must integrate a deeper understanding that our consciousness is often influenced by an invisible quality of energetic life called ether—the fifth element. As we progress on the spiritual path, an awareness of this fifth element will help us develop the sensitivity and wisdom to steer through the challenge of “being in the world, but not of the world.",
      "The Windress Tarot adds a completely new card to the Major Arcana called the Rose, keeping the Universe as the last card in the deck. Hence, The Windress Tarot contains five suits and twenty-three cards in the Major Arcana, making a total of ninety-three cards.",
      // "We hope you’ll find value in some of these links:",
      // "https://aow-highlands.net/",
      // "a resource for your spiritual questions",
      // "https://www.youtube.com/watch?v=2kqqZp2Wwd8&list=PLTfdwXlMX5JTpqNsqm26LOT7F5g93x5ES",
      // "Some of the music composed by Katherine Windress Sharp, the founder of the Windress Tarot",
      // "You may contact us with this email address:",
      // "ultradianrhythm@gmail.com",
        // " Welcome Traveler!",
          // " We suspect many different roads have led some of you here, ",
          // " and however you found yourself here, our hope is that the Windress Tarot well be a useful tool ",
          // " in helping you understand the various forces that act on your life, as well as to uncover hints ",
          // " and messages that the universe constantly provides – as you find your footsteps following ",
          // " a path that leads to the unknown.",
          // " There are many tarot apps available to us all, but we hope you’ll find the Windress Tarot unique ",
          // " as it allows you to construct a diary of your readings and explorations.  The Windress Tarot deck ",
          // " introduced in these pages has not eliminated any of the seventy-eight cards of the traditional deck,", 
          // " but has added to it. In order to advance the role of Tarot reading, in a manner that can help travelers ",
          // " on the Path interpret their desire for inner realization, The Windress Tarot has added fifteen new cards. ",
          // " These include the new Minor Arcana suit of Ankhs which represent the element of “ether.” ",
          // " While Greek writings (the foundation of much of western thought) noted that all matter ",
          // " consists of earth, air, fire, and water, we must integrate a deeper understanding that our ",
          // " consciousness is often influenced by an invisible quality of energetic life called ether—the fifth element. ",
          // " As we progress on the spiritual path, an awareness of this fifth element will help us develop the sensitivity ",
          // " and wisdom to steer through the challenge of “being in the world, but not of the world.",
          // " The Windress Tarot adds a completely new card to the Major Arcana called the Rose, ",
          // " keeping the Universe as the last card in the deck. ",
          // " Hence, The Windress Tarot contains five suits and twenty-three cards in the Major Arcana, ",
          // " making a total of ninety-three cards.",
          // // " We hope you’ll find value in some of these links:",
          // // " https://aow-highlands.net/",
          // // " a resource for your spiritual questions",
          // // " https://www.youtube.com/watch?v=2kqqZp2Wwd8&list=PLTfdwXlMX5JTpqNsqm26LOT7F5g93x5ES",
          // // " Some of the music composed by Katherine Windress Sharp, the founder of the Windress Tarot",
          // " You may contact us with this email address:",
          // " ultradianrhythm@gmail.com",
   ];

  }


  
  // ReadWelcomeTextIntoArray() {
  //   var dataFile = '../../assets/WelcomeTraveler.txt';
  //   var reader = new FileReader();

  //   reader.onload = function(e) {
  //     var text = reader.result;
  //   }

  //   reader.readAsText(dataFile, encodeURI);

  //   // var fs = require('fs');
   
  //   // var array = fs.readFileSync(dataFile, 'utf-8').toString().split("\n");
  //   // console.log('intro', array)
  // }


  goHome() {
    this.router.navigate(['tarot-deck'])
  }
}
