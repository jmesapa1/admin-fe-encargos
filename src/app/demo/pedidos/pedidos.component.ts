/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { DecimalPipe } from '@angular/common';
import { Component, AfterViewInit, QueryList, ViewChildren, OnInit, TemplateRef, inject } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbAccordionModule, NgbDropdownConfig, NgbDropdownModule, NgbHighlight, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sort-table.directive';
import { FilterableTable } from 'src/app/directives/sort/filterable-table';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { PedidoStorageService } from 'src/app/services/pedidos/pedido-storage.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetallePedidoComponent } from '../modal/detalle-pedido/detalle-pedido.component';

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [SharedModule, NgbDropdownModule, NgbAccordionModule,NgbdSortableHeader,DecimalPipe, NgbHighlight, NgbdSortableHeader, NgbPaginationModule],
  providers: [NgbDropdownConfig, NgbAccordionModule,DecimalPipe, FilterableTable],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export default class PedidosComponent  {
  @ViewChildren(NgbdSortableHeader)
  headers!: QueryList<NgbdSortableHeader>;
  
	private modalService = inject(NgbModal);

  peidosCompraLbl = [{ title: 'Cliente' }, { title: 'Producto' }, { title: 'Fecha pedido' }, { title: 'V. venta' }, { title: 'Fecha compra' }, { title: 'v. compra' }, { title: 'Saldo compra' }, { title: 'Estado compra' }
    , { title: 'Estado venta' }, { title: 'F.E compra' }, { title: 'F.E venta' }
  ]

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
    }
  ];
  estadosCompraPedidos = [{ color: "bg-c-blue", name: "En camino a MED" }, { color: "bg-c-blue", name: "En camino USA" }, { color: "bg-c-purple", name: "Entregado a USA" }, { color: "bg-c-yellow", name: "Espera de despacho" }, { color: "bg-c-green", name: "Entregado cliente" }]
  estadosVenta = ["Espera de entrega", "Entregados"]



  pedidos: any[] = []
  pedidosGeneral: any[] = []
  compras: any[] = []
  pedidosPendientes: any[] = []
  compraPendientes: any[] = []
  comprasEntregaInmediata: any[] = []

  totalPedidosCaminoMed = 0

  pedidosContador = 0
  pedidosSaldo = 0
  compraPendientesSaldo=0
  saldoPedidosEntregados=0


  pedidos$!: Observable<any[]>;
	total$!: Observable<number>;
  closeResult: any;


  constructor(public pedidoService: PedidosService,private comprasService:ComprasService, private pedidoStorageService:PedidoStorageService,public db: AngularFireDatabase, public tableService:FilterableTable) {
    pedidoService.obtenerPedidos()
    this.obtenerCompras()
    this.obtenerPedidos()


    
    setTimeout((x: any)=>{
      this.pedidosGeneral = this.pedidos
    },2000)

  }

  obtenerPedidos(){
    this.pedidoStorageService.obtenerPedidos().subscribe(async resp=>{
      this.pedidos=resp.data.filter((x: undefined)=>x!==undefined).sort(
        (a: { fecha: any; }, b: { fecha: any; }) => new Date(a.fecha).getTime() > new Date(b.fecha).getTime() ? -1 : 0
      )
      this.pedidos= this.pedidos.map(x=>{ return {
        ...x, 
        clienteNombre: x.pedido.client.name,
        producto: x.pedido?.items[0].name,
        valorCompra:x.compraData ? x.compraData.valor : 0  ,
        saldoCompra:x.compraData ? x.compraData.saldo : 0 

      }})
      this.pedidosGeneral=this.pedidos 
      this.pedidosPendientes = this.pedidos.filter(pedido => !pedido.compra)
      
      this.tableService._displayedResults$.next(this.pedidos)
      this.pedidos$ = this.tableService.displayedResults$
      this.tableService.allValues=this.pedidos
      this.filtrar("General")

    })
  }

  obtenerCompras() {
    this.pedidoService.obtenerCompras()
    this.comprasService.obtenerComprasData().subscribe((resp: { data: any[]; })=>{
      this.compras=resp.data.filter((x: undefined)=>x!==undefined).sort(
        (a: { fecha: any; }, b: { fecha: any; }) => new Date(a.fecha).getTime() > new Date(b.fecha).getTime() ? -1 : 0
      )
      console.log("compras->",resp,this.compras)
      this.compraPendientes= this.compras.filter(compra => !compra.pedido && compra.compra.termsConditions !== "ENTREGA INMEDIATA")
      console.log("compras pendientes ->",this.compraPendientes)
    })
    
      this.obtenerDataCompra()
  }

  asignarCompra(optionCompra: any, pedidoId: string) {
    this.pedidoService.asignarCompra(optionCompra.value, pedidoId).subscribe({
      next: (data: any) => {
        console.log(data)
        this.obtenerCompras()
        this.obtenerPedidos()
      },
      error: (error: any) => {
        console.log(error)
      },
    });

  }

  obtenerFechaEntregaEstimada(date: string) {
    const fechaEstimada = new Date(date)
    fechaEstimada.setDate(fechaEstimada.getDate() + 15)

    return fechaEstimada
  }

  obtenerCompraPedido(idPedido: any) {
    return this.compras?.find((x: { pedido: string; }) => x.pedido === "facturas/" + idPedido)
  }
  obtenerDataCompra() {
    this.pedidos = this.pedidos.map((pedido: { id: any; }) => {
      return { ...pedido, compra: this.obtenerCompraPedido(pedido.id), }
    })
  }

  cambiarEstadoCompra(estado: string, idFactura: string) {
    this.pedidoService.cambiarEstadoCompra(estado, idFactura)
    this.obtenerCompras()
    this.obtenerPedidos()
  }
  cambiarEstadoVenta(estado: string, idFactura: string) {
    this.pedidoService.cambiarEstadoVenta(estado, idFactura)
  }
  cambiarFechaEntrega(fechaObject: any, idFactura: string) {

    this.pedidoService.cambiarFechaEntrega(fechaObject.year + "-" + fechaObject.month + "-" + fechaObject.day, idFactura)
  }

  obtenerColor(tracking: string) {
    const color = this.estadosCompraPedidos.find((x: { name: any; }) => x.name === tracking)?.color
    if (color) {
      return color
    } else {
      return "bg-c-red"
    }
  }

  filtrar(estado: string) {
    if (estado === "General") {
      this.pedidos = this.pedidosGeneral
      this.pedidosContador = this.pedidosGeneral.length
      this.pedidosSaldo = this.pedidos.reduce((a: any, b: { pedido: { balance: any; }; }) => { if (b.pedido) return a + b.pedido.balance }, 0)
      this.compraPendientesSaldo = this.pedidos.reduce((a: any, b: { compraData: any }) => {if (b.compraData) {return a + b.compraData.compra.balance}}, 0)
      
      this.saldoPedidosEntregados=this.pedidos.filter((a: any) => a.trackingCompra === "Entregado cliente" && a.pedido.balance ).reduce((a: any, b: any) => { return a + b.pedido.balance}, 0)

      this.tableService._displayedResults$.next(this.pedidos)
      this.pedidos$ = this.tableService.displayedResults$

    } else {
      this.pedidos = this.pedidosGeneral.filter((pedido :any ) => pedido.trackingCompra === estado || pedido.estadoCompra === estado)
      console.log(this.pedidos)
      this.pedidosSaldo = this.pedidos.reduce((a: any, b: { pedido: { balance: any; }; }) => { if (b.pedido) return a + b.pedido.balance }, 0)
      this.pedidosContador = this.pedidos.length
      this.compraPendientesSaldo = this.pedidos.reduce((a: any, b: { compraData: any }) => {if (b.compraData) {return a + b.compraData.compra.balance}}, 0)

      this.saldoPedidosEntregados=this.pedidos.filter((a: any) => a.trackingCompra === "Entregado cliente" && a.pedido.balance ).reduce((a: any, b: any) => { return  a + b.pedido.balance }, 0)
      this.tableService._displayedResults$.next(this.pedidos)
      this.pedidos$ = this.tableService.displayedResults$

      }

  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
			if (header.sortable !== column) {
				header.direction = '';
			}
		});

		this.tableService.sortColumn = column;
		this.tableService.sortDirection = direction;
	}

  refrescarPedido(){

  }

  verDetallePedido(pedido:any) {
     const modal=  this.modalService.open(DetallePedidoComponent, { ariaLabelledBy: 'modal-basic-title' })
      modal.componentInstance.pedido = pedido
    }
  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }
}
