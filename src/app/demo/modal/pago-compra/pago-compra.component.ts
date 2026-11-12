import { Observable } from 'rxjs';
import { PaymentSubmission } from 'src/app/shared/payment-submission';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

@Component({
  selector: 'app-compra-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './pago-compra.component.html',
  styleUrl: './pago-compra.component.scss'
})
export class PagoCompraComponent {
  readonly envio = new PaymentSubmission();
  @Input() public pedido: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;
  constructor(private pagoService: PagoService,private pedidoService:PedidosService) {
    this.pagoForm = new FormGroup({
      valor: new FormControl(''),
      idMedioPago: new FormControl(''),
    });
  }

  ngOnInit() {
    if (this.pedido) {
      this.pagoForm.controls["valor"].setValue(this.pedido.saldoCompra)
      this.pagoForm.controls["valor"].disable()
    }
  }

  agregarPago() {
    const data = { idPedido: this.pedido.id, idCompra: this.pedido.compraData.id,
      saldo: this.pedido.saldoCompra, idMedioPago: this.pagoForm.value.idMedioPago };
    this.envio.enviar(() => this.pedidoService.pagarSaldoFacturaCompra(data) as Observable<any>,
      (response: any) => this.activeModal.close(response),
      // Preserve legacy HTTP response bodies, but do not close on explicit failure.
      response => response?.success !== false);
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
