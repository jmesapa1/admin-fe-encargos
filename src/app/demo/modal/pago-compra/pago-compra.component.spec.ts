import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoCompraComponent } from './pago-compra.component';

describe('PagoFacturaComponent', () => {
  let component: PagoCompraComponent;
  let fixture: ComponentFixture<PagoCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCompraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
