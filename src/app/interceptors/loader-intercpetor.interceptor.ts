import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';


import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, finalize, tap } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private countRequest = 0;
  constructor(
    private ngxService: NgxUiLoaderService
  ) {}



  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.ngxService.start();
    console.log("LLAMADO AL BAKEND")
    return next.handle(request)
      .pipe(
        finalize(() => {
          console.log("LLAMADO AL BAKEND")
          this.ngxService.stop()
        })
      );
  }
}
