import { TestBed } from '@angular/core/testing';

import { PagoStorageService } from './pago-storage.service';

describe('PagoStorageService', () => {
  let service: PagoStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagoStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
