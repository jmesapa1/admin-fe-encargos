import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
  selector: 'app-agregar-gasto',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './agregar-gasto.component.html',
  styleUrl: './agregar-gasto.component.scss'
})
export class AgregarGastoComponent {
  @Input() public gasto: any;
closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm : FormGroup;
  constructor(private pagoService:PagoService){
    this.pagoForm = new FormGroup({
      concepto: new FormControl(''),
      valor: new FormControl(''),
      fecha: new FormControl(''),

    });
  }

  ngOnInit() {
  if(this.gasto){
  console.log(this.gasto.concepto,this.obtenerGastoId(this.gasto.concepto))
    this.pagoForm.controls["concepto"].setValue(this.obtenerGastoId(this.gasto.concepto))
    this.pagoForm.controls["valor"].setValue(this.gasto.valor)
  }
	}

  agregarPago(){
    console.log(this.pagoForm.value)

    this.pagoService.agregarEgreso(this.pagoForm.value).subscribe((resp:any)=>{
      if(resp.success){
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

  obtenerGastoId(concepto:any) {
    if (concepto === "DOMICILIO") {
      return "5208";
    } else if (concepto === "SERVICIOS PUBLICOS - AGUA LEDS") {
      return "5203";
    } else if (concepto === "ALEGRA") {
      return "5224";
    } else if (concepto === "SALARIO") {
      return "5108";
    } else if (concepto === "BOLSAS, MARCADORES, CINTA, ETC.") {
      return "5236";
    } else if (concepto === "CHAVA") {
      return "5246";
    } else if (concepto === "DIEGO") {
      return "5165";
    } else if (concepto === "APARTAMENTO PELDAR") {
      return "5209";
    } else if (concepto === "SALARIO TRABAJADORA") {
      return "5160";
    } else if (concepto === "SALARIO JULIAN") {
      return "5238";
    } else if (concepto === "TARJETA CRÉDITO NU") {
      return "5247";
    } else if (concepto === "TARJETA CRÉDITO AMEX") {
      return "5250";
    } else if (concepto === "TARJETA CRÉDITO POPULAR") {
      return "5251";
    } else if (concepto === "TARJETA CRÉDITO RAPPI") {
      return "5252"
    }else if (concepto === "DAVIVIENDA") {
      return "5253"
    }
    return null;
  }
}
