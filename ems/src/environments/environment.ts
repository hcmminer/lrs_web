// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: "v01ems",
  USERDATA_KEY: "authf649fc9a5f55",
  isMockEnabled: false,
  // apiUrl: 'http://10.120.44.68:8095/cms-gw/api/v1/redirect', // dev
  // apiUrl: 'https://183.182.118.7:8095/cms-gw/api/v1/redirect', // dev
  // apiUrl: 'https://technical.unitel.com.la:8095/cms-gw/api/v1/redirect', // dev
  // apiUrl: 'http://10.120.137.6:8095/cms-gw/api/v1/redirect', // dev
  // apiUrl: 'https://10.120.137.100:8095/cms-gw/api/v1/redirect/loginAuthentication',
  // apiReportUrl: 'http://10.120.44.68:8086/cms-gw/api/v1/redirect',
  // apiReportUrl: 'http://183.182.100.186:8086/report',
  // WS_BASE_URL: 'http://10.36.209.68:8889/kafka-consumer/ws-notification',
  WS_BASE_URL: "https://123.31.20.76:8080/kafka-consumer/ws-notification",
  // WS_BASE_URL: 'http://localhost:8081/ws-notification',
  defaultLanguage: "vi",
  siteKey: "6LfhzDscAAAAABgJweEE_WN5e6ZgtfQZGqYiQJPW",
  // apiUrl: "http://10.120.44.68:8095/cms-gw/api/v1/redirect",
  apiUrl: "http://localhost:8080/api/v1/redirect",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
