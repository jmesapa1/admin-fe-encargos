import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor(private http: HttpClient) { }

  obtenerPagos() {
    this.http.get<any[]>(environment.apiUrl + "app/pagos").subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error: any) => {
        console.log(error)
      },
    });
  }


  abonarFacturaPedido(data: any) {
    return this.http.post<any>(environment.apiUrl + "app/pedidos/pagar/factura", { ...data })
  }

  obtenerProvedores() {
    return this.http.get<any>(environment.apiUrl + "app/provedores")
  }

  agregarEgreso(formValue: any) {
    let params = new HttpParams();

    let request = {
      "bankAccount": {
        "id": formValue.idMedioPago
      },
      "paymentMethod": "transfer",
      "observations": formValue.descripcion,
      "anotation": formValue.descripcion,
      "comments": [
        formValue.concepto
      ],
      "type": "out",
      "categories": [
        {
          "id": formValue.idConcepto,
          "quantity": 1,
          "price": formValue.valor,
          "observations": formValue.descripcion
        }
      ],
      "date": formValue.fecha
    }

    return this.http.post<any[]>(environment.apiUrl + "app/pagos/gasto", request, { params: params })
  }

}
