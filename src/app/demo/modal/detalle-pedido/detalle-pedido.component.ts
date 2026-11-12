import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, Input, signal, TemplateRef, WritableSignal } from '@angular/core';

import { ModalDismissReasons, NgbActiveModal, NgbDatepickerModule, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

@Component({
	selector: 'app-detalle-pedido',
	standalone: true,
	imports: [DecimalPipe, CommonModule,NgbDropdownModule,],
	templateUrl: './detalle-pedido.component.html',
	styleUrl: './detalle-pedido.component.scss'
})
export class DetallePedidoComponent {
	@Input() public pedido: any;
	infoProducto: any
	private modalService = inject(NgbModal);
	closeResult: WritableSignal<string> = signal('');
  estadosCompraPedidos = [{ color: "bg-c-blue", name: "En camino a MED" }, { color: "bg-c-blue", name: "En camino USA" }, { color: "bg-c-purple", name: "Entregado a USA" }, { color: "bg-c-yellow", name: "Espera de despacho" }, { color: "bg-c-green", name: "Entregado cliente" }]

	activeModal = inject(NgbActiveModal);
	constructor(private pedidoService: PedidosService) {
	}
	obtenerProducto() {
		this.pedidoService.obtenerDetalleProducto(this.pedido.pedido.items[0].id).subscribe(resp => {
			this.infoProducto = resp.data
		})
	}

	ngOnInit() {
		this.obtenerProducto()

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

  cambiarEstadoCompra(estado: string, idFactura: string) {
    this.pedidoService.cambiarEstadoCompra(estado, idFactura)
  }

  desvincularPedido(idFactura: string) {
    this.pedidoService.desvincularPedido(idFactura).subscribe({
      next: (data) => {
        this.activeModal.close('desvinculado');
      },
      error: (error) => {
        console.error('Error al desvincular pedido:', error);
      }
    });
  }
}
