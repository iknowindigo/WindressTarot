import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarotResultsPage } from './tarot-results.page';

describe('TarotResultsPage', () => {
  let component: TarotResultsPage;
  let fixture: ComponentFixture<TarotResultsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarotResultsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarotResultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
