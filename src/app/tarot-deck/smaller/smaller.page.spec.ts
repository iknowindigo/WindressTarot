import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SmallerPage } from './smaller.page';

describe('SmallerPage', () => {
  let component: SmallerPage;
  let fixture: ComponentFixture<SmallerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SmallerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
