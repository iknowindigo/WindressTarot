import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarotSocialPage } from './tarot-social.page';

describe('TarotSocialPage', () => {
  let component: TarotSocialPage;
  let fixture: ComponentFixture<TarotSocialPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarotSocialPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarotSocialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
