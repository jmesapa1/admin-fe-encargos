import { TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, of } from 'rxjs';
import DashAnalyticsComponent from '../demo/dashboard/dash-analytics.component';
import PedidosComponent from '../demo/pedidos/pedidos.component';
import { PagoFacturaComponent } from '../demo/modal/pago-factura/pago-factura.component';
import { PagoCompraComponent } from '../demo/modal/pago-compra/pago-compra.component';
import { AgregarGastoComponent } from '../demo/modal/agregar-gasto/agregar-gasto.component';

describe('Phase 1 — synthetic regression fixtures', () => {
  let modal: jasmine.SpyObj<NgbActiveModal>;
  beforeEach(() => {
    modal = jasmine.createSpyObj('modal', ['close', 'dismiss']);
    TestBed.configureTestingModule({ providers: [
      { provide: NgbActiveModal, useValue: modal },
      { provide: NgbModal, useValue: {} }
    ] });
  });

  function dashboard() {
    const banks = new Subject<any>();
    const obligations = new Subject<any[]>();
    const orders = new Subject<any[]>();
    const details: Subject<any>[] = [];
    const paymentStorage = {
      obtenerDetallesPago: () => { const detail = new Subject<any>(); details.push(detail); return detail; },
      obtenerPagos: () => of({ data: [] })
    };
    const component = TestBed.runInInjectionContext(() => new DashAnalyticsComponent(
      paymentStorage as any, { obtenerPedidos: () => of({ data: [] }) } as any,
      { obtenerPedidos: () => undefined, GetPedidos: () => orders } as any,
      { obtenerPagos: () => undefined } as any, {} as any, {} as any, {} as any,
      { obtenerCompras: () => undefined, obtenerComprasData: () => of({ data: [] }),
        GetObligacionesMensuales: () => obligations } as any,
      { obtenerBancos: () => banks } as any
    ));
    return { component, banks, obligations, orders, details };
  }

  for (const order of ['detail-first', 'detail-last']) {
    it(`calculates the same existing balance formula with ${order}`, () => {
      const h = dashboard();
      const detail = () => h.details[0].next({ data: { valorPrestamosPorCobrar: 30 } });
      if (order === 'detail-first') detail();
      h.banks.next({ data: [{ balance: 1000 }] });
      h.obligations.next([{ saldo: 100 }]);
      h.orders.next([{ pedido: { balance: 200 }, compraData: { compra: { balance: 50 } } }]);
      if (order === 'detail-last') detail();
      expect(h.component.pagosDetalle.balanceGeneral).toBe(1080);
      h.banks.next({ data: [{ balance: 1200 }] });
      expect(h.component.pagosDetalle.balanceGeneral).toBe(1280);
    });
  }

  it('does not display a partial balance before all sources have arrived', () => {
    const h = dashboard();
    h.details[0].next({ data: { valorPrestamosPorCobrar: 30 } });
    expect(h.component.pagosDetalle.balanceGeneral).toBeUndefined();
  });

  it('ignores obsolete details after a period change', () => {
    const h = dashboard();
    h.component.obtenerDetallesPago('2026-01-01', '2026-01-31');
    h.details[1].next({ data: { valorPrestamosPorCobrar: 20 } });
    h.details[0].next({ data: { valorPrestamosPorCobrar: 99 } });
    expect(h.component.pagosDetalle.valorPrestamosPorCobrar).toBe(20);
  });

  it('invalidates the balance if a required source fails', () => {
    const h = dashboard();
    h.details[0].next({ data: { valorPrestamosPorCobrar: 30 } });
    h.banks.error(new Error('synthetic'));
    expect(h.component.pagosDetalle.balanceGeneral).toBeUndefined();
  });

  function orderComponent() {
    const service = jasmine.createSpyObj('orders', ['obtenerPedidos', 'obtenerCompras', 'cambiarEstadoCompra']);
    service.cambiarEstadoCompra.and.returnValue(of({ success: true }));
    const component = TestBed.runInInjectionContext(() => new PedidosComponent(
      service, {} as any, {} as any, {} as any, {} as any
    ));
    component.pedidosOriginal = [
      { id: 'synthetic-a', novedades: [] },
      { id: 'synthetic-b', novedades: [{ novedad: 'Synthetic notice' }] }
    ];
    return { component, service };
  }

  it('does not update a filtered order when confirmation is declined', () => {
    const h = orderComponent();
    spyOn(window, 'confirm').and.returnValue(false);
    h.component.cambiarEstadoCompra('En camino USA', 'synthetic-b', 0);
    expect(window.confirm).toHaveBeenCalled();
    expect(h.service.cambiarEstadoCompra).not.toHaveBeenCalled();
  });

  it('updates once after accepting a notice', () => {
    const h = orderComponent();
    spyOn(window, 'confirm').and.returnValue(true);
    h.component.cambiarEstadoCompra('En camino USA', 'synthetic-b', 1);
    expect(h.service.cambiarEstadoCompra).toHaveBeenCalledTimes(1);
  });

  for (const kind of ['sale', 'purchase', 'expense', 'obligation']) {
    it(`sends only one ${kind} payment while a response is pending`, () => {
      const response = new Subject<any>();
      const send = jasmine.createSpy('synthetic-payment').and.returnValue(response);
      const component = TestBed.runInInjectionContext(() => {
        if (kind === 'sale') return new PagoFacturaComponent({ abonarFacturaPedido: send } as any, {} as any);
        if (kind === 'purchase') return new PagoCompraComponent({} as any, { pagarSaldoFacturaCompra: send } as any);
        return new AgregarGastoComponent({ agregarEgreso: send } as any, {} as any,
          { pagarSaldoFacturaCompra: send } as any);
      });
      if (component instanceof AgregarGastoComponent) {
        component.obligacionesMensuales = kind === 'obligation';
        component.obligacionSeleccionada = { obligacion: 'synthetic-obligation' };
      } else {
        component.pedido = { id: 'synthetic-order', saldo: 50, saldoCompra: 50, compraData: { id: 'synthetic-purchase' } };
      }
      component.pagoForm.patchValue({ valor: 20, idMedioPago: 'synthetic-account' });
      component.agregarPago();
      component.agregarPago();
      expect(send).toHaveBeenCalledTimes(1);
    });
  }

  it('does not resubmit after an ambiguous network failure', () => {
    const response = new Subject<any>();
    const send = jasmine.createSpy('synthetic-payment').and.returnValue(response);
    const component = TestBed.runInInjectionContext(() => new PagoFacturaComponent(
      { abonarFacturaPedido: send } as any, {} as any
    ));
    component.pedido = { id: 'synthetic-order', saldo: 50 };
    component.pagoForm.patchValue({ valor: 20, idMedioPago: 'synthetic-account' });
    component.agregarPago();
    response.error(new Error('synthetic timeout'));
    component.agregarPago();
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('preserves a recorded payment when the following delivery update fails', () => {
    const response = new Subject<any>();
    const delivery = new Subject<any>();
    const send = jasmine.createSpy('synthetic-payment').and.returnValue(response);
    const update = jasmine.createSpy('delivery').and.returnValue(delivery);
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    const component = TestBed.runInInjectionContext(() => new PagoFacturaComponent(
      { abonarFacturaPedido: send } as any, { cambiarEstadoCompra: update } as any
    ));
    component.pedido = { id: 'synthetic-order', saldo: 50, estado: 'En camino USA' };
    component.pagoForm.patchValue({ valor: 50, idMedioPago: 'synthetic-account' });
    component.agregarPago();
    response.next({ success: true, response: { invoices: [{ balance: 0 }] } });
    component.agregarPago();
    delivery.error(new Error('synthetic delivery failure'));
    component.agregarPago();
    expect(send).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(modal.close).toHaveBeenCalled();
  });

  it('releases dashboard subscriptions when its injection context is destroyed', () => {
    const h = dashboard();
    TestBed.resetTestingModule();
    h.banks.next({ data: [{ balance: 1000 }] });
    expect(h.component.totalBancos).toBe(0);
  });

  it('preserves legacy purchase response bodies without resending', () => {
    const send = jasmine.createSpy('synthetic-purchase').and.returnValue(of([]));
    const component = TestBed.runInInjectionContext(() => new PagoCompraComponent(
      {} as any, { pagarSaldoFacturaCompra: send } as any
    ));
    component.pedido = { id: 'synthetic-order', saldoCompra: 50, compraData: { id: 'synthetic-purchase' } };
    component.agregarPago();
    component.agregarPago();
    expect(send).toHaveBeenCalledTimes(1);
    expect(modal.close).toHaveBeenCalledWith([]);
  });

});
