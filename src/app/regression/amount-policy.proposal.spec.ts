import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NEVER } from 'rxjs';
import { PagoFacturaComponent } from '../demo/modal/pago-factura/pago-factura.component';

// Proposed financial limits. Intentionally not activated without explicit approval.
xdescribe('Amount policy proposal — requires business approval', () => {
  for (const value of ['', 0, -1, 'invalid', NaN, Infinity, 101]) {
    it(`rejects synthetic invalid amount: ${String(value)}`, () => {
      TestBed.configureTestingModule({ providers: [{ provide: NgbActiveModal, useValue: {} }] });
      const send = jasmine.createSpy('synthetic-payment').and.returnValue(NEVER);
      const component = TestBed.runInInjectionContext(() => new PagoFacturaComponent(
        { abonarFacturaPedido: send } as any, {} as any
      ));
      component.pedido = { id: 'synthetic-order', saldo: 100 };
      component.pagoForm.patchValue({ valor: value, idMedioPago: 'synthetic-account' });
      component.agregarPago();
      expect(send).not.toHaveBeenCalled();
    });
  }
  it('requires a payment account', () => {
    TestBed.configureTestingModule({ providers: [{ provide: NgbActiveModal, useValue: {} }] });
    const send = jasmine.createSpy('synthetic-payment').and.returnValue(NEVER);
    const component = TestBed.runInInjectionContext(() => new PagoFacturaComponent(
      { abonarFacturaPedido: send } as any, {} as any
    ));
    component.pedido = { id: 'synthetic-order', saldo: 100 };
    component.pagoForm.patchValue({ valor: 20, idMedioPago: '' });
    component.agregarPago();
    expect(send).not.toHaveBeenCalled();
  });
});
