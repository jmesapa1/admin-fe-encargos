import { Observable } from 'rxjs';

/** Client-side single submission guard; server-side idempotency is still required. */
export class PaymentSubmission {
  bloqueado = false;
  enviando = false;
  error = '';

  enviar<T extends { success?: boolean }>(request: () => Observable<T>, onSuccess: (response: T) => void,
    accepted: (response: T) => boolean = response => response?.success === true): void {
    if (this.bloqueado) return;
    this.bloqueado = true;
    this.enviando = true;
    this.error = '';
    let received = false;
    try {
      request().subscribe({
        next: response => {
          if (received) return;
          received = true;
          this.enviando = false;
          if (accepted(response)) {
            // Lock before the callback: a following status update must not repeat the payment.
            onSuccess(response);
          } else {
            this.error = 'La operación no fue confirmada. Verifica su estado antes de volver a pagar.';
          }
        },
        error: () => this.resultadoIncierto(),
        complete: () => {
          if (this.enviando) this.resultadoIncierto();
        }
      });
    } catch {
      this.resultadoIncierto();
    }
  }

  private resultadoIncierto(): void {
    this.enviando = false;
    this.error = 'No se pudo confirmar el resultado. Verifica el pago antes de repetir la operación.';
  }
}
