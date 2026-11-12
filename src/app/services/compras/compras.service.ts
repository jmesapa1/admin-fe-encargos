import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, orderBy, query, where } from '@angular/fire/firestore';
import { and, or } from 'firebase/firestore/lite';
import { combineLatest, map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Compra } from 'src/app/types/compra';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private http: HttpClient, private firestore: Firestore) { }

 GetCompras(): Observable<any[]> {

  let date = new Date();

  let fechainicio: any = new Date(date.getFullYear(), date.getMonth(), 1);
  fechainicio.setMonth(fechainicio.getMonth() - 2);
  fechainicio = formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');

  const fechafin = formatDate(
    new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()),
    'yyyy-MM-dd',
    'en-US'
  );

  console.log('fechas->', fechainicio, fechafin);

  const coleccion = collection(this.firestore, 'compras');

  // Entrega inmediata
  const qEntregaInmediata = query(
    coleccion,
    where('entregaInmediata', '==', true)
  );

  // Rango de fechas
  const qRangoFechas = query(
    coleccion,
    where('fecha', '>=', fechainicio),
    where('fecha', '<=', fechafin),
    orderBy('fecha', 'desc')
  );

  return combineLatest([
    collectionData(qEntregaInmediata, { idField: 'id' }),
    collectionData(qRangoFechas, { idField: 'id' })
  ]).pipe(
    map(([inmediatas, rango]: any[]) => {

      const todas = [...inmediatas, ...rango];

      // Eliminar duplicados
      const unicas = todas.filter(
        (item, index, self) =>
          index === self.findIndex((x: any) => x.id === item.id)
      );

      // Ordenar por fecha descendente
      return unicas.sort((a: any, b: any) =>
        b.fecha.localeCompare(a.fecha)
      );
    })
  );
}

  GetObligacionesMensuales(): Observable<any[]> {
    // collectionData returns a hot observable

    let date = new Date();
    let fechainicio: any = new Date(date.getFullYear(), date.getMonth(), 1);
    fechainicio.setMonth(fechainicio.getMonth() - 3);
    fechainicio = formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');
    let fechafin = formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()), 'yyyy-MM-dd', 'en-US');
    console.log("fechas->", fechainicio, fechafin)
    let coleccion = collection(this.firestore, 'obligacionesMensuales');
    const orderedQueryAsc = query(coleccion, orderBy("saldo", "desc"), orderBy("fecha", "desc"), where('fecha', '>=', fechainicio), where('fecha', '<=', fechafin));

    const orderedDataObservable = collectionData(orderedQueryAsc);
    return orderedDataObservable.pipe(
      map((response: any) => {
        return (response);
      })
    );
  }

  GetPagos(): Observable<any[]> {
    // collectionData returns a hot observable
    let date = new Date();
    let fechainicio: any = new Date(date.getFullYear(), date.getMonth(), 1);
    fechainicio.setMonth(fechainicio.getMonth());
    fechainicio = formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');
    let fechafin = formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()), 'yyyy-MM-dd', 'en-US');
    console.log("fechas->", fechainicio, fechafin)
    let coleccion = collection(this.firestore, 'pagos');
    const orderedQueryAsc = query(coleccion, orderBy("fecha", "desc"), where('fecha', '>=', fechainicio), where('fecha', '<=', fechafin));
    const orderedDataObservable = collectionData(orderedQueryAsc);
    return orderedDataObservable.pipe(
      map((response: any) => {
        return (response);
      })
    );
  }





  obtenerCompras() {
    this.http.get<Compra[]>(environment.apiUrl + "app/compras").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  obtenerComprasData(): Observable<any> {
    return this.http.get<Compra[]>(environment.apiUrl + "app/compras-data")
  }

  generarFacturaCompra(data: any): Observable<any> {
    return this.http.post<Factura>(environment.apiUrl + "app/compras/generar/factura", { ...data });
  }

  obtenerPedidosSinConsolidar(): Observable<any> {
    let date = new Date();
    let fechainicio: any = new Date(date.getFullYear(), 1, 1);
    fechainicio.setMonth(fechainicio.getMonth() - 1);
    fechainicio = formatDate(fechainicio, 'yyyy-MM-dd', 'en-US');
    let fechafin = formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()), 'yyyy-MM-dd', 'en-US');
    console.log("fechas->", fechainicio, fechafin)
    let coleccion = collection(this.firestore, 'pedidos');
    const orderedQueryAsc = query(coleccion, orderBy("fecha", "asc"), where('idProvedor', '!=', "1045"), where('estadoCompra', '==', 'Comprado'), where('guia', '==', null), where('fecha', '>=', fechainicio), where('fecha', '<=', fechafin));
    const orderedDataObservable = collectionData(orderedQueryAsc);
    return orderedDataObservable.pipe(
      map((response: any) => {
        return (response);
      })
    );

  }

  consolidarPedidos(pedidos: any[], datosPago: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "app/cajas/consolidar-pedidos", { pedidos, ...datosPago });
  }

  asignarComoEntregainmediata(idCompra: string, entregaInmediata: boolean) {
    return this.http.post<Factura[]>(environment.apiUrl + "app/compras/asignar-entrega-inmediata", { idCompra, entregaInmediata })
  }

  habilitarVentaEntregaInmediata(idCompra: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "app/compras/habilitar-venta-entrega-inmediata", { idCompra })
  }
}
