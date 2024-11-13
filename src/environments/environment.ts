// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  //apiUrl: 'http://127.0.0.1:5001/los-encargos-de-salomon-79854/us-central1/app/',
  apiUrl:'https://us-central1-los-encargos-de-salomon-79854.cloudfunctions.net/app/',
  firebaseConfig : {
    apiKey: "AIzaSyA1cZXgTjXmdnHHYiudgtIxOOFL6His36c",
    authDomain: "los-encargos-de-salomon-79854.firebaseapp.com",
    databaseURL: "https://los-encargos-de-salomon-79854-default-rtdb.firebaseio.com",
    //databaseURL: "http://127.0.0.1:9000/?ns=los-encargos-de-salomon-79854-default-rtdb",
    projectId: "los-encargos-de-salomon-79854",
    storageBucket: "los-encargos-de-salomon-79854.appspot.com",
    messagingSenderId: "1096412436909",
    appId: "1:1096412436909:web:9b5a6a7153a7f1e2f3e924",
    measurementId: "G-X1L3Y3HF5N"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
