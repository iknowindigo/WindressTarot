import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarotCardDetailPage } from './tarot-card-detail.page';

describe('TarotCardDetailPage', () => {
  let component: TarotCardDetailPage;
  let fixture: ComponentFixture<TarotCardDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarotCardDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarotCardDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
