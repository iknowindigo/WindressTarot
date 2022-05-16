import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FullScreenModalPage } from './full-screen-modal.page';

describe('FullScreenModalPage', () => {
  let component: FullScreenModalPage;
  let fixture: ComponentFixture<FullScreenModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullScreenModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FullScreenModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
