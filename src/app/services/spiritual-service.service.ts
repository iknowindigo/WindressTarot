import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpiritualServiceService {
  private spiritualQuotes : string[] = [];
  private youtubeVidLinks: string[] = [];

  constructor() { 
    // hand generate a few quotes
    this.spiritualQuotes[0] = "The affairs of the world will go on forever. Do not delay the practice of meditation. -- Milarepa";
    this.spiritualQuotes[1] = "Kabir: Keep on reciting God\'s name, and you will live pleasantly in the world. With true love as your master, your life-map will change.";
    this.spiritualQuotes[2] = "Look for and search for God within yourself, within your own body. God resides inside - look for him there. (Maharishi Mehi)";
    this.spiritualQuotes[3] = "The Lord in Shabd form is always with you and is never far. Have patience, and you will get a glimpse of True Light. (Swami Ji Maharaj)";
    this.spiritualQuotes[4] = "Rumi says: Bring the sky beneath your feet and listen to Celestial Music everywhere.";
    this.spiritualQuotes[5] = "The Master said, I will give you what no eye has seen, what no ear has heard, what no hand has touched, and what has never occurred to the human mind.";
    this.spiritualQuotes[6] = "Stop acting so small. You are the universe in ecstatic motion. -- Rumi";
    this.spiritualQuotes[7] = "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself. -- Rumi";
    this.spiritualQuotes[8] = "I have been a seeker and I still am, but I stopped asking the books and the stars. I started listening to the teaching of my Soul. -- Rumi";

    this.youtubeVidLinks[0] = "https://youtu.be/niBeSewnjsY"; // kether
    this.youtubeVidLinks[1] = "https://youtu.be/jmpWsQ2A3sU"; // invocation of the leviathan
    this.youtubeVidLinks[2] = "https://youtu.be/zd6VI1quatI"; // a meditation
    this.youtubeVidLinks[3] = "https://youtu.be/IVat_QT8DfA"; // the flume
    this.youtubeVidLinks[4] = "https://youtu.be/BMGVVhRQkxM" ;  // thy will be done
    this.youtubeVidLinks[5] = "https://youtu.be/k72HBv2t26A"; // walking through the clouds
    this.youtubeVidLinks[6] = "https://youtu.be/I-bHnQb44i8"; // hummingbird
    this.youtubeVidLinks[7] = "https://youtu.be/sTkxLQIAEUg"; // orion
    this.youtubeVidLinks[8] = "https://youtu.be/KfFxgYNU9CY" ;  // bird song
    this.youtubeVidLinks[9] = "https://youtu.be/Y3rknfKsbgs";// never ending journey 
    this.youtubeVidLinks[10] = "https://youtu.be/mbgcGdWk-y0";  // circle of time
    this.youtubeVidLinks[11] = "https://youtu.be/ZPgvWoTfxf8";  // eclipse
    this.youtubeVidLinks[12] = "https://youtu.be/Injb9rfa5Zc";  // song of heaven
    this.youtubeVidLinks[13] = "https://youtu.be/mz1LOKH66CI";  // tears of blood
    this.youtubeVidLinks[14] = "https://youtu.be/_IYnqY2w3Jk";  // sunrise
    this.youtubeVidLinks[15] = "https://youtu.be/HgVN_KxQVBk";  // the return
    this.youtubeVidLinks[16] = "https://youtu.be/GCgbFyZHmZE";  // green song
    this.youtubeVidLinks[17] = "https://youtu.be/zByBi6flvxc";  // sahara
    this.youtubeVidLinks[18] = "https://youtu.be/F5lewVkLG8E";  // the moons chase
    this.youtubeVidLinks[19] = "https://youtu.be/5VzKaoYMUtI";  // baby bird
    this.youtubeVidLinks[20] = "https://youtu.be/7N4hSpTMWyw";  // temple under the sea
    this.youtubeVidLinks[21] = "https://youtu.be/mjiR8gjyuDI";  // the consumation and the becoming
    this.youtubeVidLinks[22] = "https://youtu.be/H1SzaYpXSXQ";  // falling leaves
    this.youtubeVidLinks[23] = "https://youtu.be/XtjomohSBx0";  // to sleep ... to dream
    this.youtubeVidLinks[24] = "https://youtu.be/xY4kSTNYhAA";  // angel's tear
    this.youtubeVidLinks[25] = "https://youtu.be/x41CH1yiUIA";  // lotus land (2)
    this.youtubeVidLinks[26] = "https://youtu.be/IIgzbDkuU-4";  // samantha lost
    this.youtubeVidLinks[27] = "https://youtu.be/0WI8zf1eG80";  // loves eyes
    this.youtubeVidLinks[28] = "https://youtu.be/f8Ywkjt057M";  // song ofthe hansa

  }
getRandomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
  getRandomSpiritualQuote() : string {
      // will hook up to a source of quotes - probably a database
    const numQuotes = this.spiritualQuotes.length;
    const index = this.getRandomInt(0, numQuotes-1);
    // console.log('spiritual quote', this.spiritualQuotes[index], index);
    return this.spiritualQuotes[index];
  }

  getRandomOuttakePic() : string {
    const index = this.getRandomInt(1, 27);
    var url = './assets/img/outtakes/img' + index.toString() + '.jpeg';
    // console.log('outtake url', url);
    return url;
  }

  getRandomYoutubeLink() : string {
    const numQuotes = this.youtubeVidLinks.length;
    const index = this.getRandomInt(0, numQuotes-1);
    // console.log('spiritual quote', this.spiritualQuotes[index], index);
    var theLink = this.youtubeVidLinks[index];
    // let's decorate it - so it looks like this ->  https://www.youtube.com/embed/BMGVVhRQkxM?autoplay=1
    var splits = theLink.split("/");
  
    var realLink = "https://www.youtube.com/embed/" + splits[3] + "?autoplay=1";
    // console.log('you tube', theLink, splits, realLink);
    return realLink;
  }
}
 