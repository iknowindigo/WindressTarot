import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TarotCard } from '../tarotCard.model';
import { TarotCardsService } from '../../services/tarot-cards.service';

@Component({
  selector: 'app-tarot-card-detail',
  templateUrl: './tarot-card-detail.page.html',
  styleUrls: ['./tarot-card-detail.page.scss'],
})
export class TarotCardDetailPage implements OnInit {
  loadedTarotCard: TarotCard;

  constructor(private activatedRoute: ActivatedRoute, private tarotCardService: TarotCardsService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('cardId')) {
        // redirect
        return;
      }
      const cardId = paramMap.get('cardId');
      this.loadedTarotCard = this.tarotCardService.getOneCard(cardId);
    })
  }

}
