import { TestBed } from '@angular/core/testing';

import { TarotCardsService } from './tarot-cards.service';

describe('TarotCardsService', () => {
  let service: TarotCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TarotCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
