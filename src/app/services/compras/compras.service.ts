import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Compra } from 'src/app/types/compra';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private http: HttpClient) { }
 
  obtenerCompras() {
    this.http.get<Compra[]>(environment.apiUrl+"compras").subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  obtenerComprasData(): Observable<any> {
    return this.http.get<Compra[]>(environment.apiUrl+"compras-data")
  }
}
