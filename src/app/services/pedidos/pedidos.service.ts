import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, orderBy, query } from '@angular/fire/firestore';
import { where } from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http: HttpClient, private firestore: Firestore) {



  }

   GetPedidos(): Observable<any[]> {
        // collectionData returns a hot observable

        let date = new Date();
        let fechainicio:any = new Date(date.getFullYear(), date.getMonth(), 1);
        fechainicio.setMonth(fechainicio.getMonth() - 4);
        fechainicio =   formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');

        let fechafin =   formatDate(new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()), 'yyyy-MM-dd', 'en-US');
        console.log("fechas->",fechainicio,fechafin)
        let coleccion = collection(this.firestore, 'pedidos');
        const orderedQueryAsc = query(coleccion, orderBy("fecha","desc"),where('fecha', '>=', fechainicio),where('fecha', '<=', fechafin));

        const orderedDataObservable = collectionData(orderedQueryAsc);


        return orderedDataObservable.pipe(
            map((response: any) => {
                return (response);
            })
        );
    }

   getPedidos(): Observable<any[]> {
        const itemsCollection = collection(this.firestore, 'pedidos');
        return collectionData(itemsCollection, { idField: 'id' });
    }

  obtenerPedidos() {
    this.http.get<Factura[]>(environment.apiUrl+"app/pedidos").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  obtenerCompras() {
    this.http.get<Factura[]>(environment.apiUrl+"app/compras").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  asignarCompra(idCompra:string,idFactura:string) {
   return this.http.post<Factura[]>(environment.apiUrl+"app/pedidos/asociar",{idCompra,idFactura})
  }

  obtenerDetallePedido(idPedido:string) {
    return this.http.post<Factura[]>(environment.apiUrl+"app/pedidos",{idPedido})
  }

  obtenerDetalleProducto(idProducto:string) {
    return this.http.post<any>(environment.apiUrl+"app/productos",{idProducto})
  }

  cambiarEstadoCompra(estado:string,idFactura:string){
   return this.http.post<any[]>(environment.apiUrl+"app/pedidos/estado-compra",{trackingCompra:estado,idFactura})
  }
  cambiarEstadoVenta(estado:string,idFactura:string){
    this.http.post<Factura[]>(environment.apiUrl+"app/pedidos/estado-venta",{estadoVenta:estado,idFactura}).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  cambiarFechaEntrega(fecha:string,idFactura:string){
    this.http.post<Factura[]>(environment.apiUrl+"app/pedidos/fecha-entrega-compra",{entregaCompraEstimada:fecha,idFactura}).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  pagarSaldoFacturaCompra(data: any){
    return this.http.post<Factura[]>(environment.apiUrl+"app/compras/pagar/factura",{...data})
  }

  desvincularPedido(idFactura: string) {
    return this.http.post<any>(environment.apiUrl + "app/pedidos/desvincularCompra", { idPedido: idFactura });
  }

  agregarNovedad(data: any) {
    return this.http.post<any>(environment.apiUrl + "app/pedidos/agregarNovedad", { ...data });
  }

  cancelarPedido(data:any){
    return this.http.post<any>(environment.apiUrl + "app/pedidos/cancelar", {pedidoId:data.id,compraId:data.compra });
  }

  cancelarCompra(data:any){
    return this.http.post<any>(environment.apiUrl + "app/compras/cancelar", data);
  }

}
