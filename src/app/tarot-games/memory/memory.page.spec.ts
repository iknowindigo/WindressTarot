import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MemoryPage } from './memory.page';

describe('MemoryPage', () => {
  let component: MemoryPage;
  let fixture: ComponentFixture<MemoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
