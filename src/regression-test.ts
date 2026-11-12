import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
import './app/regression/stabilization.spec';
import './app/interceptors/loader-intercpetor.interceptor.spec';
import './app/regression/amount-policy.proposal.spec';
