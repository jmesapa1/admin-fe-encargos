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
  selector: 'app-consolidar-carga.',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './consolidar-carga..component.html',
  styleUrl: './consolidar-carga..component.scss'
})
export class ConsolidarCargaComponent {
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  pagoForm: FormGroup;
  pedidosSinConsolidar: Observable<any[]> = of([]);
  pedidosSeleccionados: any[] = [];
  constructor(private pagoService: PagoService, private comprasService: ComprasService, private obligacionService: ObligacionService) {
    let date = new Date();

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    let year = date.getFullYear();

    let formattedDate = `${day}-${month}-${year}`;
    this.pagoForm = new FormGroup({

      guia: new FormControl(''),
      fecha: new FormControl(this.getFechaActual()),
      descripcion: new FormControl('')

    });

    this.obtenerPedidosSinConsolidar()

  }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }



  // solo traera pedidos sin consolidar, con fecha mayor a 01 de diciembre del 2025 y ya comprados
  obtenerPedidosSinConsolidar() {
    return this.comprasService.obtenerPedidosSinConsolidar().subscribe((pedidos: any) => {
      this.pedidosSinConsolidar = of(pedidos)
      this.pedidosSinConsolidar = of(pedidos.filter((pedido: any) => {
        return pedido.trackingCompra !== 'Entregado cliente' && pedido.trackingCompra !== 'Espera de despacho' ;
      }));
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

  //obligaciones mensuales
  crearObjetoTipoObligacion() {
  }


  getFechaActual(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }


  onCheckboxClick(pedido: any, event: any) {
    const index = this.pedidosSeleccionados.indexOf(pedido);

    if (index > -1 && !event.target.checked) {
      this.pedidosSeleccionados.splice(index, 1);

      return;
    } else {
      this.pedidosSeleccionados.push(pedido);
    }
  }

  consolidarPedido(){
    this.comprasService.consolidarPedidos(this.pedidosSeleccionados, this.pagoForm.value).subscribe(() => {
      this.activeModal.close('Consolidacion exitosa');
    });
  }
}
