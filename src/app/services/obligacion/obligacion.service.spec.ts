import { TestBed } from '@angular/core/testing';

import { ObligacionService } from './obligacion.service';

describe('ObligacionService', () => {
  let service: ObligacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObligacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
