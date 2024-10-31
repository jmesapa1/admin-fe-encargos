import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  //apiUrl: 'http://localhost:4200',
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
