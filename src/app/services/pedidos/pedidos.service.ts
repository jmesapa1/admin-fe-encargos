import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http: HttpClient) { }

  obtenerPedidos() {
    this.http.get<Factura[]>(environment.apiUrl+"pedidos").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  obtenerCompras() {
    this.http.get<Factura[]>(environment.apiUrl+"compras").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  asignarCompra(idCompra:string,idFactura:string) {
   return this.http.post<Factura[]>(environment.apiUrl+"pedidos/asociar",{idCompra,idFactura})
  }
  cambiarEstadoCompra(estado:string,idFactura:string){
    this.http.post<Factura[]>(environment.apiUrl+"pedidos/estado-compra",{trackingCompra:estado,idFactura}).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }
  cambiarEstadoVenta(estado:string,idFactura:string){
    this.http.post<Factura[]>(environment.apiUrl+"pedidos/estado-venta",{estadoVenta:estado,idFactura}).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  cambiarFechaEntrega(fecha:string,idFactura:string){
    this.http.post<Factura[]>(environment.apiUrl+"pedidos/fecha-entrega-compra",{entregaCompraEstimada:fecha,idFactura}).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }
}
