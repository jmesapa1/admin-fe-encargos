/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { DecimalPipe } from '@angular/common';
import { Component, AfterViewInit, QueryList, ViewChildren, OnInit, TemplateRef, inject } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbAccordionModule, NgbDropdownConfig, NgbDropdownModule, NgbHighlight, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
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
import { ConsolidarCargaComponent } from '../modal/consolidar-carga/consolidar-carga.component';
import { GenerarNovedadComponent } from '../modal/generar-novedad/generar-novedad.component';
import { ResumenPedidosSeleccionadosComponent } from '../modal/resumen-pedidos-seleccionado/resumen-pedidos-seleccionados.component';


const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [SharedModule, NgbDropdownModule, NgbAccordionModule, NgbdSortableHeader, DecimalPipe, NgbHighlight, NgbdSortableHeader, NgbPaginationModule],
  providers: [NgbDropdownConfig, NgbAccordionModule, DecimalPipe, FilterableTable],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export default class PedidosComponent {
  @ViewChildren(NgbdSortableHeader)
  headers!: QueryList<NgbdSortableHeader>;

  private modalService = inject(NgbModal);

  peidosGeneralLbl = [{
    title: 'Fecha pedido'
  },
  {
    title: 'Producto',
    icon: 'icon-help-circle'
  },
  {
    title: '$ venta',
    icon: 'icon-help-circle'
  },
  {
    title: 'Cliente',
    icon: 'icon-help-circle'
  },
  {
    title: '$ compra',
    icon: 'icon-help-circle'
  },

  {
    title: 'F.compra',
    icon: 'icon-help-circle'
  },
  {
    title: 'F. Entrega',
    icon: 'icon-help-circle'
  },
  {
    title: 'Abono',
    icon: 'icon-help-circle'
  },
  {
    title: 'Saldo',
    icon: 'icon-help-circle'
  },
  {
    title: 'Estado',
    icon: 'icon-help-circle'
  }]
  pedidosLbl = [
    {
      title: 'ID'
    },
    {
      title: 'Fecha pedido'
    },
    {
      title: 'Producto',
      icon: 'icon-help-circle'
    },
    {
      title: '$ venta',
      icon: 'icon-help-circle'
    },
    {
      title: 'Cliente',
      icon: 'icon-help-circle'
    },
    {
      title: 'Compra',
      icon: 'icon-help-circle'
    }
  ];
  comprasLbl = [
    {
      title: 'ID'
    },
    {
      title: 'Fecha compra'
    }
    ,
    {
      title: 'Producto',
      icon: 'icon-help-circle'
    },
    {
      title: 'Provedor',
      icon: 'icon-help-circle'
    },
    {
      title: '$ compra',
      icon: 'icon-help-circle'
    },
    {
      title: 'Entrega inmediata',
      icon: 'icon-help-circle'
    }
  ];
  estadosCompraPedidos = [{ color: "bg-c-blue", name: "En camino a MED" }, { color: "bg-c-blue", name: "En camino USA" }, { color: "bg-c-purple", name: "Entregado a USA" }, { color: "bg-c-yellow", name: "Espera de despacho" }, { color: "bg-c-green", name: "Entregado cliente" }]

  comprasEntregaInmediata: any[] = []
  pedidosPendientes: any[] = []
  compraPendientes: any[] = []
  compraEntregaInmediata: any[] = []
  pedidosOriginal: any[] = []
  comprasGeneral: any[] = []
  pedidosRecienLlegados: any[] = []

  pedidosSaldo = 0
  compraPendientesSaldo = 0
  saldoPedidosEntregados = 0

  total$!: Observable<number>;
  closeResult: any;

  pedidos$: Observable<any[]> = of([]);
  compras$: Observable<any[]> = of([]);

  cantidadDePedidos = 0

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: string = '';

  accioNotificarLlegada = false;

  private _searchTerm = '';
  estadoFiltrado : undefined | string


  constructor(public pedidoService: PedidosService, private comprasService: ComprasService, private pedidoStorageService: PedidoStorageService, public db: AngularFireDatabase, public tableService: FilterableTable) {
    pedidoService.obtenerPedidos()
    pedidoService.obtenerCompras()

  }

  ngOnInit(): void {
    this.obtenerPedidos()
    this.obtenerCompras()
  }

  obtenerPedidos() {
    this.pedidoService.GetPedidos().subscribe(pedidos => {
      const pedidosProcesados = pedidos.map(x => {
        let pedidosPorEntregar = pedidos.filter(p => x.pedido.client.id === p.pedido.client.id && p.trackingCompra !== "Entregado cliente")
        if (x.color === "bg-c-red") {
            x.color = "bg-c-red color-white"
            x.colorText = "color-white"
        } 
        return {
          ...x,
          clienteNombre: x.pedido.client.name,
          producto: x.pedido?.items[0].name,
          valorCompra: x.compraData ? x.compraData.valor : 0,
          saldoCompra: x.compraData ? x.compraData.saldo : 0,
          origenCliente: x.pedido.client.name.includes('/') ? "Instagram" : "Whatsapp",
          pago: x.pago ? [...x.pago] : [],
          pedidosPorEntregar: pedidosPorEntregar,
          totalPedidosPorEntregar: pedidosPorEntregar.length,
          color: !x.cancelado ? x.color : "cancelado"
        };
      });
      
      this.pedidosOriginal = pedidosProcesados;
      this.actualizarTabla();
      
      this.cantidadDePedidos = pedidos.length;

      // Totales
      this.pedidosSaldo = pedidos.reduce((acc, x) => acc + (Number(x.pedido?.balance) || 0), 0);
      console.log("pedidos saldo", this.pedidosSaldo)
      this.compraPendientesSaldo = pedidos.reduce((acc, x) => acc + (x.compraData?.compra?.balance || 0), 0);
      this.pedidosPendientes = pedidos.filter(pedido => !pedido.compra && !pedido.cancelado && !(pedido.pedido.status === 'closed' && !pedido.cancelado && pedido.pago.length === 0))

      

      this.saldoPedidosEntregados = pedidos
        .filter(x => x.trackingCompra === "Entregado cliente" && x.pedido?.balance)
        .reduce((acc, x) => acc + Number(x.pedido.balance), 0);

      if(this.estadoFiltrado){
        this.filtrar(this.estadoFiltrado)
      }
    });

  }

  obtenerCompras() {
    this.compras$ = this.comprasService.GetCompras();
    this.compras$.subscribe(compras => {
      this.comprasGeneral = compras.map(c => ({
        ...c,
        entregaInmediata: c.entregaInmediata || false
      }));

      this.compraPendientes = this.comprasGeneral.filter(compra => !compra.pedido && compra.compra.termsConditions !== "ENTREGA INMEDIATA" && !compra.entregaInmediata && !compra.cancelado &&
        !(compra.compra.payments.length === 0 && compra.compra.status === 'closed' && compra.compra.balance !== 0))
      this.compraEntregaInmediata = this.comprasGeneral.filter(compra => compra.entregaInmediata)
      console.log("compras entrega inmediata", this.compraEntregaInmediata)

      console.log(this.compraPendientes)
    })
  }

  asignarCompra(optionCompra: any, pedidoId: string) {
    console.log(this.compraPendientes)
    let productoPedido = this.pedidosOriginal.find(p => p.id === pedidoId)?.pedido.items[0].name;
    let productoCompra = this.compraPendientes.find(c => c.id === optionCompra.value)?.compra.purchases.items[0].name;

    if (productoPedido !== productoCompra) {
      alert("El producto del pedido y la compra no coinciden")
      return;
    }
    this.pedidoService.asignarCompra(optionCompra.value, pedidoId).subscribe({
      next: (data: any) => {
        console.log(data)
        //this.obtenerCompras()
      },
      error: (error: any) => {
        console.log(error)
      },
    });

  }

  cambiarEstadoCompraApi(estado: string, idFactura: string, index: number) {

    this.pedidoService.cambiarEstadoCompra(estado, idFactura).subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  cambiarEstadoCompra(estado: string, idFactura: string, index: number) {
    let novedad = ""
    if (this.pedidosOriginal[index].novedades && this.pedidosOriginal[index].novedades.length > 0) {
      if (estado === "Espera de despacho") {
      } else {
        this.cambiarEstadoCompraApi(estado, idFactura, index);
      }
      novedad = this.pedidosOriginal[index].novedades.map((n: any) => n.novedad).join(", ")
      if (confirm("El pedido tiene las siguientes novedades: " + novedad)) {
        this.cambiarEstadoCompraApi(estado, idFactura, index);
      }
    }else{
      this.cambiarEstadoCompraApi(estado, idFactura, index);
    }




  }

  obtenerColor(tracking: string) {
    const color = this.estadosCompraPedidos.find((x: { name: any; }) => x.name === tracking)?.color
    if (color) {
      return color
    } else {
      return "bg-c-red color-white"
    }
  }

  filtrar(estado: string) {
    // Ejemplo: filtrar por estadoCompra
    const datosFiltrados = this.pedidosOriginal.filter(p => p.estadoCompra === estado || p.trackingCompra === estado);
    this.estadoFiltrado = estado
    this.pedidos$ = of(datosFiltrados);
  }


  pagarSaldoFacturaCompra(pedido: { id: any; compraData: { id: any, saldo: any }; }) {

    const modal = this.modalService.open(PagoCompraComponent, { ariaLabelledBy: 'modal-basic-title' })
    modal.componentInstance.pedido = pedido
    console.log(pedido)
  }
  refrescarPedido() {

  }

  pagarFactura(pedido: any, index: number) {
    const modal = this.modalService.open(PagoFacturaComponent, { ariaLabelledBy: 'modal-basic-title' })
    modal.componentInstance.pedido = pedido

    modal.result.then(
      (data) => {
        console.log('El modal fue cerrado con el siguiente dato:', data);
      },
      (reason) => {
        console.log('El modal fue cerrado o cancelado. Razón:', reason);
      }
    );
  }

  generarFacturaCompra(pedido: any) {
    const modal = this.modalService.open(GenerarFacturaCompraComponent, { ariaLabelledBy: 'modal-basic-title' })
    modal.componentInstance.pedido = pedido
  }

  verDetallePedido(pedido: any) {
    const modal = this.modalService.open(DetallePedidoComponent, { size: 'lg', backdrop: 'static', ariaLabelledBy: 'modal-basic-title' })
    modal.componentInstance.pedido = pedido
  }

  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }

  generarNovedad(pedido: any) {
    const modal = this.modalService.open(GenerarNovedadComponent, { ariaLabelledBy: 'modal-basic-title' })
    modal.componentInstance.pedido = pedido
  }

  cancelarPedido(pedido: any) {
    this.pedidoService.cancelarPedido({ id: pedido.id, compra: pedido.compra }).subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  cancelarCompra(compra: any) {
    this.pedidoService.cancelarCompra({ compraId: compra.id }).subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  actualizarTabla() {
    let datos = [...this.pedidosOriginal];

    // Filtro
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      datos = datos.filter(p =>
        p.clienteNombre?.toLowerCase().includes(term) ||
        p.producto?.toLowerCase().includes(term)
      );
    }
    // Ordenamiento
    if (this.sortColumn && this.sortDirection) {
      datos.sort((a, b) => {
        const res = compare(a[this.sortColumn], b[this.sortColumn]);
        return this.sortDirection === 'asc' ? res : -res;
      });
    }

    this.pedidos$ = of(datos);
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) header.direction = '';
    });

    this.sortColumn = column;
    this.sortDirection = direction;
    this.actualizarTabla();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.actualizarTabla();
  }


  consolidarCarga() {
    const modal = this.modalService.open(ConsolidarCargaComponent, { size: 'lg', backdrop: 'static', ariaLabelledBy: 'modal-basic-title' })
  }

  asignarComoEntregainmediata(compra: any, event: any) {
    const isChecked = event.target.checked;

    this.comprasService.asignarComoEntregainmediata(compra.id, isChecked).subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error: any) => {
        console.log(error)
      },
    });
  }

  habilitarVentaEntregaInmediata(compra: any) {
    this.comprasService.habilitarVentaEntregaInmediata(compra.id).subscribe(resp => {
      if (resp && resp.success) {
        alert("Venta habilitada correctamente")
      } else {
        alert("Error al habilitar la venta")
      }
    })
  }


  notificarLLegada() {
    if (this.accioNotificarLlegada) {
      this.accioNotificarLlegada = false;
    } else {
      this.accioNotificarLlegada = true;
    }
    this.pedidosRecienLlegados = []
  }

  onCheckboxClickNotificarLLegada(pedido: any, event: any) {
    const isChecked = event.target.checked;

    if (isChecked) {
      this.pedidosRecienLlegados.push(pedido);
    } else {
      this.pedidosRecienLlegados = this.pedidosRecienLlegados.filter(p => p.id !== pedido.id);
    }
    if (this.pedidosRecienLlegados.length === 5) {
      this.confirmarLLegada()
    }
    console.log(this.pedidosRecienLlegados);
  }

  confirmarLLegada() {
    if (confirm("¿Está seguro de confirmar la llegada de los pedidos seleccionados? - " + this.pedidosRecienLlegados.length + " pedidos")) {
      // Lógica para confirmar la llegada del pedido
      const modal = this.modalService.open(ResumenPedidosSeleccionadosComponent, { size: 'lg', backdrop: 'static', ariaLabelledBy: 'modal-basic-title' })
      modal.componentInstance.pedidos = this.pedidosRecienLlegados;
    }
  }
}
