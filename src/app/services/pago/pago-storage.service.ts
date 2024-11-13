/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoStorageService {

  private pagos$ = new Subject<any[]>();

  constructor(public db: AngularFireDatabase, private http: HttpClient) {
  }

  obtenerPagos(desde: string,hasta: string): Observable<any> {
    let params = new HttpParams();
    if(desde && hasta){
      params = params.append('fechainicio', desde);
      params = params.append('fechafin', hasta);
    }
    return this.http.get<any[]>(environment.apiUrl+"pagos-data",{params:params})
  }

  agregarPagos() {
    this.db.list('pagos').valueChanges().subscribe(pagosArray => {
      const pagos = pagosArray.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      this.pagos$.next(pagos);
    })
  }

  obtenerDetallesPago(fechainicio: string, fechafin: string) {
    let params = new HttpParams();
    if(fechainicio && fechafin){
      params = params.append('fechainicio', fechainicio);
      params = params.append('fechafin', fechafin);
    }
    return this.http.get<any>(environment.apiUrl+"pagos-detalle",{params:params})

  }
  
  getPagos$(): Observable<any[]> {
    return this.pagos$.asObservable();
  }
}
