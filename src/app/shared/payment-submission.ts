import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

/** Tracks payment submissions and reports ambiguous results. */
export class PaymentSubmission {
  enviando = false;
  error = '';
  private solicitudesActivas = 0;

  enviar<T extends { success?: boolean }>(request: () => Observable<T>, onSuccess: (response: T) => void,
    accepted: (response: T) => boolean = response => response?.success === true): void {
    this.solicitudesActivas++;
    this.actualizarEstadoEnvio();
    this.error = '';
    let received = false;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.solicitudesActivas--;
      this.actualizarEstadoEnvio();
    };

    try {
      request().subscribe({
        next: response => {
          if (received) return;
          received = true;
          finish();
          if (accepted(response)) {
            onSuccess(response);
          } else {
            this.reportarError(response, 'Error no controlado. Verifica el pago antes de repetir la operación.');
          }
        },
        error: error => {
          finish();
          if (!received) this.resultadoIncierto(error);
        },
        complete: () => {
          if (!received) {
            finish();
            this.resultadoIncierto();
          }
        }
      });
    } catch (error) {
      finish();
      this.resultadoIncierto(error);
    }
  }

  private actualizarEstadoEnvio(): void {
    this.enviando = this.solicitudesActivas > 0;
  }

  reportarError(error: unknown, fallback: string): void {
    const message = this.obtenerMensaje(error) || fallback;
    this.error = message;
    void Swal.fire({ icon: 'error', title: 'Error', text: message });
  }

  private resultadoIncierto(error?: unknown): void {
    this.reportarError(error, 'Error no controlado. Verifica el pago antes de repetir la operación.');
  }

  private obtenerMensaje(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined;

    const source = error as {
      error?: { response?: { message?: unknown }; message?: unknown };
      response?: { message?: unknown };
      message?: unknown;
    };
    const apiError = source.error && typeof source.error === 'object' ? source.error : source;
    const messages = [apiError.response?.message, apiError.message, source.message];
    return messages.find((message): message is string => typeof message === 'string' && message.trim().length > 0);
  }
}
