import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { PaymentSubmission } from './payment-submission';

describe('PaymentSubmission', () => {
  let alert: jasmine.Spy;

  beforeEach(() => {
    alert = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
  });

  it('shows the detailed API error message when a payment is rejected', () => {
    const submission = new PaymentSubmission();

    submission.enviar(
      () => of({
        success: false,
        message: 'Alegra rechazó el pago',
        response: { message: 'El monto supera el saldo pendiente', code: 4031 }
      }),
      () => {}
    );

    expect(alert).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      text: 'El monto supera el saldo pendiente'
    });
  });

  it('shows the API error message from an HTTP error response', () => {
    const submission = new PaymentSubmission();

    submission.enviar(
      () => throwError(() => ({
        error: { message: 'Alegra rechazó el pago', response: { message: 'Saldo insuficiente' } }
      })),
      () => {}
    );

    expect(alert).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      text: 'Saldo insuficiente'
    });
  });

  it('uses the fallback when the API does not provide a message', () => {
    const submission = new PaymentSubmission();
    const fallback = 'La operación no fue confirmada. Verifica su estado antes de volver a pagar.';

    submission.enviar(() => of({ success: false }), () => {});

    expect(alert).toHaveBeenCalledWith({ icon: 'error', title: 'Error', text: fallback });
  });
});
