import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObligacionService {

  constructor(private http: HttpClient) { }

    pagarSaldoFacturaCompra(data: any){
      return this.http.post<Factura[]>(environment.apiUrl+"app/obligacion/pagar/factura",{...data})
    }
}
