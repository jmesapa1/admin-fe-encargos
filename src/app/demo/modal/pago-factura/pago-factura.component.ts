import { PaymentSubmission } from 'src/app/shared/payment-submission';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
  selector: 'app-pago-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './pago-factura.component.html',
  styleUrl: './pago-factura.component.scss'
})
export class PagoFacturaComponent {
  readonly envio = new PaymentSubmission();
  @Input() public pedido: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;
  constructor(private pagoService: PagoService, private pedidosService: PedidosService) {
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
    this.envio.enviar(() => this.pagoService.abonarFacturaPedido({...this.pagoForm.value,idPedido:this.pedido.id}), (resp: any) => {
      if (resp.success) {
        if (resp.response?.invoices?.[0]?.balance === 0 && this.pedido.estado !== 'Falta comprar') {
          const pedidoEntregado = confirm('El balance del pedido quedó en $0. ¿El pedido ya fue entregado al cliente?');
          if (pedidoEntregado && this.pedido.estado !== 'Entregado cliente') {
            this.pedidosService.cambiarEstadoCompra('Entregado cliente', this.pedido.id).subscribe({
              next: () => this.activeModal.close(resp),
              error: () => {
                alert('El pago se registró, pero no fue posible actualizar el estado de entrega.');
                this.activeModal.close(resp);
              }
            });
            return;
          }
        }
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
