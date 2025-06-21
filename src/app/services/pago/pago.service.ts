import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor(private http: HttpClient) { }

  obtenerPagos() {
    this.http.get<any[]>(environment.apiUrl + "pagos").subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (error: any) => {
        console.log(error)
      },
    });
  }


   abonarFacturaPedido(data: any){
      return this.http.post<any>(environment.apiUrl+"pedidos/pagar/factura",{...data})
    }

  agregarEgreso(formValue: any) {
    let idConcepto
    let pagoGastoRecurrente = true;
    if (formValue.concepto === "5208") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "DOMICILIO"
      pagoGastoRecurrente=false
    }else  if (formValue.concepto === "5203") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "SERVICIOS PUBLICOS - AGUA LEDS"
    }else  if (formValue.concepto === "5224") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "ALEGRA"
      pagoGastoRecurrente=false
    }else  if (formValue.concepto === "5108") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "SALARIO"
    }else  if (formValue.concepto === "5236") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "BOLSAS, MARCADORES, CINTA, ETC."
      pagoGastoRecurrente=false
    }else  if (formValue.concepto === "5246") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "CHAVA"
    }else  if (formValue.concepto === "5165") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "DIEGO"
    }else  if (formValue.concepto === "5209") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "APARTAMENTO PELDAR"
    }else  if (formValue.concepto === "5160") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "SALARIO TRABAJADORA"
    }else  if (formValue.concepto === "5238") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "SALARIO JULIAN"
    }else  if (formValue.concepto === "5247") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "TARJETA CRÉDITO NU"
    }else  if (formValue.concepto === "5250") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "TARJETA CRÉDITO AMEX"
    }else  if (formValue.concepto === "5251") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "TARJETA CRÉDITO POPULAR"
    }else  if (formValue.concepto === "5252") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "TARJETA CRÉDITO RAPPI"
    }else  if (formValue.concepto === "5253") {
      idConcepto = Number(formValue.concepto)
      formValue.concepto = "DAVIVIENDA"
    }

    let params = new HttpParams();
    params = params.append('pagoRecurrente', pagoGastoRecurrente);


    let request = {
      "bankAccount": {
        "id": 2
      },
      "paymentMethod": "transfer",
      "observations": formValue.concepto,
      "anotation": formValue.concepto,
      "comments": [
        formValue.concepto
      ],
      "type": "out",
      "categories": [
        {
          "id": idConcepto,
          "quantity": 1,
          "price": formValue.valor,
          "observations": formValue.concepto
        }
      ],
      "date": formValue.fecha
    }

    return this.http.post<any[]>(environment.apiUrl + "pagos/gasto", request,{params:params})
  }

}
