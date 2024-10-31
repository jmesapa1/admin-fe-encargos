/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
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

  obtenerPagos(): Observable<any> {
    return this.http.get<any[]>(environment.apiUrl+"pagos-data")
  }

  agregarPagos() {
    this.db.list('pagos').valueChanges().subscribe(pagosArray => {
      const pagos = pagosArray.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      this.pagos$.next(pagos);
    })
  }
  
  getPagos$(): Observable<any[]> {
    return this.pagos$.asObservable();
  }
}
