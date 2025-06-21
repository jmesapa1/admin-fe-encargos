import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
  selector: 'app-pago-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './pago-factura.component.html',
  styleUrl: './pago-factura.component.scss'
})
export class PagoFacturaComponent {
  @Input() public pedido: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;
  constructor(private pagoService: PagoService) {
    this.pagoForm = new FormGroup({
      valor: new FormControl(''),
      idMedioPago: new FormControl(''),

    });
  }

  ngOnInit() {
    if (this.pedido) {
      this.pagoForm.controls["valor"].setValue(this.pedido.saldo)
    }
  }

  agregarPago() {

    console.log(this.pagoForm.value)
    this.pagoService.abonarFacturaPedido({...this.pagoForm.value,idPedido:this.pedido.id}).subscribe((resp: any) => {
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


}
