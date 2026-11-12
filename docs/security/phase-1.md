# Fase 1: estabilización local

Rama: `codex/seguridad-leds-2026`. Sin acceso a datos reales, despliegues,
modificaciones de reglas remotas ni cambios en fórmulas financieras.

## Correcciones verificadas

- Dashboard: espera bancos, obligaciones, pedidos y detalle antes de mostrar el
  balance; recalcula con nuevas emisiones. Conserva la fórmula existente y las
  consultas/rangos existentes. Invoca la carga de saldos que estaba definida
  pero no se ejecutaba al iniciar. Invalida el indicador si falla una fuente.
- Cambio de periodo: cancela suscripciones anteriores del detalle y los pagos;
  una respuesta tardía no sobrescribe el periodo más reciente.
- Suscripciones del balance: se cierran al destruir el componente.
- Pedidos: busca las novedades por ID y confirma antes de enviar; cancelar no
  ejecuta cambios y aceptar genera una sola solicitud.
- Pagos de venta, compra, gasto y obligación: guardia compartida de una sola
  solicitud por instancia. El botón muestra estado y queda bloqueado tras un
  resultado incierto o un pago confirmado. No hay reintentos automáticos.
- Un fallo del cambio de entrega posterior al pago no permite volver a enviar
  ese pago. Se mantiene el aviso de éxito parcial existente.
- Respuestas de compras: conserva compatibilidad con cuerpos HTTP heredados;
  una respuesta que declara `success: false` no cierra el modal como éxito.
- Se retiran logs de datos de los componentes revisados. Esto no constituye una
  eliminación de todos los logs de los servicios del repositorio.

## Pruebas e infraestructura

`npm run test:regression` ejecuta componentes reales con servicios simulados,
Subjects controlados y fixtures sintéticos; no importa el módulo de arranque
ni inicializa Firebase. La ejecución inicial reprodujo 12 fallos y un error
asíncrono de timeout; la versión corregida pasa 16 pruebas activas.

Se repararon dos bloqueos previos: el test del interceptor importaba una función
inexistente y el cargador de la suite usaba `require.context`, incompatible con
el descubrimiento actual de Angular CLI. Los workflows existentes ejecutarán
seguridad y regresiones antes del build si se publican estos commits; no se
ha ejecutado ninguno de esos workflows ni cambiado sus triggers.

Validación local:

- Seguridad: 5/5 correctas.
- Regresión: 16/16 activas correctas; 8 propuestas desactivadas explícitamente.
- TypeScript: aplicación, specs y configuración de regresión sin errores.
- Suite completa: 17 correctas, 17 fallidas y 8 pendientes. Los fallos restantes
  pertenecen a los scaffolds heredados, con proveedores/mocks ausentes, entre
  ellos HttpClient. No se ocultan ni se contabilizan como pruebas correctas.
- Build de producción y comprobación del artefacto: correctos. Persisten avisos
  de CommonJS, selectores CSS y presupuesto inicial de unos 2,50 MB.
- Lint: ESLint no está disponible en la instalación local; no se instalaron
  dependencias ni se modificó el lockfile para resolverlo en esta fase.

## Límites financieros pendientes de autorización

`amount-policy.proposal.spec.ts` contiene ocho pruebas propuestas y desactivadas
mediante `xdescribe`. No representan validaciones implementadas ni resultados
correctos. Solicitud de aprobación: rechazar vacío, no numérico, no finito,
importe <= 0 y abono superior al saldo; exigir medio de pago. Saldo ficticio:
100; ejemplo de exceso: 101. No añadir precisión ni redondeos nuevos.

Estos límites no se activan hasta obtener autorización específica del usuario.
Después deberán validarse también en servidor, con saldo vigente.

## Riesgos y trabajo pendiente

La guardia de interfaz no garantiza idempotencia entre pestañas, instancias de
modal, sesiones o reenvíos de red. Reabrir un modal tras un resultado incierto
no verifica la operación anterior: se debe conciliar antes de pagar de nuevo.
La garantía real requiere soporte de backend e idempotencia transaccional.

Los permisos, la concurrencia de pagos y el saldo autoritativo no se pueden
verificar porque no están disponibles las Functions ni las reglas. No se
cambian la definición de cartera, los periodos de obligaciones ni los conceptos
contables. Paginación y combinación de filtros siguen pendientes; no se ha
iniciado modernización visual ni otra fase.

## Archivos y commits

- `8a52fe6`: `src/test.ts` y spec del interceptor; repara infraestructura de tests.
- `d1eec61`: estabilización, guardia de envío y regresiones.

| Archivos | Cambio |
| --- | --- |
| `demo/dashboard/dash-analytics.component.ts/html` | Composición, cancelación y estado de balance |
| `demo/pedidos/pedidos.component.ts` | Confirmación por ID y envío único de estado |
| `demo/modal/{pago-factura,pago-compra,agregar-gasto}/*.ts/html` | Guardia, bloqueo de botones y mensajes |
| `shared/payment-submission.ts` | Control compartido de una sola solicitud |
| `regression/*.spec.ts`, `src/regression-test.ts`, `tsconfig.regression.json` | Casos sintéticos y ejecutor aislado |
| `package.json`, workflows de Hosting | Comando y gate de regresión |

Las rutas de componentes de esta tabla son relativas a `src/app/`.
El árbol de producción `master` no recibió commits ni modificaciones.
