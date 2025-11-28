// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabase: {
    url: 'https://liwszjdrqqnxcforrmar.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpd3N6amRycXFueGNmb3JybWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzQ1OTksImV4cCI6MjA3OTUxMDU5OX0.q8Lj2wqvNVH6lRAqrnNTQG93I1fAAZltAB_EoWf-uQk'
  },
  firebase: {
    apiKey: "AIzaSyBY48U0AQJRivsfxHx2kNkgvmB3IWcG22Y",
    authDomain: "ar-app-aee80.firebaseapp.com",
    projectId: "ar-app-aee80",
    storageBucket: "ar-app-aee80.firebasestorage.app",
    messagingSenderId: "974917817002",
    appId: "1:974917817002:web:1ab35412e03f529b2bf6d3"
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
