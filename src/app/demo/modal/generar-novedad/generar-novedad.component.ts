import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { Observable, of } from 'rxjs';
import { ObligacionService } from 'src/app/services/obligacion/obligacion.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

@Component({
  selector: 'app-generar-novedad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './generar-novedad.component.html',
  styleUrl: './generar-novedad.component.scss'
})
export class GenerarNovedadComponent {
  @Input() public pedido: any;
  closeResult: WritableSignal<string> = signal('');

  activeModal = inject(NgbActiveModal);

  novedadForm: FormGroup;

  constructor(private pedidoService: PedidosService) {
    this.novedadForm = new FormGroup({
      novedad: new FormControl(''),
    });
  }

  ngOnInit() {

    //SOLO PARA OBLIGACIONES MENSUALES

  }

  ngAfterViewInit() {

  }


  agregarNovedad() {
    const novedadData = {
      pedidoId: this.pedido.id,
      novedad: this.novedadForm.value.novedad,
      fecha: this.getFechaActual(),
    };

    this.pedidoService.agregarNovedad(novedadData).subscribe({
      next: () => {
        this.activeModal.close('Novedad agregada');
      },
      error: (error) => {
        console.error("Error al agregar la novedad:", error);
      },
    });

  }



  getFechaActual(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
