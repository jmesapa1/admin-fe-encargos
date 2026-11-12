import packageInfo from '../../package.json';

// Local development and tests must never fall back to a real Firebase project.
export const environment = {
  appVersion: packageInfo.version,
  production: false,
  useEmulators: true,
  apiUrl: 'http://127.0.0.1:5001/demo-leds-local/us-central1/app/',
  firebaseConfig: {
    apiKey: 'demo-local-key',
    authDomain: 'demo-leds-local.firebaseapp.com',
    databaseURL: 'https://demo-leds-local-default-rtdb.firebaseio.com',
    projectId: 'demo-leds-local',
    storageBucket: 'demo-leds-local.appspot.com',
    messagingSenderId: '000000000000',
    appId: 'demo-local-app'
  }
};
