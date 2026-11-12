import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BancoService {


  constructor(private http: HttpClient) { }



  obtenerBancos() : Observable<any> {
      return this.http.get<any>(environment.apiUrl + "app/bancos");
  }

}
