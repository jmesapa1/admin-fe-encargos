import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ComprasService } from 'src/app/services/compras/compras.service';

@Component({
  selector: 'app-generar-factura-compra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './generar-factura-compra.component.html',
  styleUrl: './generar-factura-compra.component.scss'
})
export class GenerarFacturaCompraComponent {
  @Input() public pedido: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;
  provedores: any[] = [];
  constructor(private pagoService: PagoService, private comprasService:ComprasService) {
    this.pagoForm = new FormGroup({
      valor: new FormControl(''),
      idProvedor: new FormControl(''),
      idProducto: new FormControl('')

    });
  }

  ngOnInit() {
    console.log(this.pedido)
    if (this.pedido) {
      this.pagoForm.controls["idProducto"].setValue(this.pedido.pedido.items[0].id)
    }
    this.obtenerProvedores();
  }

  obtenerProvedores() {
    this.pagoService.obtenerProvedores().subscribe((resp: any) => {
      if (resp.success) {
        this.provedores = resp.data;
      }
    })
  }

  generarFacturaCompra() {

    console.log(this.pagoForm.value)
    this.comprasService.generarFacturaCompra({ ...this.pagoForm.value}).subscribe((resp: any) => {
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
