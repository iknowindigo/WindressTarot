import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NineRayPage } from './nine-ray.page';

describe('NineRayPage', () => {
  let component: NineRayPage;
  let fixture: ComponentFixture<NineRayPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NineRayPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NineRayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
