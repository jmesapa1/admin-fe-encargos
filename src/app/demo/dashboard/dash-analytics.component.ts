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
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDropdownConfig,
  NgbModal,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { ClientesService } from 'src/app/services/clientes/clientes.service';
import { PagoService } from 'src/app/services/pago/pago.service';
import { GraficaService } from 'src/app/services/graficas/grafica.service';
import { PedidoStorageService } from 'src/app/services/pedidos/pedido-storage.service';
import { PagoStorageService } from 'src/app/services/pago/pago-storage.service';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { DetallePedidoComponent } from '../modal/detalle-pedido/detalle-pedido.component';
import { AgregarGastoComponent } from '../modal/agregar-gasto/agregar-gasto.component';
import { GastosService } from '../../services/gastos/gastos.service';

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
  imports: [SharedModule, NgApexchartsModule, NgbTooltipModule],
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
  private modalService = inject(NgbModal);


  hoy = new Date()
	hoveredDate: NgbDate | null = null;
	fromDate: NgbDate | null =   new NgbDate(this.hoy.getFullYear(),this.hoy.getMonth()+1,1)
  toDate: NgbDate | null = this.calendar.getToday();
  desde:string=""
  hasta:string=""


  pedidos: any[] = []
  compras: any[] = []
  pagos: any[] = []
  pagosDomicilio = 0

  cards: any[] = []
  totalVentas = 0;
  totalCompras = 0;

  totalCartera = 0
  clientes: any = []
  gastos:any = []

  pagosDetalle: any

  totalGastos = 0
  totalPagoGastos=0
  // constructor
  constructor(public pagoStorageService: PagoStorageService, public pedidoStorageService: PedidoStorageService, public pedidoService: PedidosService, public pagoService: PagoService, public db: AngularFireDatabase, public clienteService: ClientesService, private graficaService: GraficaService,
    private comprasService:ComprasService, private gastosService:GastosService
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

    this.desde= ano+"-"+mes+"-01"
    this.hasta = ano+"-"+mes+"-"+hoy.getDate()

    this.obtenerDetallesPago(this.desde,this.hasta)
    this.obtenerGastos()
  }

  obtenerDetallesPago(desde: string,hasta: string){
    console.log(desde,hasta)
    this.pagoStorageService.obtenerDetallesPago(desde,hasta).subscribe(resp=>{
      this.pagosDetalle=resp.data
      this.crearTarjetas()

    })

    this.pagoStorageService.obtenerPagos(desde,hasta).subscribe(resp=>{
      this.pagos = resp.data.filter((x: undefined)=>x!==undefined)
      this.pagosDomicilio = this.pagos.reduce((a, b) => {
        console.log(a,b)
        if (b && b.pago.categories && b.pago.categories[0]&& b.pago.categories[0].id ==="5208") {
          return a + b.pago.amount
        }else{
          return a
        }
      }, 0)
    })
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
        background: 'bg-c-yellow',
        title: 'Gasto domicilios',
        img: 'assets/icon/dollar-sign.svg',

        text: '',
        number: this.pagosDomicilio,
        // no: 0,
        //no2: 0

      },
      {
        background: 'bg-c-yellow',
        title: 'Facturas provedor pagas',
        img: 'assets/icon/dollar-sign.svg',

        text: '',
        number: this.pagosDetalle.pagosProvedor,
        // no: 0,
        //no2: 0

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
        title: 'Desembolsos ADDI',
        icon: 'icon-shopping-cart',
        text: '',
        img: "assets/images/addi-logo.avif",
        widthImg: "50px",
        number: this.pagosDetalle.totalDesembolsosAddi,
        no: ""
      },
      {
        background: 'bg-c-yellow',
        title: 'Desembolsos SISTECREDITO',
        icon: 'icon-repeat',
        text: '',
        img: "assets/images/sistecredito-logo.png",
        widthImg: "60px",
        number: this.pagosDetalle.totalDesembolsosSistecredito,
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

      this.desde = desde
      this.hasta = hasta
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


  agregarPago(gasto:any | undefined) {
       const modal=  this.modalService.open(AgregarGastoComponent, { ariaLabelledBy: 'modal-basic-title' })
        if(gasto){
          modal.componentInstance.gasto = gasto
        }
        modal.result.then((data:any) => {
            console.log(data)
            if(data.success){
              this.obtenerDetallesPago(this.desde,this.hasta)
              this.obtenerGastos()
            }
          })
  }

  obtenerGastos(){
    this.gastosService.obtenerGastosFijos().subscribe(resp=>{
      if(resp){
        this.gastos = resp.data.conceptos
        this.totalGastos = this.gastos.reduce((a:any,b:any) => a + Number(b.valor), 0);
        this.totalPagoGastos = this.gastos.reduce((a:any,b:any) => a + Number(b.valorPagado), 0);

      }
    })
  }

}
