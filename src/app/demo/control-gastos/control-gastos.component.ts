/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { DecimalPipe, formatDate } from '@angular/common';
import { Component, AfterViewInit, QueryList, ViewChildren, OnInit, TemplateRef, inject } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbAccordionModule, NgbCalendar, NgbDate, NgbDropdownConfig, NgbDropdownModule, NgbHighlight, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sort-table.directive';
import { FilterableTable } from 'src/app/directives/sort/filterable-table';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { PedidoStorageService } from 'src/app/services/pedidos/pedido-storage.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetallePedidoComponent } from '../modal/detalle-pedido/detalle-pedido.component';
import { PagoFacturaComponent } from '../modal/pago-factura/pago-factura.component';
import { GenerarFacturaCompraComponent } from '../modal/generar-factura-compra/generar-factura-compra.component';
import { PagoCompraComponent } from '../modal/pago-compra/pago-compra.component';
import { AgregarGastoComponent } from '../modal/agregar-gasto/agregar-gasto.component';
import { PagoService } from 'src/app/services/pago/pago.service';


const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

@Component({
  selector: 'app-control-gastos',
  standalone: true,
  imports: [SharedModule, NgbDropdownModule, NgbAccordionModule, NgbdSortableHeader, DecimalPipe, NgbHighlight, NgbdSortableHeader, NgbPaginationModule],
  providers: [NgbDropdownConfig, NgbAccordionModule, DecimalPipe, FilterableTable],
  templateUrl: './control-gastos.component.html',
  styleUrls: ['./control-gastos.component.scss']
})
export default class ControlGastosComponent {

  private modalService = inject(NgbModal);
  obligaciones$: Observable<any[]> = of([]);
  pagos$: Observable<any[]> = of([]);

  totalObligaciones: number = 0;
  totalPagosDomicilio: number = 0;
totalPagosCaja: number = 0;
totalGastosVarios: number = 0;
totalGastosJulian: number = 0;
  tipoGastos: any[] = [
    { id: 1, nombre: 'Domicilio', img: 'assets/images/domicilio.png', valor: this.totalPagosDomicilio , width:80, colorClass:'bg-c-yellow', concepto: '5296', aplicaFiltro:true  },
    { id: 2, nombre: 'Caja usa', img: 'assets/images/box.png', valor: 5000, width:80, colorClass:'bg-c-yellow', concepto: '5298',aplicaFiltro:true  },
    { id: 3, nombre: 'Gastos varios', img: 'assets/images/gasto.png' , valor: 5000 , width:80, colorClass:'bg-c-red', concepto : '5299',aplicaFiltro:true   },
    { id: 4, nombre: 'Gastos JULIAN', img: 'assets/images/julian.png' , valor: 5000 ,width:80,  colorClass:'bg-c-red',concepto : '5300',aplicaFiltro:true   },
    { id: 5, nombre: 'Obligaciones mensuales', img: 'assets/images/obligacion.png' , width:60, valor: this.totalObligaciones , colorClass:'bg-c-blue',  concepto: '5301' },
  ]
fechainicio=''
fechafin=''

  constructor(public pedidoService: PedidosService, private comprasService: ComprasService, private pagosService: PagoService,private pedidoStorageService: PedidoStorageService, public db: AngularFireDatabase, public tableService: FilterableTable) {
    let date = new Date();
    let fechainicio: any = new Date(date.getFullYear(), date.getMonth(), 1);
    this.fechainicio = formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');
    this.fechafin = formatDate(new Date(date.getFullYear(), date.getMonth() , date.getDate()), 'yyyy-MM-dd', 'en-US');

    pedidoService.obtenerPedidos()
    comprasService.obtenerCompras()
    pagosService.obtenerPagos()
  }

  ngOnInit(): void {
    this.obligaciones$ = this.comprasService.GetObligacionesMensuales();
      this.obligaciones$.subscribe(compras => {
        this.totalObligaciones = compras.reduce((acc, compra) => acc + compra.saldo, 0);
        this.tipoGastos = this.tipoGastos.map(gasto => {
          if (gasto.id === 5) {
            return { ...gasto, valor: this.totalObligaciones };
          }
          return gasto;
        })
      })
    this.obtenerPagos();
  }




  obtenerPagos(){
    this.pagos$ = this.comprasService.GetPagos();
      this.pagos$.subscribe(pagos => {
        this.totalPagosDomicilio = pagos.filter(x=>x.idConcepto==="5296").reduce((acc, pago) => acc + pago.valor, 0);
        this.totalPagosCaja = pagos.filter(x=>x.idConcepto==="5298").reduce((acc, pago) => acc + pago.valor, 0);
        this.totalGastosVarios = pagos.filter(x=>x.idConcepto==="5299").reduce((acc, pago) => acc + pago.valor, 0);
        console.log(pagos)
        this.totalGastosJulian = pagos.filter(x=>x.idConcepto==="5300").reduce((acc, pago) => acc + pago.valor, 0);

        this.tipoGastos = this.tipoGastos.map(gasto => {
          if (gasto.id === 1) {
            return { ...gasto, valor: this.totalPagosDomicilio };
          }
           if (gasto.id === 2) {
            return { ...gasto, valor: this.totalPagosCaja };
          }
          if (gasto.id === 3) {
            return { ...gasto, valor: this.totalGastosVarios  };
          }
          if (gasto.id === 4) {
            return { ...gasto, valor: this.totalGastosJulian  };
          }

          return gasto;
        })
      })
  }

  agregarGasto(gasto: any | undefined) {
    const modal = this.modalService.open(AgregarGastoComponent, { ariaLabelledBy: 'modal-basic-title' })
    if (gasto) {
      modal.componentInstance.tipoGasto = gasto
    }
    modal.result.then((data: any) => {
      console.log(data)
      if (data.success) {
      }
    })
  }

}
