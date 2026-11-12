import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPedidosSeleccionadosComponent } from './resumen-pedidos-seleccionados.component';

describe('ResumenPedidosSeleccionadosComponent', () => {
  let component: ResumenPedidosSeleccionadosComponent;
  let fixture: ComponentFixture<ResumenPedidosSeleccionadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenPedidosSeleccionadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenPedidosSeleccionadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
