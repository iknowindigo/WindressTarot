import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarotThrowPage } from './tarot-throw.page';

describe('TarotThrowPage', () => {
  let component: TarotThrowPage;
  let fixture: ComponentFixture<TarotThrowPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarotThrowPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarotThrowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
