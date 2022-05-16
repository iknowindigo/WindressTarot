import { TestBed } from '@angular/core/testing';

import { SpiritualServiceService } from './spiritual-service.service';

describe('SpiritualServiceService', () => {
  let service: SpiritualServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpiritualServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
