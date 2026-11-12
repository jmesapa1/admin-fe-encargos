import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { Observable, of } from 'rxjs';
import { ObligacionService } from 'src/app/services/obligacion/obligacion.service';

@Component({
  selector: 'app-agregar-gasto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './agregar-gasto.component.html',
  styleUrl: './agregar-gasto.component.scss'
})
export class AgregarGastoComponent {
  @Input() public tipoGasto: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;

  gastos =
    [{ concepto: 'DOMICILIO', idConcepto: '5296' },
    { concepto: 'CAJA USA', idConcepto: '5298' },
    { concepto: 'SERVICIOS PUBLICOS - AGUA LEDS', idConcepto: '5301' },
    { concepto: 'ALEGRA', idConcepto: '5301' },
    { concepto: 'BOLSAS, MARCADORES, CINTA, ETC.', idConcepto: '5299' },
    { concepto: 'CHAVA', idConcepto: '5301' },
    { concepto: 'DIEGO', idConcepto: '5301' },
    { concepto: 'APARTAMENTO PELDAR', idConcepto: '5301' },
    { concepto: 'SALARIO TRABAJADORA', idConcepto: '5299' },
    { concepto: 'GASTO JULIAN', idConcepto: '5300' },
    { concepto: 'DAVIVIENDA', idConcepto: '5301' },
    { concepto: 'BANCOLOMBIA', idConcepto: '5301' },
    { concepto: 'ARRIENDO MIRIAM', idConcepto: '5301' }];

  obligaciones$: Observable<any[]> = of([]);
  obligacionesMensuales: boolean = false;
  tipoGastoSeleccionado: any = {}
  obligacionSeleccionada: any = {}
  constructor(private pagoService: PagoService, private comprasService: ComprasService, private obligacionService: ObligacionService) {
    let date = new Date();

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    let year = date.getFullYear();

    let formattedDate = `${day}-${month}-${year}`;
    this.pagoForm = new FormGroup({
      concepto: new FormControl(''),
      idConcepto: new FormControl(''),
      idMedioPago: new FormControl(''),
      valor: new FormControl(''),
      fecha: new FormControl(this.getFechaActual()),
      descripcion: new FormControl('')

    });
  }

  ngOnInit() {

    //SOLO PARA OBLIGACIONES MENSUALES
    this.gastos = this.gastos.filter(gasto => gasto.idConcepto === this.tipoGasto.concepto);
    if (this.tipoGasto.concepto === '5301') {
      this.pagoForm.addControl('idObligacion', new FormControl(''));
      this.obligacionesMensuales = true
      this.obligaciones$ = this.comprasService.GetObligacionesMensuales();
      this.obligaciones$.subscribe(compras => {
        console.log(compras)
      })
    }
  }

  ngAfterViewInit() {

    if (this.gastos.length === 1) {
      this.pagoForm.controls['concepto'].setValue(this.gastos[0].concepto)
      this.crearObjetoTipoGasto();
    }
  }


  agregarPago() {
    console.log(this.pagoForm.value)
    if (!this.obligacionesMensuales) {
      this.pagoService.agregarEgreso(this.pagoForm.value).subscribe((resp: any) => {
        if (resp.success) {
          this.activeModal.close(resp)
        }
      })
    }else{
      this.agregarPagoObligacion();
    }

  }

  agregarPagoObligacion() {

    this.obligacionService.pagarSaldoFacturaCompra({...this.pagoForm.value,obligacion : this.obligacionSeleccionada.obligacion}).subscribe((resp: any) => {
      if (resp.success) {
        this.activeModal.close(resp)
      }
    })
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  //obligaciones mensuales
  crearObjetoTipoObligacion() {
    let idObligacion = this.pagoForm.controls['idObligacion'].value
    this.obligaciones$.pipe(
    ).subscribe((obligaciones: any) => {
      this.obligacionSeleccionada = obligaciones.find((obli: any) => obli.id === idObligacion)
    }
    )
  }

  obtenerGastoId(concepto: any) {
    if (concepto === "DOMICILIO") {
      return { idConcepto: "5296", descripcion: "Domicilio" };
    } else if (concepto === "CAJA USA") {
      return { idConcepto: "5298", descripcion: "CAJA USA" };
    } else if (concepto === "GASTOS VARIOS") {
      return { idConcepto: "5299", descripcion: "GASTOS VARIOS" };
    } else if (concepto === "SERVICIOS PUBLICOS - AGUA LEDS") {
      return { idConcepto: "5301", descripcion: "SERVICIOS PUBLICOS - AGUA LEDS" };
    } else if (concepto === "ALEGRA") {
      return { idConcepto: "5301", descripcion: "ALEGRA" };
    } else if (concepto === "BOLSAS, MARCADORES, CINTA, ETC.") {
      return { idConcepto: "5299", descripcion: "BOLSAS, MARCADORES, CINTA, ETC." };
    } else if (concepto === "CHAVA") {
      return { idConcepto: "5301", descripcion: "CHAVA" };
    } else if (concepto === "DIEGO") {
      return { idConcepto: "5301", descripcion: "DIEGO" };
    } else if (concepto === "APARTAMENTO PELDAR") {
      return { idConcepto: "5301", descripcion: "APARTAMENTO PELDAR" };
    } else if (concepto === "SALARIO TRABAJADORA") {
      return { idConcepto: "5299", descripcion: "SALARIO TRABAJADORA" };
    } else if (concepto === "GASTO JULIAN") {
      return { idConcepto: "5300", descripcion: "GASTO JULIAN" };
    } else if (concepto === "DAVIVIENDA") {
      return { idConcepto: "5301", descripcion: "DAVIVIENDA" };
    } else if (concepto === "BANCOLOMBIA") {
      return { idConcepto: "5301", descripcion: "BANCOLOMBIA" };
    } else if (concepto === "ARRIENDO MIRIAM") {
      return { idConcepto: "5301", descripcion: "ARRIENDO MIRIAM" };

    }
    return null;
  }

  crearObjetoTipoGasto() {
    const gastoInfo = this.obtenerGastoId(this.pagoForm.value.concepto);
    if (gastoInfo) {
      this.pagoForm.controls['descripcion'].setValue(gastoInfo.descripcion)
      this.pagoForm.controls['idConcepto'].setValue(gastoInfo.idConcepto)

    }
    return null;
  }

  getFechaActual(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
