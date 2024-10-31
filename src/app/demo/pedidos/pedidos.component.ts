// angular import
import { Component, AfterViewInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbAccordionModule, NgbCollapseModule, NgbDropdownConfig, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [SharedModule, NgbDropdownModule, NgbAccordionModule],
  providers: [NgbDropdownConfig, NgbAccordionModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export default class PedidosComponent implements AfterViewInit {
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

  pedidosContador = 0
  pedidosSaldo = 0
  compraPendientesSaldo=0
  constructor(public pedidoService: PedidosService, public db: AngularFireDatabase) {
    pedidoService.obtenerPedidos()
    db.list('pedidos').valueChanges().subscribe(pedidosArray => {
      this.pedidos = pedidosArray.filter((x:any)=>x.pedido && x.pedido.status!=="void")
      console.log("pedidos", this.pedidos)
      this.pedidosPendientes = this.pedidos.filter(pedido => !pedido.compra).sort(
        (a, b) => a - b
      )
      
      this.obtenerCompras()
    })
    setTimeout(x=>{
      this.pedidosGeneral = this.pedidos
    },2000)

  }

  ngAfterViewInit(){
    setTimeout(x=>{
      this.filtrar("General")
    },2000)
  }

  obtenerCompras() {
    this.pedidoService.obtenerCompras()
    this.db.list('compras').valueChanges().subscribe(comprasArray => {
      this.compras = comprasArray
      this.compras.splice(comprasArray.length - 1, 1)

      const compras = this.compras.filter(compra => !compra.pedido).sort(
        (a, b) => a - b
      )
      this.compraPendientes = compras.filter(x => x.compra.termsConditions != "ENTREGA INMEDIATA")
      this.comprasEntregaInmediata = compras.filter(x => x.compra.termsConditions === "ENTREGA INMEDIATA")
      console.log("compras ENTREGAS INMEDIATAS", this.comprasEntregaInmediata)
      this.obtenerDataCompra()
    })
  }

  asignarCompra(optionCompra: any, pedidoId: string) {
    this.pedidoService.asignarCompra(optionCompra.value, pedidoId)

  }

  obtenerFechaEntregaEstimada(date: string) {
    const fechaEstimada = new Date(date)
    fechaEstimada.setDate(fechaEstimada.getDate() + 15)

    return fechaEstimada
  }

  obtenerCompraPedido(idPedido: any) {
    return this.compras?.find(x => x.pedido === "facturas/" + idPedido)
  }
  obtenerDataCompra() {
    this.pedidos = this.pedidos.map((pedido) => {
      return { ...pedido, compra: this.obtenerCompraPedido(pedido.id), }
    })
  }

  cambiarEstadoCompra(estado: string, idFactura: string) {
    this.pedidoService.cambiarEstadoCompra(estado, idFactura)
  }
  cambiarEstadoVenta(estado: string, idFactura: string) {
    this.pedidoService.cambiarEstadoVenta(estado, idFactura)
  }
  cambiarFechaEntrega(fechaObject: any, idFactura: string) {

    this.pedidoService.cambiarFechaEntrega(fechaObject.year + "-" + fechaObject.month + "-" + fechaObject.day, idFactura)
  }

  obtenerColor(tracking: string) {
    const color = this.estadosCompraPedidos.find(x => x.name === tracking)?.color
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
      this.pedidosSaldo = this.pedidos.reduce((a, b) => { if (b.pedido) return a + b.pedido.balance }, 0)
      this.compraPendientesSaldo = this.compras.reduce((a, b) => {if (b.compra) {return a + b.compra.balance}}, 0)

      } else {
      this.pedidos = this.pedidosGeneral.filter(pedido => pedido.trackingCompra === estado || pedido.estadoCompra === estado || pedido.estadoVenta === estado)
      this.pedidosSaldo = this.pedidos.reduce((a, b) => { if (b.pedido) return a + b.pedido.balance }, 0)
      this.pedidosContador = this.pedidos.length
      console.log(this.compras)
      this.compraPendientesSaldo = this.compras.reduce((a, b) => {if (b.compra) {return a + b.compra.balance}}, 0)
    }

  }


}
