import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Factura } from 'src/app/types/factura';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }
    
  

  obtenerClientes() {
    this.http.get<any[]>(environment.apiUrl+"clientes").subscribe({
      next: (data:any) => {
        console.log(data)
      },
      error: (error:any) => {
        console.log(error)
      },
    });
  }
}
