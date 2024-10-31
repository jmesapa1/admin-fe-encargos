// angular import
import { Component, ViewChild, OnDestroy } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ApexTheme, NgApexchartsModule } from 'ng-apexcharts';
import { ProductSaleComponent } from './tabla-pedidos/tabla-pedidos.component';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexLegend,
  ApexFill,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip,
  ApexMarkers
} from 'ng-apexcharts';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';
import { Observable } from 'rxjs';
import { Factura } from 'src/app/types/factura';
import { NgbDropdownConfig, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientesService } from 'src/app/services/clientes/clientes.service';
import { PagoService } from 'src/app/services/pago/pago.service';
import { set } from 'lodash';
import { GraficaService } from 'src/app/services/graficas/grafica.service';
import { PedidoStorageService } from 'src/app/services/pedidos/pedido-storage.service';
import { PagoStorageService } from 'src/app/services/pago/pago-storage.service';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { Firestore, collection, connectFirestoreEmulator, getDocs, getFirestore, query } from '@angular/fire/firestore';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  fill: ApexFill;
  grid: ApexGrid;
  markers: ApexMarkers;
  theme: ApexTheme;
};

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule, ProductSaleComponent],
  providers: [NgbDropdownConfig],
  templateUrl: './dash-analytics.component.html',
  styleUrls: ['./dash-analytics.component.scss']
})
export default class DashAnalyticsComponent {
  // public props
  @ViewChild('chart') chart!: ChartComponent;
  @ViewChild('customerChart') customerChart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;
  chartOptions_1!: Partial<ChartOptions>;
  chartOptions_2!: Partial<ChartOptions>;
  chartOptions_3!: Partial<ChartOptions>;

  pedidos: any[] = []
  compras: any[] = []
  pagos: any[] = []

  cards: any[] = []
  totalVentas = 0;
  totalCompras = 0;
  totalVentasMes = 0
  abonosMes = 0

  totalComprasMes = 0
  totalCartera = 0

  disponibleSisteCredito = 0
  disponibleAddi = 0

  porcentajeCartera = 0
  graficas = false
  clientes: any = []
  fechasArray: any[] = []
  dataIngreso: any[] = []
  dataEgreso: any[] = []
  graficaFlujo = false
  graficaSemanaSemana = false

  // constructor
  constructor(public pagoStorageService: PagoStorageService, public pedidoStorageService: PedidoStorageService, public pedidoService: PedidosService, public pagoService: PagoService, public db: AngularFireDatabase, public clienteService: ClientesService, private graficaService: GraficaService,
    private comprasService:ComprasService
  ) {
    connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8080);
    pedidoService.obtenerPedidos()
    comprasService.obtenerCompras()
    pagoService.obtenerPagos()

    pedidoStorageService.obtenerPedidos().subscribe(resp=>{
      this.pedidos=resp.data.filter((x: undefined)=>x!==undefined)
    })
    
    comprasService.obtenerComprasData().subscribe(resp=>{
      this.compras=resp.data.filter((x: undefined)=>x!==undefined)
      console.log(this.pagos)
    })

    pagoStorageService.obtenerPagos().subscribe(resp=>{
      this.pagos=resp.data.filter((x: undefined)=>x!==undefined)
      this.crearGraficaBarrasComprasAbonos();
      this.crearTarjetas()
    })

    /*this.clienteService.obtenerClientes()
    this.pagoService.obtenerPagos()*/


    this.pagoStorageService.getPagos$().subscribe(pagos => {
      this.pagos = pagos
      this.pagos.splice(pagos.length - 1, 1)
      console.log("pagos- ", this.pagos)
      this.crearGraficaBarrasComprasAbonos();
    })

    /*this.pedidoStorageService.getPedidos$().subscribe(pedidos => {
      this.pedidos = pedidos.filter((x:any)=>x.pedido && x.pedido.status!=="void")
    })*/

    db.list('clientes').valueChanges().subscribe(clientesArray => {
      this.clientes = clientesArray
    })

  }


  

   
  crearGraficaBarrasComprasAbonos() {
    this.chartOptions = this.graficaService.crearGraficaBarrasComprasAbonos(this.pagos)
    this.abonosMes = this.pagos.reduce((a, b) => {
      if (b.tipo === "in" && !b.pago.anotation && new Date(b.date).getMonth() === new Date().getMonth()) {
        return a + b.pago.amount
      } else {
        return a
      }
    }, 0)
  }

  obtenerPedidosPorMes() {
    return this.pedidoStorageService.obtenerPedidosPorMes(this.pedidos)
  }

  obtenerSumaPedidos(pedidos: any[]) {
    return this.pedidoStorageService.obtenerSumaPedidos(pedidos)
  }

  obtenerComprasPorMes(arrayCompras: any[]) {
    return arrayCompras.filter(x => {
      const month = new Date().getMonth()
      const monthCompra = x.compra.date.split("-")[1]
      if (Number(monthCompra) - 1 === Number(month)) {
        return x
      }
    })
  }

  obtenerSumaCompras(array: any[], balance: boolean) {
    if (!balance) {
      return array.reduce((a, b) => {
        if (b.compra) {
          this.totalCompras = a + b.compra.total
          return a + b.compra.total
        }
      }, 0)
    } else {
      this.totalCompras = 0
      return array.reduce((a, b) => {
        if (b.compra) {
          return a + b.compra.balance
        }
      }, 0)
    }

  }
  obtenerCartera() {
    return this.pedidos.reduce((a, b) => {
      if (b.pedido) {
        return a + b.pedido.balance
      }
    }, 0)
  }

  obtenerClientes() {
    this.clienteService.obtenerClientes()

  }

  obtenerCompras() {
    this.pedidoService.obtenerCompras()
    this.db.list('compras').valueChanges().subscribe(comprasArray => {
      const promise = new Promise<any>((resolveOuter) => {
        console.log("compras ", comprasArray)
        this.compras = comprasArray
        this.compras.splice(comprasArray.length - 1, 1)
        resolveOuter(this.compras)
      })
      promise.then(() => this.compras.length > 0 ? this.crearTarjetas() : null)
    });
  }
  crearTarjetas() {
    const comprasPendientes = this.compras.filter(compra => {
      if (compra.compra.balance > 0 || (compra.compra.balance === 0 && compra.compra.total === 0) && (compra.compra.termsConditions !== 'ENTREGA INMEDIATA' && !compra.pedido)) {
        return compra
      }
    })
    this.totalVentas = this.obtenerSumaPedidos(this.pedidos)
    this.totalCompras = this.obtenerSumaCompras(this.compras, false)
    this.totalComprasMes = this.obtenerSumaCompras(this.obtenerComprasPorMes(comprasPendientes), true)
    this.totalVentasMes = this.obtenerSumaPedidos(this.obtenerPedidosPorMes())
    this.totalCartera = this.obtenerCartera()
    this.porcentajeCartera = (this.totalCartera / this.totalVentas) * 100

    this.cards = [
      {
        background: 'bg-c-blue',
        title: 'Total pedidos',
        icon: 'icon-shopping-cart',
        text: 'Este Mes',
        number: this.pedidos.length,
        no: this.obtenerPedidosPorMes().length
      },
      {
        background: 'bg-c-green',
        title: 'Total ventas',
        icon: 'icon-tag',
        text: 'Este Mes',
        number: this.obtenerSumaPedidos(this.pedidos),
        no: this.obtenerSumaPedidos(this.obtenerPedidosPorMes())
      },
      {
        background: 'bg-c-yellow',
        title: 'Compras pendientes',
        icon: 'icon-repeat',
        text: 'Este Mes',
        number: comprasPendientes.length,
        number2: this.obtenerSumaCompras(this.compras, true),
        no: this.obtenerComprasPorMes(comprasPendientes).length,
        no2: this.obtenerSumaCompras(this.obtenerComprasPorMes(comprasPendientes), true)

      },
      {
        background: 'bg-c-red',
        title: 'Total de compras',
        icon: 'icon-shopping-cart',
        text: 'Este Mes',
        number: this.obtenerSumaCompras(this.compras, false),
        no: this.obtenerSumaCompras(this.obtenerComprasPorMes(this.compras), false)
      },
      {
        background: 'bg-c-purple',
        title: 'Cartera',
        img: 'assets/icon/dollar-sign.svg',
        text: 'Este mes',
        widthImg: "30px",
        number: this.totalCartera,
        no: this.pedidoStorageService.obtenerPedidosPorMes(this.pedidos).reduce((a, b) => {
          if (b.pedido) return a + b.pedido.balance
        }, 0)
      },
      {
        background: 'bg-c-blue',
        title: 'Ventas ADDI',
        icon: 'icon-shopping-cart',
        text: 'Sin pagar a hoy',
        img: "assets/images/addi-logo.avif",
        widthImg: "50px",
        number: this.obtenerPagosMesMedioPago("ADDI", false),
        no: this.obtenerPagosMesMedioPago("ADDI", true)
      },
      {
        background: 'bg-c-yellow',
        title: 'Ventas SISTECREDITO',
        icon: 'icon-repeat',
        text: 'Sin pagar a hoy',
        img: "assets/images/sistecredito-logo.png",
        widthImg: "40px",
        number: this.obtenerPagosMesMedioPago("SISTECREDITO", false),
        no: this.obtenerPagosMesMedioPago("SISTECREDITO", true)

      },
      {
        background: 'bg-c-purple',
        title: 'En transito a Medellín (Saldo)',
        icon: 'icon-send',
        text: 'AMAZON',
        img: "assets/icon/truck.svg",
        widthImg: "30px",
        number: this.obtenerPedidosEstado("En camino a MED", false).length,
        number2: this.obtenerSaldoEstado("En camino a MED", false),
        no: this.obtenerPedidosEstado("En camino a MED", "AMAZON").length,
        no2: this.obtenerSaldoEstado("En camino a MED", "AMAZON")

      },
      {
        background: 'bg-c-blue',
        title: 'Espera de despacho',
        icon: 'icon-calendar',
        text: 'Saldo',
        number: this.obtenerPedidosEstado("Espera de despacho", false).length,
        number2: this.obtenerSumaPedidosEstado("Espera de despacho", false),
        no: this.obtenerComprasSalgoEstado("Espera de despacho").length,
        no2: this.obtenerSaldoEstado("Espera de despacho", false)

      },
    ];

    this.crearGraficasDona()
    this.crearGraficaSemanaASemana()
  }

  crearGraficaSemanaASemana() {
    const ingresos = this.pagos.filter(pago => pago.tipo === "in")
    this.chartOptions_3 = this.graficaService.crearGraficaSemanaASemana(this.compras, ingresos)
    this.graficaSemanaSemana = true
  }

  crearGraficasDona() {
    this.chartOptions_1 = this.graficaService.crearGraficasDona(this.totalCartera, this.totalVentas)
  }

  obtenerPagosMesMedioPago(medioPago: string, mesActual: boolean) {
    if (!mesActual) {
      return this.pedidos.filter(pedido => pedido.pago && pedido.pago.formaPago === medioPago)
        .reduce((a, b) => {
          if (b.pedido) {
            return a + b.pedido.total
          }
        }, 0)
    } else {
      return this.pedidos.filter(pedido => {
        if (pedido.pago && pedido.pago.formaPago === medioPago) {
          if (new Date(pedido.pago.fechaDesembolso) > new Date()) {
            return pedido
          }
        }
      })
        .reduce((a, b) => {
          if (b.pedido) {
            return a + b.pedido.total
          }
        }, 0)
    }

  }

  obtenerSumaPedidosEstado(estado: string, tienda: string | boolean) {
    if (estado) {
      if (tienda) {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado
          && tienda === this.compras.find(compra => "compras/" + compra.id === pedido.compra).compra.provider.name
        )
          .reduce((a, b) => {
            if (b.pedido) {
              return a + b.pedido.total
            }
          }, 0)
      } else {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado)
          .reduce((a, b) => {
            if (b.pedido) {
              return a + b.pedido.total
            }
          }, 0)
      }

    }
  }
  obtenerPedidosEstado(estado: string, tienda: string | boolean) {
    if (estado) {
      if (tienda) {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado
          && tienda === this.compras.find(compra => "compras/" + compra.id === pedido.compra).compra.provider.name
        )
      } else {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado)

      }
    } else {
      return []
    }
  }

  obtenerSaldoEstado(estado: string | boolean, tienda: string | boolean) {
    if (estado) {
      if (!tienda) {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado)
          .reduce((a, b) => {
            if (b.pedido) {
              return a + b.pedido.balance
            }
          }, 0)
      } else {
        return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado
          && tienda === this.compras.find(compra => "compras/" + compra.id === pedido.compra).compra.provider.name
        )
          .reduce((a, b) => {
            if (b.pedido) {
              return a + b.pedido.balance
            }
          }, 0)
      }
    } else {
      return 0
    }
  }
  obtenerComprasSalgoEstado(estado: string | boolean) {
    return this.pedidos.filter(pedido => pedido.trackingCompra && pedido.trackingCompra === estado)
  }


}
