import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor(private http: HttpClient) { }

  obtenerPagos(){
    this.http.get<any[]>(environment.apiUrl+"pagos").subscribe({
      next: (data:any) => {
        console.log(data)
      },
      error: (error:any) => {
        console.log(error)
      },
    });
  }
}
