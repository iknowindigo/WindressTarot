import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarotDeckPage } from './tarot-deck.page';

describe('TarotDeckPage', () => {
  let component: TarotDeckPage;
  let fixture: ComponentFixture<TarotDeckPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarotDeckPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarotDeckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
