import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoadingInterceptor } from './loader-intercpetor.interceptor';

describe('LoadingInterceptor', () => {
  it('stops the loader when a request succeeds or fails', () => {
    const loader = jasmine.createSpyObj('loader', ['start', 'stop']);
    const interceptor = new LoadingInterceptor(loader);
    const request = new HttpRequest('GET', '/fictional');
    interceptor.intercept(request, { handle: () => of(new HttpResponse()) }).subscribe();
    interceptor.intercept(request, { handle: () => throwError(() => new Error('synthetic')) })
      .subscribe({ error: () => undefined });
    expect(loader.start).toHaveBeenCalledTimes(2);
    expect(loader.stop).toHaveBeenCalledTimes(2);
  });
});
