// angular import
import { Component, ViewChild, DestroyRef, inject } from '@angular/core';

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
import { BancosComponent } from 'src/app/components/bancos/bancos.component';
import { Observable, of, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BancoService } from 'src/app/services/banco/banco.service';

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
  imports: [SharedModule, NgApexchartsModule, NgbTooltipModule, BancosComponent] ,
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

  lblBalance:any=""

  balanceGeneral = 0
  obligaciones$: Observable<any[]> = of([]);
  totalObligaciones: number = 0;
  bancos: any[] = [];
  totalBancos = 0;
  pedidosSaldo = 0
  compraPendientesSaldo = 0;
  balanceError = '';
  private readonly destroyRef = inject(DestroyRef);
  private readonly ready = { bancos: false, obligaciones: false, pedidos: false, detalle: false };
  private detailRequest?: Subscription;
  private paymentsRequest?: Subscription;

  private recalcularBalance(): void {
    if (!this.pagosDetalle) return;
    this.pagosDetalle.balanceGeneral = undefined;
    if (this.balanceError || !Object.values(this.ready).every(Boolean)) return;
    // Existing business formula, unchanged.
    this.pagosDetalle.balanceGeneral = this.totalBancos - this.totalObligaciones + this.pedidosSaldo
      + this.pagosDetalle.valorPrestamosPorCobrar - this.compraPendientesSaldo;
    this.crearTarjetas();
  }

  private falloBalance(): void {
    this.balanceError = 'No se pudo completar el balance. Recarga para consultar de nuevo.';
    this.recalcularBalance();
  }

  // constructor
  constructor(public pagoStorageService: PagoStorageService, public pedidoStorageService: PedidoStorageService, public pedidoService: PedidosService, public pagoService: PagoService, public db: AngularFireDatabase, public clienteService: ClientesService, private graficaService: GraficaService,
    private comprasService:ComprasService, private bancosService:BancoService
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
    })

    const hoy = new Date()
    let mes :any = hoy.getMonth()+1
    if(mes < 10){
      mes ="0"+mes
    }
    const ano= hoy.getFullYear()
    this.obtenerPedidos()
    this.obtenerobligaciones()

    this.desde= ano+"-"+mes+"-01"
    this.hasta = ano+"-"+mes+"-"+String(hoy.getDate()).padStart(2, "0")
    this.obtenerBancos()
    this.obtenerDetallesPago(this.desde,this.hasta)
  }

  obtenerobligaciones() {
    this.obligaciones$ = this.comprasService.GetObligacionesMensuales();
    this.obligaciones$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: obligaciones => {
        this.totalObligaciones = obligaciones.reduce((acc, compra) => acc + compra.saldo, 0);
        this.ready.obligaciones = true;
        this.recalcularBalance();
      },
      error: () => this.falloBalance()
    });
  }

  obtenerPedidos() {
    this.pedidoService.GetPedidos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: pedidos => {
        this.pedidosSaldo = pedidos.reduce((acc, x) => acc + (Number(x.pedido?.balance) || 0), 0);
        this.compraPendientesSaldo = pedidos.reduce((acc, x) => acc + (x.compraData?.compra?.balance || 0), 0);
        this.ready.pedidos = true;
        this.recalcularBalance();
      },
      error: () => this.falloBalance()
    });
  }

  obtenerDetallesPago(desde: string, hasta: string) {
    this.detailRequest?.unsubscribe();
    this.paymentsRequest?.unsubscribe();
    this.ready.detalle = false;
    this.recalcularBalance();
    this.detailRequest = this.pagoStorageService.obtenerDetallesPago(desde, hasta)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: resp => {
          this.pagosDetalle = { ...resp.data };
          this.ready.detalle = true;
          this.crearTarjetas();
          this.recalcularBalance();
        },
        error: () => this.falloBalance()
      });
    this.paymentsRequest = this.pagoStorageService.obtenerPagos(desde, hasta)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: resp => {
          this.pagos = resp.data.filter((x: undefined) => x !== undefined);
          this.pagosDomicilio = this.pagos.reduce((a, b) => {
            return b?.pago?.categories?.[0]?.id === '5208' ? a + b.pago.amount : a;
          }, 0);
        },
        error: () => { this.pagos = []; }
      });
  }

  crearTarjetas() {

    this.cards = [
      {
        background: 'bg-c-gold',
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
        background: 'bg-c-red',
        title: 'Obligaciones por pagar este mes',
        icon: 'icon-repeat',
        text: '',
        img: "assets/images/arrow-red.webp",
        widthImg: "60px",
        number: this.totalObligaciones,
        //no: 0

      },
      {
        background: 'bg-c-blue-addi',
        title: 'Ventas ADDI',
        icon: 'icon-shopping-cart',
        text: '',
        img: "assets/images/addi-logo.avif",
        widthImg: "90px",
        number: this.pagosDetalle.totalPagosAddi,
        no: ""
      },
      {
        background: 'bg-c-yellow-siste',
        title: 'Ventas SISTECREDITO',
        icon: 'icon-repeat',
        text: '',
        img: "assets/images/sistecredito-logo.png",
        widthImg: "100px",
        number: this.pagosDetalle.totalPagosSistecredito,
        // no: 0

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
        background: 'bg-c-red',
        title: 'Compras pendientes',
        icon: 'icon-repeat',
        text: '',
        number: this.pagosDetalle.cantidadComprasPendientes,
        number2: this.pagosDetalle.totalComprasPendientes,
        no: "",
        //no2: ""

      },
       {
        background: 'bg-c-blue-soft',
        title: 'Desembolsos ADDI',
        icon: 'icon-shopping-cart',
        text: '',
        img: "assets/images/addi-logo.avif",
        widthImg: "50px",
        number: this.pagosDetalle.totalDesembolsosAddi,
        no: ""
      },
      {
        background: 'bg-c-yellow-soft',
        title: 'Desembolsos SISTECREDITO',
        icon: 'icon-repeat',
        text: '',
        img: "assets/images/sistecredito-logo.png",
        widthImg: "60px",
        number: this.pagosDetalle.totalDesembolsosSistecredito,
        // no: 0

      },

      {
        background: 'bg-c-green',
        title: 'Cartera',
        img: 'assets/icon/dollar-sign.svg',
        text: '',
        widthImg: "30px",
        number: this.pagosDetalle.totalCartera,
        no: ""
      },

        {
        background: 'bg-c-green',
        title: 'Pagos Transferencias',
        img: 'assets/icon/dollar-sign.svg',
        text: '',
        widthImg: "30px",
        number: this.pagosDetalle.totalPagosTransferencia,
        no: ""
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
            if(data.success){
              this.obtenerDetallesPago(this.desde,this.hasta)
            }
          })
  }

   obtenerBancos(){
    this.bancosService.obtenerBancos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resp: any) => {
        this.bancos = resp.data.map((banco: any) => ({
          ...banco,
          class: banco.balance > 0 ? 'bg-c-green order-card' : 'bg-c-red order-card'
        }));
        this.totalBancos = this.bancos.reduce((acc, banco) => acc + banco.balance, 0);
        this.ready.bancos = true;
        this.recalcularBalance();
      },
      error: () => this.falloBalance()
    });
  }


}
