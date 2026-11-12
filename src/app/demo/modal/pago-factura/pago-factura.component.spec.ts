import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';
import { of } from 'rxjs';

import { PagoFacturaComponent } from './pago-factura.component';

describe('PagoFacturaComponent', () => {
  let component: PagoFacturaComponent;
  let fixture: ComponentFixture<PagoFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoFacturaComponent],
      providers: [
        { provide: PagoService, useValue: { abonarFacturaPedido: () => of({}) } },
        { provide: PedidosService, useValue: {} },
        { provide: NgbActiveModal, useValue: { close: jasmine.createSpy('close') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoFacturaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pedido', { clienteNombre: 'Cliente', saldo: 100 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables Abonar until the payment form is valid', () => {
    const abonarButton: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-footer button:last-child');

    expect(abonarButton.disabled).toBeTrue();

    component.pagoForm.patchValue({ valor: 100, idMedioPago: '2' });
    fixture.detectChanges();

    expect(abonarButton.disabled).toBeFalse();
  });

  it('does not ask whether a "Falta comprar" order was delivered after payment', () => {
    const pagoService = TestBed.inject(PagoService) as jasmine.SpyObj<PagoService>;
    spyOn(pagoService, 'abonarFacturaPedido').and.returnValue(of({
      success: true,
      response: { invoices: [{ balance: 0 }] }
    }));
    spyOn(window, 'confirm');
    fixture.componentRef.setInput('pedido', {
      id: 'pedido-1',
      clienteNombre: 'Cliente',
      saldo: 100,
      estadoCompra: 'Falta comprar'
    });

    component.agregarPago();

    expect(window.confirm).not.toHaveBeenCalled();
  });
});
