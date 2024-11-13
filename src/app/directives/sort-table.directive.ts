/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/directive-class-suffix */
/* eslint-disable @angular-eslint/directive-selector */
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Factura } from '../types/factura';


export type SortColumn = keyof {
	cliente: any, 
	compra: any,
	compraData: any
	entregaVentaEstimada: any
	estadoCompra: any
	estadoVenta: any
	fecha: any
	id: any
	pago: any
	pedido: any
	saldo: any
	valor: any,
	producto:any,
	fechaPedido:any,
	valorVenta:any,
	valorCompra:any,
	saldoCompra:any,
	fechaEntregaCompra:any,
	fechaEntregaVenta:any,
	clienteNombre:any
} | any | '' 

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

export interface SortEvent {
	column: SortColumn;
	direction: SortDirection;
}


@Directive({
	selector: 'th[sortable]',
	standalone: true,
	host: {
		'[class.asc]': 'direction === "asc"',
		'[class.desc]': 'direction === "desc"',
		'(click)': 'rotate()',
	}
})
export class NgbdSortableHeader {
	@Input() sortable: SortColumn = '';
	@Input() direction: SortDirection = '';

	@Output() sort = new EventEmitter<SortEvent>();

	rotate() {
		this.direction = rotate[this.direction];
		this.sort.emit({ column: this.sortable, direction: this.direction });
		console.log(this.direction)

	}
}
