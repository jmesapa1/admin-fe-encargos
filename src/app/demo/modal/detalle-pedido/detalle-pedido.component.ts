import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, Input, signal, TemplateRef, WritableSignal } from '@angular/core';

import { ModalDismissReasons, NgbActiveModal, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

@Component({
	selector: 'app-detalle-pedido',
	standalone: true,
	imports: [DecimalPipe, CommonModule],
	templateUrl: './detalle-pedido.component.html',
	styleUrl: './detalle-pedido.component.scss'
})
export class DetallePedidoComponent {
	@Input() public pedido: any;
	infoProducto: any
	private modalService = inject(NgbModal);
	closeResult: WritableSignal<string> = signal('');

	activeModal = inject(NgbActiveModal);
	constructor(private pedidoService: PedidosService) {
	}
	obtenerProducto() {
		this.pedidoService.obtenerDetalleProducto(this.pedido.pedido.items[0].id).subscribe(resp => {
			console.log(resp)
			this.infoProducto = resp.data
		})
	}

	ngOnInit() {
		this.obtenerProducto()

		console.log(this.pedido)
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
