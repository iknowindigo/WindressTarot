import { TestBed } from '@angular/core/testing';

import { PdfGenService } from './pdf-gen.service';

describe('PdfGenService', () => {
  let service: PdfGenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfGenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
