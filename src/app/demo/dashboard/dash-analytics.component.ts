// angular import
import { Component, ViewChild, OnDestroy, inject } from '@angular/core';

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
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ClientesService } from 'src/app/services/clientes/clientes.service';
import { PagoService } from 'src/app/services/pago/pago.service';
import { GraficaService } from 'src/app/services/graficas/grafica.service';
import { PedidoStorageService } from 'src/app/services/pedidos/pedido-storage.service';
import { PagoStorageService } from 'src/app/services/pago/pago-storage.service';
import { ComprasService } from 'src/app/services/compras/compras.service';

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

  calendar = inject(NgbCalendar);
	formatter = inject(NgbDateParserFormatter);

  hoy = new Date()
	hoveredDate: NgbDate | null = null;
	fromDate: NgbDate | null =   new NgbDate(this.hoy.getFullYear(),this.hoy.getMonth()+1,1)
  toDate: NgbDate | null = this.calendar.getToday();

  
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

  pagosDetalle: any
  // constructor
  constructor(public pagoStorageService: PagoStorageService, public pedidoStorageService: PedidoStorageService, public pedidoService: PedidosService, public pagoService: PagoService, public db: AngularFireDatabase, public clienteService: ClientesService, private graficaService: GraficaService,
    private comprasService:ComprasService
  ) {
    //connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8080);
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

   

    const hoy = new Date()
    let mes :any = hoy.getMonth()+1
    if(mes < 10){
      mes ="0"+mes
    }
    const ano= hoy.getFullYear()


    this.obtenerDetallesPago(ano+"-"+mes+"-01",ano+"-"+mes+"-"+hoy.getDate())
    
    pagoStorageService.obtenerPagos(ano+"-"+mes+"-01",ano+"-"+mes+"-"+hoy.getDate()).subscribe(resp=>{
      this.pagos=resp.data.filter((x: undefined)=>x!==undefined)
      this.crearGraficaBarrasComprasAbonos();
    })
  }

  obtenerDetallesPago(desde: string,hasta: string){
    console.log(desde,hasta)
    this.pagoStorageService.obtenerDetallesPago(desde,hasta).subscribe(resp=>{
      this.pagosDetalle=resp.data
      this.crearTarjetas()
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

    this.cards = [
      {
        background: 'bg-c-blue',
        title: 'Total pedidos',
        icon: 'icon-shopping-cart',
        text: '',
        number: this.pagosDetalle.totalPedidos,
        no: ""
      },
      {
        background: 'bg-c-green',
        title: 'Total ventas',
        icon: 'icon-tag',
        text: '',
        number: this.pagosDetalle.totalVentas,
        no: ""
      },
      {
        background: 'bg-c-yellow',
        title: 'Compras pendientes',
        icon: 'icon-repeat',
        text: '',
        number: this.pagosDetalle.cantidadComprasPendientes,
        number2: this.pagosDetalle.totalComprasPendientes,
        no: "",
        //no2: ""

      },
      {
        background: 'bg-c-red',
        title: 'Total de compras',
        icon: 'icon-shopping-cart',
        text: '',
        number: this.pagosDetalle.totalCompras,
        no: ""
      },
      {
        background: 'bg-c-purple',
        title: 'Cartera',
        img: 'assets/icon/dollar-sign.svg',
        text: '',
        widthImg: "30px",
        number: this.pagosDetalle.totalCartera,
        no: ""
      },
        {
        background: 'bg-c-purple',
        title: 'Pagos Transferencias',
        img: 'assets/icon/dollar-sign.svg',
        text: '',
        widthImg: "30px",
        number: this.pagosDetalle.totalPagosTransferencia,
        no: ""
      },
      
      {
        background: 'bg-c-blue',
        title: 'Ventas ADDI',
        icon: 'icon-shopping-cart',
        text: '',
        img: "assets/images/addi-logo.avif",
        widthImg: "50px",
        number: this.pagosDetalle.totalPagosAddi,
        no: ""
      },
      {
        background: 'bg-c-yellow',
        title: 'Ventas SISTECREDITO',
        icon: 'icon-repeat',
        text: '',
        img: "assets/images/sistecredito-logo.png",
        widthImg: "60px",
        number: this.pagosDetalle.totalPagosSistecredito,
       // no: 0

      },
      {
        background: 'bg-c-purple',
        title: 'En transito a Medellín (Saldo)',
        icon: 'icon-send',
        text: '',
        img: "assets/icon/truck.svg",
        widthImg: "30px",
        number: this.pagosDetalle.cantidadPedidosEnTransito,
        number2: this.pagosDetalle.valorSaldoPedidosEnTransito,
        //no: 0,
        //no2: 0

      },
      {
        background: 'bg-c-blue',
        title: 'Espera de despacho',
        icon: 'icon-calendar',
        text: '',
        number: this.pagosDetalle.cantidadEsperaDespacho,
        number2: this.pagosDetalle.valorSaldoEsperaDespacho,
       // no: 0,
        //no2: 0

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

  onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
			this.toDate = date;

      const diaDesde =  (this.fromDate.day < 10) ? '0' + this.fromDate.day.toString() : this.fromDate.day.toString();
      const mesDesde =  (this.fromDate.month < 10) ? '0' + this.fromDate.month.toString() : this.fromDate.month.toString();
      const desde = this.fromDate.year+"-"+mesDesde+"-" + diaDesde
      
      const diaHasta=(this.toDate.day < 10) ? '0' + this.toDate.day.toString() : this.toDate.day.toString();
      const mesHasta =  (this.toDate.month < 10) ? '0' + this.toDate.month.toString() : this.toDate.month.toString();
      const hasta = this.toDate.year+"-"+mesHasta+"-"+diaHasta

      this.obtenerDetallesPago(desde,hasta)

		} else {
			this.toDate = null;
			this.fromDate = date;
		}
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}


}
