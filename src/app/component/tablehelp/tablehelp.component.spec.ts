import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TablehelpComponent } from './tablehelp.component';

describe('TablehelpComponent', () => {
  let component: TablehelpComponent;
  let fixture: ComponentFixture<TablehelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablehelpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TablehelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
