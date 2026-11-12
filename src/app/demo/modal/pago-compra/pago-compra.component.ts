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
    console.log(this.pagoForm)

    let data = { idPedido: this.pedido.id, idCompra: this.pedido.compraData.id, saldo: this.pedido.saldoCompra, idMedioPago: this.pagoForm.value.idMedioPago }
    this.pedidoService.pagarSaldoFacturaCompra(data).subscribe({
      next: (data: any) => {
        console.log(data)
        this.activeModal.close(data)

      },
      error: (error: any) => {
        console.log(error)
      },
    });

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
