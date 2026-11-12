# Autenticación: frontend

Rama: `codex/autenticacion-admin-leds`. Angular 18 y dependencias existentes
AngularFire/Firebase. No se añadieron dependencias ni se modificó el backend.
Los cambios previos se conservaron; durante el trabajo quedaron registrados
por separado en el commit existente `dd6017b`.

## Comportamiento

- `/` y cualquier ruta administrativa requieren una sesión autenticada.
- Anónimo: `/login`, conservando un destino interno seguro para el retorno.
- Error al verificar sesión/token: acceso cerrado y `/sesion-error`.
- Cualquier cuenta válida de Firebase que inicie sesión puede acceder al panel.
- El router espera a que Firebase restaure la sesión y protege las rutas privadas.
- `canMatch` impide el acceso inicial a la rama privada y su carga diferida;
  `canActivate` y `canActivateChild` vuelven a comprobar navegación e hijas.
- El layout se oculta mientras cambia/verifica la sesión. Al perder acceso se
  cierran también los modales y se abandona la ruta privada con reemplazo URL.
- Logout bloquea primero el acceso local. Un fallo de red no reabre el panel.
  Una resolución tardía del token/login no deshace el cierre de sesión.
- No existe registro público. Las URLs antiguas de registro/login van a `/login`.
  Se retiran del menú las entradas de autenticación de demostración.
- Errores de credenciales son genéricos; no se imprimen tokens, contraseñas,
  correos ni errores crudos de Firebase. La contraseña se limpia del formulario.

## Límite de seguridad

Esta implementación controla la navegación y presentación frontend. El código,
las rutas y los assets descargados al navegador no son una frontera de seguridad.
No se afirma que las APIs ni las bases de datos estén protegidas. El backend
debe verificar los tokens y autorizar operaciones; las reglas de Firebase deben
restringir lecturas directas. La autenticación frontend por sí sola no limita
qué usuarios autenticados pueden operar sobre estos recursos.

No se añadió un interceptor de identidad para la API HTTP: su contrato y su
verificación quedan fuera del alcance frontend autorizado. No se alteran pedidos,
pagos, balances, cálculos financieros ni la implementación de sus servicios.
Logout no revierte ni garantiza cancelar operaciones ya enviadas al servidor.

La sesión usa `browserLocalPersistence`, gestionada por el SDK. No se guardan
manualmente tokens o contraseñas en localStorage.

## Desarrollo y pruebas reproducibles

Se conserva `environment.ts` preexistente. `environment.development.ts` es un
archivo nuevo con proyecto ficticio `demo-leds-local`. Angular lo sustituye
explícitamente en desarrollo y Karma. Producción mantiene su configuración.
Auth Emulator: `127.0.0.1:9099`; Firestore/Database/API continúan con destinos
locales en desarrollo. Los servicios que no estén emulados no tendrán datos.

Con Firebase CLI disponible:

```sh
npm run test:auth:local
```

Ese comando arranca únicamente Auth Emulator con `firebase.auth.local.json`,
ejecuta Karma/ChromeHeadless y lo detiene. No debe haber otro emulador usando
9099. Alternativamente, en dos terminales:

```sh
npm run emulators:auth
npm run test:auth
```

`npm start` inicia el frontend en desarrollo. No ejecutar el build de producción
como entorno de pruebas: utiliza la configuración productiva existente.

Las pruebas de integración crean exclusivamente cuentas `@example.test` en el
emulador local y eliminan sus propias cuentas al terminar.
Nunca importan la configuración productiva ni consultan información de clientes.
No se debe exponer Auth Emulator a redes públicas; sus tokens son de prueba.

## Validación realizada

- 33 pruebas de autenticación, guards, formulario y Auth Emulator: correctas.
- Incluyen acceso anónimo, login válido/inválido, usuario sin permiso, restauración
  de persistencia al recrear FirebaseApp, lazy loading, logout, cambio de permiso,
  errores de red y carreras entre login/token/logout.
- 16 regresiones existentes activas: correctas; se mantienen sus 8 propuestas
  financieras desactivadas y fuera de este alcance.
- 5 comprobaciones de seguridad: correctas.
- TypeScript de aplicación y specs: correcto.
- Build de producción: correcto, con advertencias existentes de CommonJS,
  selectores CSS y presupuesto inicial (aproximadamente 2,59 MB).
- Arranque real en Chrome aislado, entrando directamente a `/pedidos` como anónimo:
  termina en `/login`, muestra el login y no monta el layout administrativo;
  sin errores de ejecución. Revisión visual en 1440×1000 y 390×844.
- Lint: bloqueado porque ESLint no está disponible en la instalación local.

## Archivos

- `src/app/auth/`: servicio, adaptador SDK, guards, coordinación de navegación,
  login, pantalla de denegación/error, estilos y sus cuatro suites de pruebas.
- `src/app/app.module.ts`: provider Auth y conexión al emulador en desarrollo.
- `src/app/app-routing.module.ts`: árbol privado y nuevas rutas públicas.
- `src/app/app.component.ts`: inicialización del coordinador de sesión.
- Layout admin, navegación y nav-right: ocultación, retirada de links de demo y logout.
- `angular.json`, `environment.development.ts`, `firebase.auth.local.json`:
  aislamiento de desarrollo/tests sin tocar reglas de datos.
- `src/auth-test.ts`, `tsconfig.auth.json`, `package.json`: ejecutores de pruebas.
- `scripts/security.test.mjs`: comprueba el reemplazo de entorno y destinos locales.

No hubo merge, push, publicación ni despliegue. No se trabajó en
`admin-BE-encargos` ni se modificó una rama productiva.
