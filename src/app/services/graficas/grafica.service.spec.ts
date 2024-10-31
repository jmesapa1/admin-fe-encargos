import { TestBed } from '@angular/core/testing';

import { GraficaService } from './grafica.service';

describe('GraficaService', () => {
  let service: GraficaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraficaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
