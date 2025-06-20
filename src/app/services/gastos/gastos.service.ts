import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GastosService {

  constructor(private http: HttpClient) { }

  obtenerGastosFijos(){
    return this.http.get<any>(environment.apiUrl + "gastos")

  }
}
