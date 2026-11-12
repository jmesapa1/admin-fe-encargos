# Fase 0: aislamiento local y artefactos

Desarrollo y Karma usan exclusivamente el proyecto ficticio `demo-leds-local`.
Firestore apunta a `127.0.0.1:8080`, Realtime Database a `127.0.0.1:9000`
y la API HTTP a `127.0.0.1:5001`. No existe fallback a producción.
La API conserva el contrato de rutas existente, incluido el segmento `app`
agregado por los servicios; no se alteran reglas financieras.

El backend y sus reglas no están disponibles en este repositorio. Para pruebas
funcionales hay que proporcionar mocks o un entorno de emuladores con datos
sintéticos. Un emulador de Hosting por sí solo no proporciona esos servicios.
Las previews de PR usan también el entorno local: las operaciones requieren
mocks/emuladores y no funcionan como una instancia conectada al negocio.

No se modifican los destinos del build de producción ni se ejecutan despliegues.
Los workflows existentes conservan sus triggers; antes de publicar comprueban
la configuración de seguridad y el artefacto generado.

## Publicación

Angular excluye todos los JSON de assets tanto en build como en Karma. Hosting
los excluye también. El JSON histórico permanece intacto en el repositorio:
estos controles no eliminan copias publicadas ni el historial de Git.
No utilizarlo como fixture ni abrirlo para pruebas.

`npm run test:security` verifica las exclusiones, el entorno local y el detector
de artefactos con archivos completamente ficticios. `npm run build` y
`npm run build-prod` ejecutan después `check:artifact`, que rechaza JSON en
assets, archivos de credenciales conocidos y enlaces simbólicos. El detector
no imprime rutas ni contenidos rechazados y no sustituye una auditoría completa
de secretos. Las invocaciones directas de `ng build` no ejecutan hooks de npm:
CI y las publicaciones deben utilizar los scripts npm y el detector.

## Pendientes

- Auditar localmente reglas y Functions cuando se suministren; no inferir sus
  permisos por la ausencia de autenticación del frontend.
- Implementar autenticación después de acordar roles y contratos del backend.
- Verificar exposición histórica con autorización separada.
- Fase 1: reproducir balance fuera de orden, doble envío, importes inválidos,
  timeout tras pago, concurrencia y estados sobre pedidos filtrados usando mocks.
- No modificar fórmulas financieras sin presentar pruebas y obtener aprobación.

## Validación de esta fase

- Cinco pruebas de seguridad: correctas.
- TypeScript de la aplicación (`tsconfig.app.json`, sin emitir): correcto.
- Builds de producción y desarrollo: correctos; ambos pasan `check:artifact`.
- El respaldo histórico no está en el artefacto generado.
- Producción conserva advertencias de CommonJS, selectores CSS y presupuesto
  inicial (aproximadamente 2,49 MB). No se cambian presupuestos para ocultarlas.
- Karma no llega a ejecutar tests: el spec existente del interceptor importa
  `loaderIntercpetorInterceptor`, que no está exportado. Pendiente de fase 1.
- Lint no puede ejecutar ESLint: la instalación local no dispone de ese paquete.
  No se modificaron dependencias ni se instaló software durante esta fase.
- No se arrancó la aplicación ni se hicieron pruebas funcionales sobre Firebase.
  La conexión a emuladores está comprobada por configuración y compilación;
  su integración funcional queda pendiente del entorno sintético.
