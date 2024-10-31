/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { query } from 'express';
import { Firestore, getDocs, collection } from 'firebase/firestore';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoStorageService {

  private pedidos$ = new Subject<any[]>();

  constructor(public db: AngularFireDatabase, private http: HttpClient) {
  }

  obtenerPedidos(): Observable<any> {
    return this.http.get<any[]>(environment.apiUrl+"pedidos-data")
  }

  obtenerPedidosPorMes(pedidos:any[]){
    return pedidos.filter(x => {
      const month = new Date().getMonth()
      const  monthPedido = x.pedido.date.split("-")[1]
      if (Number(monthPedido)-1 === Number(month)) {
        return x
      }
    })
  }
  obtenerSumaPedidos(pedidos: any[]) {
    return pedidos.reduce((a, b) => {
      if (b.pedido) {
        return a + b.pedido.total
      }
    }, 0)
  }
}
